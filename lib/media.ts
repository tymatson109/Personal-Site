import type { BlockType } from "@/types/entry";

// Uploaded files live only under media/ in this site's Vercel Blob store; next.config.ts allows the same for images
export const MEDIA_HOST_SUFFIX = ".public.blob.vercel-storage.com";
export const MEDIA_FOLDER = "media";

export type UploadBlockType = Extract<BlockType, "image" | "gallery" | "video">;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/quicktime"] as const;

const MB = 1024 * 1024;

/** What each upload block takes: which files, how many and how large. */
export const UPLOAD_RULES: Record<UploadBlockType, { types: readonly string[]; max: number; bytes: number }> = {
  image: { types: IMAGE_TYPES, max: 1, bytes: 20 * MB },
  gallery: { types: IMAGE_TYPES, max: 12, bytes: 20 * MB },
  video: { types: VIDEO_TYPES, max: 1, bytes: 200 * MB },
};

/** The longest side a photo keeps after it is shrunk in the browser before upload. */
export const MAX_IMAGE_SIDE = 2400;

export function isUploadBlockType(type: string): type is UploadBlockType {
  return type in UPLOAD_RULES;
}

/** True only for https files in this site's Blob store, so a saved block can't point anywhere else. */
export function isMediaUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.port && !url.username && !url.search && url.hostname.endsWith(MEDIA_HOST_SUFFIX) && url.pathname.startsWith(`/${MEDIA_FOLDER}/`);
  } catch {
    return false;
  }
}

/** Every content type the upload route accepts. */
export function uploadTypes(): string[] {
  return [...new Set(Object.values(UPLOAD_RULES).flatMap((rule) => rule.types))];
}

/** The largest file any block accepts, which caps every upload token. */
export function largestUpload(): number {
  return Math.max(...Object.values(UPLOAD_RULES).map((rule) => rule.bytes));
}

/** Scales a size down so its longer side is at most `max`, keeping the shape; small sizes stay as they are. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

/** Where a file goes in the store: a readable name from the original file, with the extension its type implies. */
export function uploadPath(fileName: string, type: string): string {
  const base = fileName
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${MEDIA_FOLDER}/${base || "file"}.${EXTENSIONS[type] ?? "bin"}`;
}

/** The message shown when a picked file can't go in a block, or null when it can. */
export function fileProblem(block: UploadBlockType, file: { type: string; size: number }): string | null {
  const rule = UPLOAD_RULES[block];
  if (!rule.types.includes(file.type)) {
    return block === "video" ? "Recordings can be MP4 or MOV videos." : "Images can be JPEG, PNG, WebP or GIF.";
  }
  if (file.size > rule.bytes) return `That file is larger than ${rule.bytes / MB} MB.`;
  return null;
}
