"use client";

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
              key={`phrases[${currentPhrase}][${i}]`}
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
          key={`phrases[${currentPhrase}].dot`}
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
}
