import { cache } from "react";
import { splashColor } from "@/lib/splash";

// Revalidates with the site layout, so an app's new splash color shows within the hour
const REVALIDATE_SECONDS = 3600;

/** The background color of an app's published splash screen, or null when it can't be fetched or read. */
export const getSplashColor = cache(async (src: string): Promise<string | null> => {
  try {
    const response = await fetch(src, { next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(5000) });
    return response.ok ? splashColor(await response.text()) : null;
  } catch {
    return null;
  }
});
