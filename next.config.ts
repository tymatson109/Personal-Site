import type { NextConfig } from "next";
import { MEDIA_FOLDER, MEDIA_HOST_SUFFIX } from "./lib/media";

const nextConfig: NextConfig = {
  images: {
    // The same rule lib/media.ts applies to saved blocks: only files uploaded to this site's Blob store
    remotePatterns: [{ protocol: "https", hostname: `*${MEDIA_HOST_SUFFIX}`, port: "", pathname: `/${MEDIA_FOLDER}/**`, search: "" }],
  },
};

export default nextConfig;
