"use client";

import { CopyButton } from "@/components/www/copy-button";
import { CodeCanvas } from "@/components/www/file-explorer/code-canvas";
import { CardHeader } from "@/components/www/file-explorer/card-header";
import { cn } from "@/lib/utils";
import { SquareTerminalIcon } from "lucide-react";
import { CodeCard } from "@/components/www/code-card";
import SyntaxHighlighterClient from "@/components/www/syntax-highlighter/client";
import { usePackageManager } from "@/components/www/package-manager-providers";

type packageManagers = "pnpm" | "npm" | "bun" | "yarn";
export function Terminal({
  packageManagerCommands,
}: {
  packageManagerCommands: Record<packageManagers, string>;
}) {
  const { packageManager: currentPackageManager, handleClick } =
    usePackageManager();
  return (
    <CodeCard>
      <CardHeader>
        <SquareTerminalIcon className="size-5" />
        <CardHeader.FlexOneFlex className="gap-x-0.5 md:gap-x-0.5">
          {Object.keys(packageManagerCommands).map((tab) => (
            <button
              key={tab}
              className={cn(
                "focus-visible:ring-ring rounded-md px-1.5 py-1 focus-visible:opacity-75 focus-visible:ring-1 focus-visible:outline-0 focus-visible:ring-inset",
                currentPackageManager === tab
                  ? "decoration-foreground underline decoration-2 underline-offset-3"
                  : "hover:opacity-75",
              )}
              onClick={() => handleClick(tab as packageManagers)}
            >
              {tab}
            </button>
          ))}
        </CardHeader.FlexOneFlex>
        <CopyButton
          codeString={packageManagerCommands[currentPackageManager]}
        />
      </CardHeader>
      <CodeCanvas className="!h-fit overflow-auto rounded-lg">
        <SyntaxHighlighterClient
          codeString={packageManagerCommands[currentPackageManager]}
          Loader={
            <pre>
              <code>{packageManagerCommands[currentPackageManager]}</code>
            </pre>
          }
        />
      </CodeCanvas>
    </CodeCard>
  );
}
