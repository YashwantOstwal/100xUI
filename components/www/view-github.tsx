"use client";

import * as React from "react";
import type { TailwindCSSClassname } from "./file-explorer/file-explorer.types";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import { cn } from "@/lib/utils";
import { GithubIcon } from "@/icons/github.icon";
export function ViewGithub({ className }: TailwindCSSClassname) {
  const stars = useMotionValue(0);
  const roundedToOneDecimal = useTransform(stars, (latest) =>
    latest.toFixed(1),
  );

  React.useEffect(() => {
    async function fetchAndAnimateStars() {
      const res = await fetch(
        "https://api.github.com/repos/YashwantOstwal/100xUI",
      );
      const data = await res.json();
      const starsCount = data.stargazers_count;
      if (typeof starsCount == "number")
        animate(stars, starsCount / 1000, { duration: 3 });
    }
    fetchAndAnimateStars();
  }, [stars]);
  return (
    <div className="bg-background/75 border-border/50 rounded-full border p-0.5 backdrop-blur-[2px] lg:pointer-events-auto">
      <a
        className={cn(
          "bg-secondary text-secondary-foreground border-border/50 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:bg-accent/85 focus-visible:text-accent-foreground/85 hover:bg-accent/85 hover:text-accent-foreground/85 flex items-center justify-center rounded-full border px-2 py-1 font-mono text-sm transition-colors duration-150 ease-out focus-visible:ring focus-visible:ring-offset-2 focus-visible:!outline-0 focus-visible:brightness-[97%] dark:hover:brightness-90 dark:focus-visible:brightness-90 [&>svg]:stroke-[2]",
          className,
        )}
        href="https://github.com/YashwantOstwal/100xui"
      >
        <GithubIcon className="mr-1.5 size-5" />
        <motion.span>{roundedToOneDecimal}</motion.span>k
      </a>
    </div>
  );
}
