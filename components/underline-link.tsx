"use client";
import React, { ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { HTMLMotionProps, motion } from "motion/react";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

export const UnderlineLink = ({
  className,
  children,
  ...rest
}: LinkProps & {
  className?: string;
  children: ReactNode;
} & HTMLMotionProps<"a">) => (
  <MotionLink
    initial="initial"
    whileFocus="whileFocus"
    whileHover="whileHover"
    animate="animate"
    className={cn(
      "inline w-fit focus-visible:!outline-0",
      className,
      "relative flex-nowrap text-nowrap",
    )}
    {...rest}
  >
    {children}
    <motion.div
      className="bg-foreground absolute -bottom-0.5 h-0.5"
      variants={{
        initial: { width: "0%", right: "0px", left: "auto" },
        whileFocus: { width: "100%", left: "0px", right: "auto" },
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
  </MotionLink>
);
