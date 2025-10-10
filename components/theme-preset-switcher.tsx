"use client";

import { cn } from "@/lib/utils";
import { useTheme, UseThemeProps } from "next-themes";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const THEME_PRESETS: { id: string; label: string; className?: string }[] = [
  {
    id: "vercel",
    label: "Vercel",
  },
  {
    id: "perpetuity",
    label: "Perpetuity",
  },
  {
    id: "bubblegum",
    label: "Bubblegum",
  },
];
export function ThemePresetSwitcher() {
  const themeCtx = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="mt-5 flex items-center justify-between gap-2">
      <div className="text-muted-foreground font-mono uppercase">
        Current Theme:{" "}
        {isMounted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
          >
            {THEME_PRESETS.find((themePreset) =>
              themeCtx.theme?.endsWith(themePreset.id),
            )?.label ?? "Neutral (Page default)"}
          </motion.span>
        )}
      </div>
      <div className="flex items-center -space-x-4">
        <ThemePreset
          key="Neutral (Page default)"
          themeCtx={themeCtx}
          id=""
          label="Neutral (Page default)"
          className={cn(
            isMounted &&
              (themeCtx.theme?.endsWith("light") ||
                themeCtx.theme?.endsWith("dark") ||
                themeCtx.theme?.endsWith("system")) &&
              "ring-primary z-40 ring-2",
          )}
          onClick={() => {
            themeCtx.setTheme((currTheme) => currTheme.split("-")[0]);
          }}
        />
        {THEME_PRESETS.map(({ id, label, className }) => (
          <ThemePreset
            className={cn(
              isMounted &&
                themeCtx.theme?.endsWith(id) &&
                "ring-primary z-40 ring-2",
              className,
            )}
            key={id}
            themeCtx={themeCtx}
            id={id}
            label={label}
          />
        ))}
      </div>

      {/* <p className="text-muted-foreground max-w-xl text-xs">
        Integrates seamlessly with your shadcn/ui project, supporting all 42
        theme presets and custom themes from its theming tools like TweakCN.
      </p> */}
    </div>
  );
}

interface ThemePresetSwitch extends React.ComponentProps<"button"> {
  id: string;
  themeCtx: UseThemeProps;
  className?: string;
  label?: string;
}
function ThemePreset({
  themeCtx: { setTheme, systemTheme },
  id,
  className,
  label,
  ...rest
}: ThemePresetSwitch) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          data-switch={id}
          className={cn(
            "from-primary via-secondary to-card ring-primary size-10 rounded-full bg-gradient-to-r hover:z-50 focus-visible:z-50 focus-visible:ring-2 focus-visible:outline-none sm:size-11",
            className,
          )}
          onClick={() => {
            setTheme((currTheme) => {
              const currMode = currTheme.split("-")[0];
              if (currMode === "system") return systemTheme + `-${id}`;
              return currMode + `-${id}`;
            });
          }}
          {...rest}
        />
      </TooltipTrigger>
      <TooltipContent className="rounded-sm px-2 py-1">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
