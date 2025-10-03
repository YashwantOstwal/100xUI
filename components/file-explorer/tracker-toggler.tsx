"use client";
import React from "react";
import {
  useCopiedFiles,
  useIsCopyTrackerOn,
} from "./providers/CopiedFilesTrackerProvider";
import Button from "./button";
import { usePrevious } from "@/hooks/use-previous";

export const TrackerToggler = () => {
  const { isCopyTrackerOn, toggleCopyTrackerMode } = useIsCopyTrackerOn();
  const prevTrackerStatus = usePrevious(isCopyTrackerOn);
  const { dispatchCopiedFiles } = useCopiedFiles();

  return (
    <>
      {!isCopyTrackerOn ? (
        <Button
          className="relative cursor-pointer"
          onClick={() => toggleCopyTrackerMode()}
        >
          Track my copies
          {prevTrackerStatus !== true && (
            <svg
              className="fill-destructive pointer-events-none absolute top-0 right-0 size-4 translate-x-1/4 -translate-y-1/4"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="12" opacity="0.15"></circle>
              <circle
                cx="12"
                cy="12"
                r="6.5"
                className="animate-pulse"
              ></circle>
            </svg>
          )}
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button
            className="cursor-pointer"
            onClick={() => {
              dispatchCopiedFiles?.({ type: "RESET" });
              toggleCopyTrackerMode?.();
            }}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => dispatchCopiedFiles?.({ type: "RESET" })}
          >
            Reset
          </Button>
        </div>
      )}
    </>
  );
};
