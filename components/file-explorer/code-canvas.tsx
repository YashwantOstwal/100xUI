import React from "react";
import { cn } from "@/lib/utils";

export function CodeCanvas({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-foreground shiki relative flex h-110 overflow-clip rounded-xl shadow-[0px_8px_12px_-4px_rgba(16,12,12,0.08),0px_0px_2px_0px_rgba(16,12,12,0.10),0px_1px_2px_0px_rgba(16,12,12,0.10)] max-md:max-h-[60vh] md:h-150 dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] [&_pre]:min-h-full [&_pre]:w-full [&_pre]:p-3 [&_pre]:md:p-4",
        className,
        // brightness-105 dark:brightness-110
      )}
      {...rest}
    />
  );
}
