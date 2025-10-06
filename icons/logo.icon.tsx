import { TailwindCSSClassname } from "@/components/www/file-explorer/file-explorer.types";
import { cn } from "@/lib/utils";
import React from "react";

const LogoIcon = ({
  className,
  style,
}: TailwindCSSClassname & { style?: React.CSSProperties }) => (
  <div
    className={cn(
      "text-foreground italc text-base leading-none font-bold",
      className,
    )}
    style={style}
  >
    100<span className="text-destructive">x</span>
    <div className="text-[38px] leading-[26px]">
      U<span className="text-destructive">I</span>
    </div>
  </div>
);

export default LogoIcon;
