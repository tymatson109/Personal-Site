import { RingCursor } from "@/components/site/RingCursor";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSections } from "@/features/content/queries";
import { navLinks } from "@/lib/nav";

// Pages are static; publishing refreshes them, and this hourly pass catches anything changed outside the admin
export const revalidate = 3600;

/** Public pages share the header, footer and motion; the admin gets its own layout later. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader links={navLinks(await getSections())} />
      <main>{children}</main>
      <SiteFooter />
      <ScrollReveal />
      <RingCursor />
    </>
  );
}
