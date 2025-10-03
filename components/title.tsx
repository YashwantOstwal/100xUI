import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { TailwindCSSClassname } from "./file-explorer/file-explorer.types";

export type TitleProps = TailwindCSSClassname & ComponentProps<"h1">;
export default function Title({
  className,
  children = "Title",
  ...rest
}: TitleProps) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold tracking-tight sm:text-3xl",
        className,
      )}
      {...rest}
    >
      {children}
    </h1>
  );
}
