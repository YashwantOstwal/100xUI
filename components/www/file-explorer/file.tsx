"use client";
import { cn } from "@/lib/utils";
import {
  useCopiedFiles,
  useIsCopyTrackerOn,
} from "./providers/CopiedFilesTrackerProvider";
import { useActiveFile } from "./providers/ActiveFileProvider";
import type { EnhancedFile } from "./file-explorer.types";
import ArrowDownIcon from "./icons/ArrowDown";
import FileIcon from "./icons/File";

export default function File({
  name,
  level,
  absolutePath,
  code,
}: EnhancedFile & {
  level: number;
}) {
  const { isCopyTrackerOn } = useIsCopyTrackerOn();
  const { activeFile, setActiveFile } = useActiveFile();
  const { copiedFiles, dispatchCopiedFiles } = useCopiedFiles();
  const isActive = activeFile.absolutePath === absolutePath;
  const isFileCopied = copiedFiles.includes(absolutePath);
  return (
    <button
      style={{ paddingLeft: `calc(${level} * var(--indent))` }}
      className={cn(
        "flex w-full items-center gap-1 rounded-md py-1",
        isActive
          ? isCopyTrackerOn
            ? isFileCopied
              ? "bg-green-300/55"
              : "bg-red-300/55"
            : "bg-accent text-accent-foreground"
          : isCopyTrackerOn
            ? isFileCopied
              ? "bg-green-300/25 hover:bg-green-300/40 focus-visible:bg-green-300/40"
              : "bg-red-300/25 hover:bg-red-300/40 focus-visible:bg-red-300/40"
            : "hover:bg-accent/80 dark:hover:bg-accent/60 hover:text-accent-foreground focus-visible:text-accent-foreground focus-visible:bg-accent/75",
      )}
      onClick={() => setActiveFile({ absolutePath, code })}
    >
      <ArrowDownIcon className="invisible" />
      <FileIcon />
      <span>{name}</span>
      {isCopyTrackerOn && (
        <input
          className="size-3.5 accent-green-600 dark:accent-green-400"
          onChange={(e) => {
            const isChecked = e.currentTarget.checked;
            dispatchCopiedFiles?.({
              type: isChecked ? "ADD" : "REMOVE",
              items: [absolutePath],
            });
          }}
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const newStatus = !e.currentTarget.checked;
            dispatchCopiedFiles?.({
              type: newStatus ? "ADD" : "REMOVE",
              items: [absolutePath],
            });
          }}
          checked={isFileCopied}
        />
      )}
    </button>
  );
}
