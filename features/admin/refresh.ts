import { revalidatePath } from "next/cache";

/** Rebuilds every static public page on its next visit, since the nav and previews on each can show what an admin save changed. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
