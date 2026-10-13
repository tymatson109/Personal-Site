import type { Metadata } from "next";
import { PageHeading } from "@/components/site/PageHeading";

export const metadata: Metadata = { title: "About" };

// About content arrives in PR 3
export default function AboutPage() {
  return <PageHeading title="About" />;
}
