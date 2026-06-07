"use client";
import Navbar, { NavbarContainer } from "@/components/www/navbar";
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
      {pathname !== "/components/in-page-navbar" && (
        <NavbarContainer>
          <Navbar></Navbar>
        </NavbarContainer>
      )}
      {children}
    </>
  );
}
