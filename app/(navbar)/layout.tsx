"use client";
import Navbar from "@/components/www/navbar";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      {children}
      {pathname !== "/components/in-page-navbar" && <Navbar />}
    </>
  );
}
