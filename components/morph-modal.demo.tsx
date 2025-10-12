"use client";

import { PlayIcon } from "lucide-react";

import {
  MorphModal,
  MorphModalTrigger,
  MorphModalContent,
  MorphModalOverlay,
} from "@/components/morph-modal";

export function MorphModalDemo() {
  return (
    <MorphModal transition={{ ease: "easeInOut" }}>
      <MorphModalTrigger className="bg-secondary text-secondary-foreground border-border/50 rounded-full border px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          Watch demo
          <PlayIcon className="fill-foreground stroke-foreground bg-background box-content size-3.5 rounded-full p-1" />
        </div>
      </MorphModalTrigger>
      <MorphModalOverlay className="z-50">
        <MorphModalContent className="bg-muted border-border/50 m-2 rounded-xl border p-1">
          <iframe
            className="aspect-[560/315] max-w-full rounded-lg"
            width="768px"
            height="auto"
            src="https://www.youtube.com/embed/aWBiZc5XKJM?si=muuRWjXzomYeoQ2K"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </MorphModalContent>
      </MorphModalOverlay>
    </MorphModal>
  );
}
