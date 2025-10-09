import LogoIcon from "@/icons/logo.icon";
import { MotionLinkUnderline } from "../motion-link";
import { XIcon } from "@/icons/x.icon";
export function Footer() {
  return (
    <footer className="divide-border mt-24 flex flex-col divide-y divide-dashed text-sm">
      <div className="flex items-center gap-x-6 py-4">
        <LogoIcon />
        <p className="italic">Reusable motion components for React.</p>
      </div>
      <div className="py-4">
        Building in public.&nbsp;
        <MotionLinkUnderline
          href="https://x.com/Yashwant_Ostwal"
          target="_blank"
          rel="nopenner noreferrer"
          className="group relative mt-0.5 flex items-center gap-x-1"
        >
          Get notified. New drops every 72h.
          <XIcon className="group-focus-visible::-translate-y-0.5 size-3 h-[1lh] origin-bottom transition-transform ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-focus-visible:scale-110" />
        </MotionLinkUnderline>
      </div>
    </footer>
  );
}
