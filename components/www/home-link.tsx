"use client";

import { UnderlineLink } from "./underline-link";
import { ArrowLeftIcon } from "lucide-react";
export function HomeLink() {
  return (
    <UnderlineLink
      href="/"
      className="flex items-center px-0.5 pt-1 pb-0 text-sm font-medium"
      variants={{
        initial: { gap: "4px" },
        whileHover: { gap: "6px", x: "-2px" },
        whileFocus: { gap: "6px", x: "-2px" },
      }}
      transition={{ ease: "easeInOut" }}
    >
      <ArrowLeftIcon className="size-4" />
      Back
    </UnderlineLink>
  );
}
