import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
import * as React from "react";
import { MotionStyle } from "motion/react";

interface UnderlineText {
  style?: MotionStyle;
  className?: string;
  children: React.ReactNode;
  isParentFocused: boolean;
}
export default function UnderlineText({
  children,
  className,
  style,
  isParentFocused,
  ...rest
}: UnderlineText) {
  return (
    <motion.div
      initial="initial"
      whileHover="whileHover"
      animate={isParentFocused ? "whileHover" : "initial"}
      className={cn("relative w-fit focus-visible:!outline-none", className)}
      style={{ ...style }}
      {...rest}
    >
      {children}
      <motion.div
        className="bg-foreground absolute bottom-0 h-0.5"
        variants={{
          initial: { width: "0%", right: "0px", left: "auto" },
          whileHover: { width: "100%", left: "0px", right: "auto" },
        }}
        transition={{
          left: {
            duration: 0,
          },
          right: {
            duration: 0,
          },
          default: {
            ease: "easeOut",
          },
        }}
      />
    </motion.div>
  );
}
