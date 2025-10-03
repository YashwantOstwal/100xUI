import LogoIcon from "@/icons/logo.icon";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { ViewGithub } from "./view-github";
export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center lg:pointer-events-none">
      <div className="w-full max-w-screen-2xl px-0 lg:px-4.25">
        <div className="max-lg:bg-background/40 flex items-center justify-between py-0 max-lg:backdrop-blur-[2px]">
          <Link
            href="/"
            className="focus-visible:ring-ring block w-fit rounded-md p-2 px-3 outline-0 focus-visible:ring-1 focus-visible:ring-inset max-lg:p-1.5 max-lg:px-3 lg:pointer-events-auto"
          >
            <LogoIcon />
          </Link>
          <div className="flex gap-3 lg:pointer-events-auto">
            <ViewGithub />
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
