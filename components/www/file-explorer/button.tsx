import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  className?: string;
  buttonWrapperClassName?: string;
} & React.ComponentPropsWithoutRef<T>;

export default function Button<T extends React.ElementType = "button">({
  as,
  className,
  buttonWrapperClassName,
  ...rest
}: ButtonProps<T>) {
  const Comp = as || "button";

  return (
    <div
      className={cn(
        "bg-background/75 border-border/50 focus-visible:ring-ring flex w-fit items-center justify-center rounded-full p-0.5 text-sm shadow-sm backdrop-blur-[2px]",
        buttonWrapperClassName,
      )}
    >
      <Comp
        {...rest}
        className={cn(
          "bg-secondary text-secondary-foreground border-border/50 focus-visible:ring-ring focus-visible:ring-offset-background hover:bg-accent/85 hover:text-accent-foreground/85 focus-visible:text-accent-foreground/85 focus-visible:bg-accent/85 flex items-center justify-center rounded-full border px-3 py-1.5 transition-colors duration-150 ease-out hover:brightness-[97%] focus-visible:ring focus-visible:ring-offset-2 focus-visible:outline-0 focus-visible:brightness-[97%] dark:hover:brightness-90 dark:focus-visible:brightness-90",
          className,
        )}
      />
    </div>
  );
}
