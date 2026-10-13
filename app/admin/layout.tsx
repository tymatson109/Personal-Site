import type { Metadata } from "next";

// The admin is for Ty only, so search engines are told to skip it
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <main>{children}</main>;
}
