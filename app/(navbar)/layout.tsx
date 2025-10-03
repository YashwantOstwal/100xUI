"use client";
import Navbar from "@/components/navbar";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavbarLayout({
  children,
}: {
  children: Readonly<{ children: React.ReactNode }>;
}) {
  const pathname = usePathname();
  return (
    <>
      {children}
      {pathname !== "/components/in-page-navbar" && <Navbar />}
    </>
  );
}
