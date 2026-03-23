"use client";
import { useRef, useState } from "react";
import { HxuiButton, HxuiButtonGroup } from "./file-explorer/button";
import TextMorph from "./text-morph";
// import { useCopiedFiles } from "@/components/file-explorer/providers/CopiedFilesTrackerProvider";
import { HTMLMotionProps } from "motion/react";

interface CopyButtonProps extends HTMLMotionProps<"button"> {
  codeString: string;
}
export const CopyButton = ({ codeString, onClick }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const controlInterval = useRef<NodeJS.Timeout>(undefined);

  const handleCopy = async (codeString: string) => {
    clearTimeout(controlInterval.current);
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    controlInterval.current = setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <HxuiButtonGroup>
      <HxuiButton
        className="relative h-8 w-20 gap-0 p-0"
        // h-8
        onClick={(e) => {
          handleCopy(codeString);
          onClick?.(e);
        }}
      >
        <TextMorph copied={copied}>{copied ? "Copied!" : "Copy"}</TextMorph>
      </HxuiButton>
    </HxuiButtonGroup>
  );
};
