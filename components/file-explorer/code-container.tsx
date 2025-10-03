"use client";
import * as React from "react";

import type { EnhancedDirectoryItem } from "./file-explorer.types";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import ArrowDownIcon from "./icons/ArrowDown"; //import this from lucide

import CloseIcon from "./icons/CloseIcon"; // import this from lucide
import FileTree from "./file-tree";
import { useActiveFile } from "./providers/ActiveFileProvider";
import { CodeCanvas } from "./code-canvas";

import {
  useCopiedFiles,
  useIsCopyTrackerOn,
} from "./providers/CopiedFilesTrackerProvider";
import SyntaxHighlighterClient from "../syntax-highlighter/client";
import FileExtensionIcon from "./file-extension";
import { CopyButton } from "../copy-button";
import { cn } from "@/lib/utils";
import { CodeCard } from "../code-card";

export function CodeContainer({
  enhancedRootDirectory,
}: {
  enhancedRootDirectory: EnhancedDirectoryItem[];
}) {
  const [open, setOpen] = React.useState(false); //mobile
  const {
    activeFile: { absolutePath, code },
  } = useActiveFile();
  const { isCopyTrackerOn } = useIsCopyTrackerOn();
  const { dispatchCopiedFiles } = useCopiedFiles();

  const onCopyClick = () => {
    if (isCopyTrackerOn) {
      dispatchCopiedFiles({
        type: "ADD",
        items: [absolutePath],
      });
    }
  };

  return (
    <>
      <CodeCard
        className="md:rounded-r-lg"
        //  md:shadow-lg shadow-md  md:rounded-lg
      >
        <CardHeader>
          <motion.button
            onClick={() => setOpen((prev) => !prev)}
            className="bg-secondary text-secondary-foreground hover:bg-accent/85 hover:text-accent-foreground/85 size-6 shrink-0 rounded-full transition-colors duration-100 ease-out md:hidden"
          >
            <ArrowDownIcon openSubtree={open} />
          </motion.button>
          <CardHeader.FlexOneFlex>
            <FileExtensionIcon fileName={absolutePath} />
            {absolutePath}
          </CardHeader.FlexOneFlex>
          <CopyButton codeString={code} onClick={onCopyClick} />
        </CardHeader>
        <CodeCanvas className="//[&_*]:[scrollbar-width:thin] md:rounded-l-lg md:rounded-r-sm [&_pre]:overflow-auto">
          <SyntaxHighlighterClient
            codeString={code}
            Loader={
              <pre>
                <code>{code}</code>
              </pre>
            }
          />
        </CodeCanvas>
      </CodeCard>
      <MotionConfig transition={{ ease: "easeInOut" }}>
        <AnimatePresence>
          {open && (
            <motion.div
              onClick={() => setOpen((prev) => !prev)}
              initial="fadeOut"
              exit="fadeOut"
              animate="fadeIn"
              variants={{
                fadeOut: { backdropFilter: "blur(0px)", opacity: 0 },
                fadeIn: { backdropFilter: "blur(1px)", opacity: 1 },
              }}
              className="bg-background/20 absolute inset-0 z-20 overflow-hidden rounded-[inherit] md:hidden"
            >
              <div className="bg-secondary text-secondary-foreground hover:bg-accent/85 hover:text-accent-foreground/85 absolute top-2 right-2 rounded-full p-1 transition-colors duration-100 ease-out">
                <CloseIcon className="size-5" />
              </div>
              <motion.div
                initial="moveOut"
                exit="moveOut"
                animate="moveIn"
                variants={{
                  moveOut: { x: "-100%" },
                  moveIn: { x: "0%" },
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background relative h-full w-[85%] max-w-75 p-1"
              >
                <div className="p-2 font-medium">Files</div>
                <FileTree rootDirectory={enhancedRootDirectory} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}

export function CardHeader({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "flex items-center justify-between gap-2 px-1 py-1.5 font-medium",
        className,
      )}
    />
  );
}

CardHeader.FlexOneFlex = function CardHeaderFlexOneFlex({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-1 items-center gap-1 overflow-auto text-nowrap whitespace-nowrap md:gap-2 [&>svg]:shrink-0",
        className,
      )}
    />
  );
};
