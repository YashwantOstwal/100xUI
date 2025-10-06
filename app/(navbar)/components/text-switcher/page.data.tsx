import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import {
  styleProp,
  classNameProp,
} from "../_components/prop-table/commonly-used-props";

import { GLOBALS_CSS } from "@/app/code-strings";
import { UTILS_TS } from "@/lib/code-strings";
const TEXT_SWITCHER_TSX = `"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useVelocity,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface TextSwitcherProps {
  phrases: string[];
  readTimeInSec?: number;
  animationDurationInSec?: number;
  className?: string;
  style?: React.CSSProperties;
}

const letterVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: { scaleX: 1, opacity: 1 },
  exit: { scaleX: 0, opacity: 0 },
};

export function TextSwitcher({
  phrases,
  animationDurationInSec = 0.4,
  readTimeInSec = 2,
  className,
  style,
}: TextSwitcherProps) {
  const [currentPhrase, setCurrentPhrase] = React.useState(0);

  const dotLeft = useMotionValue("100%");
  const dotLeftAsFloat = useTransform(dotLeft, (latest) => parseFloat(latest));
  const dotVelocity = useVelocity(dotLeftAsFloat);

  const dotScaleX = useTransform(dotVelocity, [-120, 0, 120], [3, 1, 3]);
  const dotColor = useTransform(dotVelocity, (latest) => {
    return Math.round(latest) !== 0 ? "var(--color-destructive)" : "";
  });

  React.useEffect(() => {
    const totalCycleTimeInMs =
      (readTimeInSec + 2 * animationDurationInSec) * 1000;
    const controlInterval = setInterval(() => {
      setCurrentPhrase((prevIndex) => (prevIndex + 1) % phrases.length);
    }, totalCycleTimeInMs);

    return () => clearInterval(controlInterval);
  }, [phrases.length, readTimeInSec, animationDurationInSec]);

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: animationDurationInSec / phrases[currentPhrase].length,
      },
    },
    exit: {
      transition: {
        staggerChildren: animationDurationInSec / phrases[currentPhrase].length,
        staggerDirection: -1,
      },
    },
  };

  return (
    <div
      className={cn("inline-block", className, "!relative")}
      style={{ ...style }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentPhrase}
          className="flex flex-nowrap whitespace-pre"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {phrases[currentPhrase].split("").map((letter, i) => (
            <motion.div
              key={\`phrases[\${currentPhrase}][\${i}]\`}
              className="origin-left"
              variants={letterVariants}
              transition={{
                duration:
                  animationDurationInSec / phrases[currentPhrase].length,
              }}
            >
              {letter}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={\`phrases[\${currentPhrase}].dot\`}
          style={{ left: dotLeft, scaleX: dotScaleX, color: dotColor }}
          className="absolute inset-y-0"
          variants={{
            initial: { left: "0%" },
            animate: {
              left: "100%",
              transformOrigin: "100% 50%",
              transition: {
                duration: animationDurationInSec,
                ease: [0.33, 1, 0.68, 1],
              },
            },
            exit: {
              left: "0%",
              transformOrigin: "0% 50%",
              transition: {
                duration: animationDurationInSec,
                ease: [0.32, 0, 0.67, 0],
              },
            },
          }}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          .
        </motion.div>
      </AnimatePresence>
    </div>
  );
};`;

const TEXT_SWITCHER_DEMO_TSX = `import { TextSwitcher } from "./text-switcher";

export function TextSwitcherDemo() {
  return (
    <div className="text-sm sm:text-base md:text-xl lg:text-2xl">
      As someone who styles divs and <br className="md:hidden" /> solves
      backend&nbsp;
      <br className="max-md:hidden" />
      nightmares, I write <br className="md:hidden" />
      code that&nbsp;
      <TextSwitcher
        phrases={["compiles", "ships", "breaks", "runs anyway"]}
        className="font-medium"
      />
    </div>
  );
}`;

const ROOT_DIRECTORY: DirectoryItem[] = [
  {
    name: "globals.css | index.css",
    type: "file",
    absolutePath: "globals.css | index.css",
    code: GLOBALS_CSS,
  },
  {
    name: "components",
    type: "directory",
    items: [
      {
        name: "text-switcher.tsx",
        type: "file",
        code: TEXT_SWITCHER_TSX,
      },
    ],
  },
  {
    name: "lib",
    type: "directory",
    items: [
      {
        name: "utils.ts",
        type: "file",
        code: UTILS_TS,
      },
    ],
  },
];
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/text-switcher.tsx",
  code: TEXT_SWITCHER_TSX,
};

const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<TextSwitcher/>"],
      tableData: [
        {
          prop: <code>phrases</code>,
          type: <SyntaxHighlighterServer>{`string[]`}</SyntaxHighlighterServer>,
          description:
            "An array of strings that the component will cycle through.",
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>animationDurationInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: `The duration, in seconds, of the enter and exit animations for each phrase.`,
          defaultValue: <SyntaxHighlighterServer>0.4</SyntaxHighlighterServer>,
        },
        {
          prop: <code>readTimeInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description:
            "The display duration, in seconds, for each phrase before its exit animation starts.",
          defaultValue: <SyntaxHighlighterServer>2</SyntaxHighlighterServer>,
        },
        styleProp,
        classNameProp,
      ],
    },
  ],
};
const TITLE = "Text switcher",
  DESCRIPTION =
    "A reusable component that creates an engaging animation effect by smoothly transitioning between a list of phrases. The animation, driven by a moving dot, makes it ideal for dynamically completing a sentence or tagline.",
  USAGE = { title: TITLE, code: TEXT_SWITCHER_DEMO_TSX };
export {
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
  USAGE,
};
