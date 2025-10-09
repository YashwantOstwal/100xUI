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

const themesPresets: { id: string; label: string; className: string }[] = [
  {
    id: "vercel",
    label: "Vercel",
    className:
      " from-[oklch(0.208_0.042_265.755)] via-[oklch(0.968_0.007_247.896)] to-[oklch(1_0_0)] dark:from-[oklch(0.929_0.013_255.508)] dark:via-[oklch(0.279_0.041_260.031)] dark:to-[oklch(0.129_0.042_264.695)]",
  },
  {
    id: "perpetuity",
    label: "Perpetuity",
    className:
      "from-[oklch(0.5016_0.1887_27.4816)] via-[oklch(0.4955_0.0896_126.1858)] to-[oklch(0.8452_0_0)] dark:from-[oklch(0.6083_0.209_27.0276)] dark:via-[oklch(0.6423_0.1467_133.0145)] dark:to-[oklch(0.2178_0_0)]",
  },
  {
    id: "bubblegum",
    label: "Bubblegum",
    className:
      "from-[oklch(0.6209_0.1801_348.1385)] via-[oklch(0.8095_0.0694_198.1863)] to-[oklch(0.9399_0.0203_345.6985)] dark:from-[oklch(0.9195_0.0801_87.667)] dark:via-[oklch(0.7794_0.0803_4.133)] dark:to-[oklch(0.2497_0.0305_234.1628)]",
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
      <motion.div
        initial={{ opacity: 0, filter: "blur(2px)" }}
        animate={{
          opacity: isMounted ? 1 : 0,
          filter: isMounted ? "blur(0px)" : "blur(2px)",
        }}
        className="text-muted-foreground font-mono uppercase"
      >
        Current Theme: {themeCtx.theme?.split("-")[1] ?? "Neutral"}
      </motion.div>
      <div className="flex items-center -space-x-4">
        {themesPresets.map(({ id, label, className }) => (
          <ThemePreset
            key={id}
            themeCtx={themeCtx}
            id={id}
            label={label}
            className={className}
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
  themeCtx: { setTheme, systemTheme, theme },
  id,
  className,
  label,
  ...rest
}: ThemePresetSwitch) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "border-background ring-ring ring-offset-background size-10 rounded-full border-2 bg-gradient-to-r hover:z-50 focus-visible:z-50 focus-visible:ring-2 focus-visible:outline-none sm:size-11",
            theme?.includes(id) && "ring-primary z-40 ring-2",
            className,
          )}
          onClick={() => {
            setTheme((currTheme) => {
              const [currMode, currThemePreset] = currTheme.split("-");
              if (currThemePreset === id) return currMode;
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

// "use client";

// import { cn } from "@/lib/utils";
// import { useTheme, UseThemeProps } from "next-themes";
// import React, { useEffect, useState } from "react";
// import { motion } from "motion/react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// const THEME_PRESETS: { id: string; label: string; className: string }[] = [
//   {
//     id: "vercel",
//     label: "Vercel",
//     className:
//       " from-[oklch(0.208_0.042_265.755)] via-[oklch(0.968_0.007_247.896)] to-[oklch(1_0_0)] dark:from-[oklch(0.929_0.013_255.508)] dark:via-[oklch(0.279_0.041_260.031)] dark:to-[oklch(0.129_0.042_264.695)]",
//   },
//   {
//     id: "perpetuity",
//     label: "Perpetuity",
//     className:
//       "from-[oklch(0.5016_0.1887_27.4816)] via-[oklch(0.4955_0.0896_126.1858)] to-[oklch(0.8452_0_0)] dark:from-[oklch(0.6083_0.209_27.0276)] dark:via-[oklch(0.6423_0.1467_133.0145)] dark:to-[oklch(0.2178_0_0)]",
//   },
//   {
//     id: "bubblegum",
//     label: "Bubblegum",
//     className:
//       "from-[oklch(0.6209_0.1801_348.1385)] via-[oklch(0.8095_0.0694_198.1863)] to-[oklch(0.9399_0.0203_345.6985)] dark:from-[oklch(0.9195_0.0801_87.667)] dark:via-[oklch(0.7794_0.0803_4.133)] dark:to-[oklch(0.2497_0.0305_234.1628)]",
//   },
//   {
//     id: "neutral",
//     label: "Neutral",
//     className:
//       " from-[oklch(0.208_0.042_265.755)] via-[oklch(0.968_0.007_247.896)] to-[oklch(1_0_0)] dark:from-[oklch(0.929_0.013_255.508)] dark:via-[oklch(0.279_0.041_260.031)] dark:to-[oklch(0.129_0.042_264.695)]",
//   },
// ];
// export function ThemePresetSwitcher() {
//   const themeCtx = useTheme();
//   const [isMounted, setIsMounted] = useState(false);
//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   return (
//     <div className="mt-5 flex items-center justify-between gap-2">
//       <motion.div
//         initial={{ opacity: 0, filter: "blur(2px)" }}
//         animate={{
//           opacity: isMounted ? 1 : 0,
//           filter: isMounted ? "blur(0px)" : "blur(2px)",
//         }}
//         className="text-muted-foreground font-mono uppercase"
//       >
//         Current Theme: {themeCtx.theme?.split("-")[1] ?? "Neutral"}
//       </motion.div>
//       <div className="flex items-center -space-x-4">
//         {THEME_PRESETS.map(({ id, label, className }) => (
//           <ThemePreset
//             themeCtx={themeCtx}
//             id={id}
//             label={label}
//             className={className}
//           />
//         ))}
//       </div>

{
  /* <p className="text-muted-foreground max-w-xl text-xs">
        Integrates seamlessly with your shadcn/ui project, supporting all 42
        theme presets and custom themes from its theming tools like TweakCN.
      </p> */
}
//     </div>
//   );
// }

// interface ThemePresetSwitch extends React.ComponentProps<"button"> {
//   id: string;
//   themeCtx: UseThemeProps;
//   className?: string;
//   label?: string;
// }
// function ThemePreset({
//   themeCtx: { setTheme, systemTheme, theme },
//   id,
//   className,
//   label,
//   ...rest
// }: ThemePresetSwitch) {
//   const notDefault = id !== "neutral";
//   return (
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <button
//           className={cn(
//             "border-background ring-ring ring-offset-background size-10 rounded-full border-2 bg-gradient-to-r hover:z-50 focus-visible:z-50 focus-visible:ring-2 focus-visible:outline-none sm:size-11",
//             (notDefault ? theme?.includes(id) : !theme?.includes("-")) &&
//               "ring-primary z-40 ring-2",
//             className,
//           )}
//           onClick={() => {
//             setTheme((currTheme) => {
//               const [currMode, currThemePreset] = currTheme.split("-");

//               if (currMode === "system")
//                 return systemTheme + `${notDefault ? `-${id}` : ""}`;
//               return currMode + `${notDefault ? `-${id}` : ""}`;
//             });
//           }}
//           {...rest}
//         />
//       </TooltipTrigger>
//       <TooltipContent className="rounded-sm px-2 py-1">
//         <p>{label}</p>
//       </TooltipContent>
//     </Tooltip>
//   );
// }
