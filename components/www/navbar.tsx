import LogoIcon from "@/icons/logo.icon";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
// import { ViewX } from "./view-x";
import { ViewGithub } from "./view-github";
import { ConnectButton } from "@/components/connect-button";
import { IsAdminViewToggle } from "./file-explorer/is-admin-view-toggle";
export default function Navbar() {
  return (
    <div className="sticky inset-x-0 top-0 z-100 flex justify-center lg:pointer-events-none">
      <div className="max-lg:bg-background/40 flex w-full max-w-screen-2xl items-center justify-between px-3 max-lg:backdrop-blur-[2px]">
        <Link
          href="/"
          className="focus-visible:ring-ring block w-fit rounded-md py-2 outline-0 focus-visible:ring-1 focus-visible:ring-inset max-lg:py-1.5 lg:pointer-events-auto"
        >
          <LogoIcon />
        </Link>
        <div className="flex items-center gap-2 lg:pointer-events-auto">
          <IsAdminViewToggle />
          {/* <ViewX /> */}
          <ViewGithub />
          <ModeToggle className="" />
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
