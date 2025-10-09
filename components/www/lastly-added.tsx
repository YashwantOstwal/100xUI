"use client";
import React, { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionLinkUnderline } from "../motion-link";

function LastlyAdded({
  lastAddedDate,
  href,
}: {
  lastAddedDate: Date;
  href: string;
}) {
  const [textContent, setTextContent] = useState("Lastly added 0 hours ago");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastAddedDate.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 1) {
      setTextContent(
        `Lastly added ${hours} ${hours === 1 ? "hour" : "hours"} ago`,
      );
    } else {
      const minutes = Math.floor(diffMs / (1000 * 60));
      setTextContent(
        `Lastly added ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`,
      );
    }
    setIsMounted(true);
  }, [lastAddedDate]);

  return (
    <MotionLinkUnderline
      href={href}
      className={cn(
        "group my-auto flex items-center gap-x-2 text-sm transition-opacity",
        isMounted ? "opacity-100" : "opacity-0",
      )}
      // variants={{
      //   initial: { opacity: 0, gap: "4px" },
      //   // animate: { opacity: isMounted ? 1 : 0 },
      //   whileHover: { gap: "6px" },
      //   whileFocus: { gap: "6px" },
      // }}
    >
      {textContent}
      <ArrowRightIcon className="size-4 -translate-x-0.5 transition-transform ease-out group-hover:translate-x-0 group-focus-visible:translate-x-0" />
    </MotionLinkUnderline>
  );
}

export default LastlyAdded;
