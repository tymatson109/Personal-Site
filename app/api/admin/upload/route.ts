import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/features/admin/session";
import { largestUpload, MEDIA_FOLDER, uploadTypes } from "@/lib/media";

// Hands the browser a short-lived token to upload one file straight to Blob, so large recordings never pass through this server
export async function POST(request: Request): Promise<Response> {
  await requireAdmin();
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`${MEDIA_FOLDER}/`)) throw new Error("Uploads go in the media folder");
        return { allowedContentTypes: uploadTypes(), maximumSizeInBytes: largestUpload(), addRandomSuffix: true };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
