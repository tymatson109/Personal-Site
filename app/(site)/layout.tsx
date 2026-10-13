import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { navLinks } from "@/lib/nav";
import { SAMPLE_SECTIONS } from "@/lib/sample/sections";

/** Public pages share the header and footer; the admin gets its own layout later. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader links={navLinks(SAMPLE_SECTIONS)} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
