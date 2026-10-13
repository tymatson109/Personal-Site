import { upload } from "@vercel/blob/client";
import type { Media } from "@/types/entry";
import { fileProblem, fitWithin, MAX_IMAGE_SIDE, uploadPath, type UploadBlockType } from "@/lib/media";
import { recordUpload } from "./media-actions";

// Browser-only: reads, shrinks and uploads one picked file for the block editor

type Prepared = { body: Blob; type: string; width: number; height: number };

const MULTIPART_FROM = 20 * 1024 * 1024;
const JPEG_QUALITY = 0.86;

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("This image couldn't be prepared."))), type, JPEG_QUALITY),
  );
}

// Redrawing drops the photo's hidden details, such as where it was taken, and shrinks it to a size pages can use
async function prepareImage(file: File): Promise<Prepared> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new Error("This image couldn't be read.");
  });
  const size = fitWithin(bitmap.width, bitmap.height, MAX_IMAGE_SIDE);
  // GIFs keep their animation, so they upload as they are
  if (file.type === "image/gif") {
    bitmap.close();
    return { body: file, type: file.type, ...size };
  }
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  const body = await toBlob(canvas, file.type);
  // A browser that can't write the original type falls back to PNG, so the blob's own type is the true one
  return { body, type: body.type || file.type, ...size };
}

function prepareVideo(file: File): Promise<Prepared> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = () => URL.revokeObjectURL(url);
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      done();
      resolve({ body: file, type: file.type, width: video.videoWidth || 1, height: video.videoHeight || 1 });
    };
    video.onerror = () => {
      done();
      reject(new Error("This recording couldn't be read. Try saving it as an MP4."));
    };
    video.src = url;
  });
}

/** Checks, prepares and uploads one file, then records it; the result is ready to put in a block. */
export async function uploadMedia(block: UploadBlockType, file: File, onProgress: (percent: number) => void): Promise<Media> {
  const problem = fileProblem(block, file);
  if (problem) throw new Error(problem);
  const prepared = block === "video" ? await prepareVideo(file) : await prepareImage(file);
  const result = await upload(uploadPath(file.name, prepared.type), prepared.body, {
    access: "public",
    handleUploadUrl: "/api/admin/upload",
    contentType: prepared.type,
    multipart: prepared.body.size > MULTIPART_FROM,
    onUploadProgress: ({ percentage }) => onProgress(percentage),
  });
  const media: Media = { url: result.url, alt: "", width: prepared.width, height: prepared.height };
  await recordUpload(media, prepared.body.size);
  return media;
}
