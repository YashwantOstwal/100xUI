import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import { TailwindCSSClassname } from "./file-explorer/file-explorer.types";
export type DescriptionProps = TailwindCSSClassname & ComponentProps<"p">;
export default function Description({
  className,
  children = "Description",
  ...rest
}: DescriptionProps) {
  return (
    <p
      className={cn(
        "text-base text-(--muted-foreground) 2xl:text-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
