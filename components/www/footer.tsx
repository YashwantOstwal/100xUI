import LogoIcon from "@/icons/logo.icon";
import * as motion from "motion/react-client";
import { UnderlineLink } from "./underline-link";

export function Footer() {
  return (
    <footer className="divide-border mt-24 flex flex-col divide-y divide-dashed text-sm">
      <div className="flex items-center gap-x-6 py-4">
        <LogoIcon />
        <p className="italic">Reusable motion components for React.</p>
      </div>
      <div className="py-4">
        Building in public.&nbsp;
        <UnderlineLink
          href="https://x.com/Yashwant_Ostwal"
          target="_blank"
          rel="nopenner noreferrer"
          className="relative mt-0.5 flex items-center gap-x-1 focus-visible:!outline-none"
        >
          Get notified. New drops every 72h.
          <motion.svg
            variants={{ whileHover: { y: "-2px", scale: 1.1 } }}
            width="1200"
            height="1227"
            className="size-3 origin-bottom"
            viewBox="0 0 1200 1227"
            fill="none"
          >
            <path
              d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
              fill="currentColor"
            />
          </motion.svg>
        </UnderlineLink>
      </div>
    </footer>
  );
}
