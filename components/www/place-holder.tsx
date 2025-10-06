import { cn } from "@/lib/utils";
import React, { CSSProperties, ReactNode } from "react";
import { PlusIcon } from "lucide-react";
export default function PlaceHolder({
  className,
  msg1,
  msg2,
  style,
  center = <PlusIcon />,
  index = 0,
  ...rest
}: {
  className?: string;
  msg1: React.ReactNode;
  msg2: React.ReactNode;
  style?: CSSProperties;
  index?: number;
  center?: React.ReactNode;
} & React.ComponentProps<"div">) {
  function Message({ children }: { children: ReactNode }) {
    return (
      <span className="absolute top-0.75 left-0.75 text-[9px] leading-none sm:text-xs">
        {children}
      </span>
    );
  }
  return (
    <div
      className={cn("p-7 opacity-85 sm:p-10", className)}
      style={{ backgroundColor: `var(--chart-${index + 1})`, ...style }}
      {...rest}
    >
      <div className="border-foreground relative size-full border border-dashed p-4 sm:p-5">
        <Message>{msg1}</Message>
        <div className="size-full p-3.5 sm:p-5">
          <div className="border-foreground relative z-20 size-full border p-4 sm:px-6 sm:py-5">
            <Message>{msg2}</Message>
            <div className="border-foreground relative grid size-full place-items-center overflow-hidden border border-dashed">
              {center}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
