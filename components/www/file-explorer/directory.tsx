"use client";
import { useState } from "react";
import { EnhancedDirectory, EnhancedFile } from "./file-explorer.types";
import {
  useCopiedFiles,
  useIsCopyTrackerOn,
} from "./providers/CopiedFilesTrackerProvider";
import { useActiveFile } from "./providers/ActiveFileProvider";
import { cn } from "@/lib/utils";
import ArrowDownIcon from "./icons/ArrowDown";
import DirectoryIcon from "./icons/Directory";
import File from "./file";
import sortDirectory from "./utils/sortDirectory";

export default function Directory({
  items,
  level,
  name,
  descendentFiles,
}: EnhancedDirectory & {
  level: number;
}) {
  const { isCopyTrackerOn } = useIsCopyTrackerOn();
  const { activeFile } = useActiveFile();
  const { copiedFiles, dispatchCopiedFiles } = useCopiedFiles();
  const [openSubtree, setOpenSubtree] = useState(
    () => !!(activeFile.absolutePath.split("/")[level] === name),
  );
  const handleSubTree = () => setOpenSubtree((prev) => !prev);

  const filesNotCopiedCount = descendentFiles.filter(
    (eachFile) => !copiedFiles.includes(eachFile),
  ).length;
  return (
    <div className="w-full space-y-0.5">
      <button
        className={cn(
          "hover:bg-accent/80 dark:hover:bg-accent/60 hover:text-accent-foreground focus-visible:text-accent-foreground focus-visible:bg-accent flex w-full items-center justify-between gap-1 rounded-md py-1 outline-none",
          isCopyTrackerOn &&
            (filesNotCopiedCount === 0
              ? "bg-green-300/25 hover:bg-green-300/40 focus-visible:bg-green-300/40 dark:hover:bg-green-300/40"
              : "bg-red-300/25 hover:bg-red-300/40 focus-visible:bg-red-300/40 dark:hover:bg-red-300/40"),
        )}
        style={{ paddingLeft: `calc(${level} * var(--indent))` }}
        onClick={handleSubTree}
      >
        <div className="flex items-center gap-1">
          <ArrowDownIcon openSubtree={openSubtree} />
          <DirectoryIcon />
          <span>{name}</span>
          {isCopyTrackerOn && (
            <input
              className="size-3.5 accent-green-600 dark:accent-green-400"
              onChange={(e) => {
                e.stopPropagation();
                const isChecked = e.currentTarget.checked;
                dispatchCopiedFiles?.({
                  type: isChecked ? "ADD" : "REMOVE",
                  items: descendentFiles,
                });
              }}
              type="checkbox"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key !== "Enter") return;
                const newStatus = !e.currentTarget.checked;
                dispatchCopiedFiles?.({
                  type: newStatus ? "ADD" : "REMOVE",
                  items: descendentFiles,
                });
              }}
              onClick={(e) => e.stopPropagation()}
              checked={filesNotCopiedCount === 0}
            />
          )}
        </div>

        {isCopyTrackerOn && !!filesNotCopiedCount && (
          <div
            className="mr-1.5 flex size-5 items-center justify-center rounded-md border border-[rgb(255,0,0)]/10 bg-red-500 bg-clip-border font-mono text-sm leading-none font-medium text-white shadow"
            // [text-shadow:0px_0px_10px_var(--color-destructive-foreground)] bg-destructive  text-destructive-foreground shadow-[0px_1px_4px_-1px_rgba(230,_0,_0,_0.38)] [text-shadow:0px_0px_7px_white]
          >
            {filesNotCopiedCount}
          </div>
        )}
      </button>
      {openSubtree ? (
        <div className="space-y-0.5">
          {items
            .sort(sortDirectory)
            .map((props, i) =>
              props.type === "file" ? (
                <File
                  key={`level-${level},id-${i}`}
                  {...(props as EnhancedFile)}
                  level={level + 1}
                />
              ) : (
                <Directory
                  key={`level-${level},id-${i}`}
                  {...(props as EnhancedDirectory)}
                  level={level + 1}
                />
              ),
            )}
        </div>
      ) : null}
    </div>
  );
}
