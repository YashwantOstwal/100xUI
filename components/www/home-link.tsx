"use client";

import { MotionLinkUnderline } from "../motion-link";
import { ArrowLeftIcon } from "lucide-react";
export function HomeLink() {
  return (
    <MotionLinkUnderline
      startDirection="right"
      endDirection="left"
      href="/"
      className="group flex items-center gap-x-2 px-0.5 pt-1 pb-0 text-sm font-medium"
    >
      <ArrowLeftIcon className="size-4 translate-x-0.5 transition-transform ease-in-out group-hover:translate-x-0 group-focus-visible:translate-x-0" />
      Back
    </MotionLinkUnderline>
  );
}
