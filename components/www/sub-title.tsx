import React, { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const SubTitle = ({ children, className, ...rest }: ComponentProps<"h2">) => (
  <h2
    className={cn(
      "text-xl font-semibold tracking-tight sm:text-2xl",
      className,
    )}
    {...rest}
  >
    {children}
  </h2>
);

export default SubTitle;
