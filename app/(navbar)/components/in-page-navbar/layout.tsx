import type { Metadata } from "next";
import { InPageNavbarDemo } from "@/components/in-page-navbar.demo";
import { ModeToggle } from "@/components/www/mode-toggle";

export const metadata: Metadata = {
  title: "In-Page-Navbar",
  description: "lorem impsum",
};

export default function InPageNavbarPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ModeToggle className="fixed top-14 right-3.5 z-[90] min-[804px]:!top-1.5 sm:top-15.5 lg:right-4" />
      <InPageNavbarDemo />
    </>
  );
}
