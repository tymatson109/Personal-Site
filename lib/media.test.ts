import { describe, expect, it } from "vitest";
import { fileProblem, fitWithin, isMediaUrl, isUploadBlockType, largestUpload, uploadPath, uploadTypes } from "./media";

describe("isMediaUrl", () => {
  it("accepts an https file in a Vercel Blob store", () => {
    expect(isMediaUrl("https://abc123.public.blob.vercel-storage.com/media/desk-x1.jpg")).toBe(true);
  });

  it("rejects other hosts, look-alike hosts, http, ports, query strings, other folders and non-strings", () => {
    expect(isMediaUrl("https://example.com/desk.jpg")).toBe(false);
    expect(isMediaUrl("https://public.blob.vercel-storage.com.evil.com/x.jpg")).toBe(false);
    expect(isMediaUrl("http://abc.public.blob.vercel-storage.com/x.jpg")).toBe(false);
    expect(isMediaUrl("https://abc.public.blob.vercel-storage.com:8443/x.jpg")).toBe(false);
    expect(isMediaUrl("https://abc.public.blob.vercel-storage.com/x.jpg?v=1")).toBe(false);
    expect(isMediaUrl("javascript:alert(1)")).toBe(false);
    expect(isMediaUrl("https://abc.public.blob.vercel-storage.com/other/x.jpg")).toBe(false);
    expect(isMediaUrl(42)).toBe(false);
  });
});

describe("fitWithin", () => {
  it("shrinks a wide photo so its width is the limit, keeping its shape", () => {
    expect(fitWithin(4800, 3200, 2400)).toEqual({ width: 2400, height: 1600 });
  });

  it("shrinks a tall photo so its height is the limit", () => {
    expect(fitWithin(3024, 4032, 2400)).toEqual({ width: 1800, height: 2400 });
  });

  it("leaves a photo that already fits at its own size", () => {
    expect(fitWithin(800, 600, 2400)).toEqual({ width: 800, height: 600 });
  });
});

describe("uploadPath", () => {
  it("names the file after the original, lowercased, with the extension of its type", () => {
    expect(uploadPath("IMG_0042 Final.HEIC", "image/jpeg")).toBe("media/img-0042-final.jpg");
  });

  it("falls back to a plain name when nothing readable is left", () => {
    expect(uploadPath("📷.mov", "video/quicktime")).toBe("media/file.mov");
  });
});

describe("fileProblem", () => {
  it("accepts a photo of an allowed type and size", () => {
    expect(fileProblem("image", { type: "image/jpeg", size: 1000 })).toBeNull();
  });

  it("explains which files a block takes when the type is wrong", () => {
    expect(fileProblem("image", { type: "video/mp4", size: 1000 })).toBe("Images can be JPEG, PNG, WebP or GIF.");
    expect(fileProblem("video", { type: "image/png", size: 1000 })).toBe("Recordings can be MP4 or MOV videos.");
  });

  it("says the limit when a file is too large", () => {
    expect(fileProblem("gallery", { type: "image/png", size: 21 * 1024 * 1024 })).toBe("That file is larger than 20 MB.");
  });
});

describe("upload limits", () => {
  it("knows which blocks take uploads, a live demo's splash screen included", () => {
    expect(isUploadBlockType("gallery")).toBe(true);
    expect(isUploadBlockType("demo")).toBe(true);
    expect(isUploadBlockType("p")).toBe(false);
  });

  it("takes one image as a live demo's splash screen and refuses a video", () => {
    expect(fileProblem("demo", { type: "image/png", size: 1000 })).toBeNull();
    expect(fileProblem("demo", { type: "video/mp4", size: 1000 })).toBe("Images can be JPEG, PNG, WebP or GIF.");
  });

  it("lists every accepted type once and caps uploads at the largest block limit", () => {
    expect(uploadTypes()).toEqual(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"]);
    expect(largestUpload()).toBe(200 * 1024 * 1024);
  });
});
