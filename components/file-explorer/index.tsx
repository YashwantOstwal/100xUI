import type {
  EnhancedDirectoryItem,
  FileExplorerProps,
} from "./file-explorer.types";
import ProjectDirectory from "./utils/projectDirectory";
import FileTree from "./file-tree";
import CopiedFilesTrackerProvider from "./providers/CopiedFilesTrackerProvider";
import ActiveFileProvider from "./providers/ActiveFileProvider";
import { CodeContainer } from "./code-container";
import { TrackerToggler } from "./tracker-toggler";
import { cn } from "@/lib/utils";

export default function FileExplorer({
  rootDirectory,
  defaultActiveFile,
  className,
  ...rest
}: FileExplorerProps) {
  const {
    enhancedRootDirectory,
  }: { enhancedRootDirectory: EnhancedDirectoryItem[] } = new ProjectDirectory(
    rootDirectory,
  );

  return (
    <ActiveFileProvider defaultActiveFile={defaultActiveFile}>
      <CopiedFilesTrackerProvider>
        <div
          className={cn(
            "md:bg-layout relative isolate flex w-full rounded-xl text-sm md:p-1.5 md:shadow-[0px_8px_12px_-4px_rgba(16,12,12,0.08),0px_0px_2px_0px_rgba(16,12,12,0.10),0px_1px_2px_0px_rgba(16,12,12,0.10)] dark:md:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_1px_rgba(255,255,255,0.05)_inset]",

            className,
            // md:p-1 shadow-md md:bg-card
          )}
          {...rest}
        >
          <div className="min-w-80 pr-2.5 max-md:hidden">
            <div className="flex items-center justify-between p-2 font-medium">
              100xui <TrackerToggler />
            </div>
            <FileTree rootDirectory={enhancedRootDirectory} />
          </div>
          <CodeContainer enhancedRootDirectory={enhancedRootDirectory} />
        </div>
      </CopiedFilesTrackerProvider>
    </ActiveFileProvider>
  );
}
