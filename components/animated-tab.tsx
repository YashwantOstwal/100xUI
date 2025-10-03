"use client";

import React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { useAnimatedTabs } from "./animated-tabs-provider";

const DURATION = 0.5;
export default function AnimatedTab({
  trackerFor,
  className,
  children,
}: {
  trackerFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  const state = useAnimatedTabs();
  return (
    <div
      className={cn(
        "size-5",
        className,
        "relative grid shrink-0 place-items-center",
      )}
    >
      {state === trackerFor && (
        <motion.div
          layoutId="box"
          transition={{
            layout: {
              duration: DURATION,
              ease: "easeInOut",
            },
          }}
          className="dark:bg-primary/70 bg-primary/50 absolute inset-0 z-[40] rounded-full"
        />
      )}
      <div
        // initial={{ opacity: 0 }}
        // animate={{ opacity: state === trackerFor ? 1 : 0 }}
        // transition={{
        //   duration: DURATION * 0.175,
        //   delay: state === trackerFor ? DURATION * (1 - 0.175) : 0,
        //   ease: "easeInOut",
        // }}
        className="text-background relative z-[50] font-mono text-xs select-none"
      >
        {children}
      </div>
    </div>
  );
}
