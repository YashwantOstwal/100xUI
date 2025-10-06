import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

export function CodeCard({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-muted text-foreground relative z-10 w-full flex-1 overflow-hidden rounded-xl p-1 text-sm shadow-[0px_8px_12px_-4px_rgba(16,12,12,0.08),_0px_0px_2px_0px_rgba(16,12,12,0.10),_0px_1px_2px_0px_rgba(16,12,12,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_1px_rgba(255,255,255,0.05)_inset]",
        // shadow-lg
        className,
      )}
      {...rest}
    />
  );
}
