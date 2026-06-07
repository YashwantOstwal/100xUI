import LogoIcon from "@/icons/logo.icon";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
// import { ViewX } from "./view-x";
import { ViewGithub } from "./view-github";
import { ConnectButton } from "@/components/connect-button";
import { IsAdminViewToggle } from "./file-explorer/is-admin-view-toggle";
import React from "react";
import { cn } from "@/lib/utils";
export default function Navbar() {
  return (
    <div className="max-lg:bg-background/40 pointer-events-auto flex w-full max-w-screen-2xl items-center justify-between px-3 max-lg:backdrop-blur-[2px]">
      <Link
        href="/"
        className="focus-visible:ring-ring block w-fit rounded-md py-2 outline-0 focus-visible:ring-1 focus-visible:ring-inset max-lg:py-1.5"
      >
        <LogoIcon />
      </Link>
      <div className="flex items-center gap-2">
        <IsAdminViewToggle />
        {/* <ViewX /> */}
        <ViewGithub />
        <ModeToggle className="" />
        <ConnectButton />
      </div>
    </div>
  );
}

export function NavbarContainer({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "pointer-events-none sticky inset-x-0 top-0 z-100 flex justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
