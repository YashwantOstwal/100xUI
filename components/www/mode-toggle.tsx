"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "motion/react-client";
export function ModeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  React.useEffect(() => setMounted(true), []);
  return (
    <div
      className={cn(
        "bg-background/75 border-border/50 mr-1 flex h-fit items-center justify-between gap-x-1 rounded-full border p-0.5 backdrop-blur-[2px] lg:pointer-events-auto",
        className,
      )}
    >
      <motion.button
        onClick={() => {
          setTheme((currTheme) => {
            const currThemePreset = currTheme.split("-")[1];
            return currTheme.startsWith("light") ||
              (currTheme === "system" && systemTheme === "light")
              ? currThemePreset
                ? `dark-${currThemePreset}`
                : "dark"
              : currThemePreset
                ? `light-${currThemePreset}`
                : "light";
          });
        }}
        className="bg-secondary text-secondary-foreground border-border/50 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:bg-accent/85 focus-visible:text-accent-foreground/85 hover:bg-accent/85 hover:text-accent-foreground/85 flex items-center gap-x-0.75 rounded-full border p-0.5 transition-colors duration-150 ease-out hover:brightness-[97%] focus-visible:ring focus-visible:ring-offset-2 focus-visible:!outline-0 focus-visible:brightness-[97%] dark:hover:brightness-90 dark:focus-visible:brightness-90 [&_svg]:size-6 [&_svg]:stroke-[2] [&_svg]:p-1"
      >
        <div
          className={cn(
            "rounded-full",
            mounted &&
              (theme?.startsWith("light") ||
                (theme === "system" && systemTheme === "light")) &&
              "bg-primary text-primary-foreground",
          )}
        >
          <SunIcon />
        </div>
        <div
          className={cn(
            "rounded-full",
            mounted &&
              (theme?.startsWith("dark") ||
                (theme === "system" && systemTheme === "dark")) &&
              "bg-primary text-primary-foreground",
          )}
        >
          <MoonIcon />
        </div>
      </motion.button>
      <button
        className={cn(
          "bg-secondary text-secondary-foreground border-border/60 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:bg-accent/85 focus-visible:text-accent-foreground/85 hover:bg-accent/85 hover:text-accent-foreground/85 rounded-full border p-0.5 hover:brightness-[97%] focus-visible:ring focus-visible:ring-offset-2 focus-visible:!outline-0 focus-visible:brightness-[97%] dark:hover:brightness-90 dark:focus-visible:brightness-90",
        )}
        onClick={() => setTheme("system")}
      >
        <div
          className={cn(
            "block rounded-full",
            mounted &&
              theme === "system" &&
              "bg-primary text-primary-foreground",
          )}
        >
          <MonitorIcon className="size-6 p-1" />
        </div>
      </button>
    </div>
  );
}
