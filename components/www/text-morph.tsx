"use client";
import { AnimatePresence, easeOut, motion, MotionConfig } from "motion/react";
import { useId } from "react";

import ClipboardIcon from "./file-explorer/icons/Clipboard";

interface TextMorphProps {
  children: string;
  copied: boolean;
}

const ANIMATION_VARIANTS = {
  fadeOut: { opacity: 0 },
  fadeIn: { opacity: 1 },
} as const;
const TextMorph = ({ children, copied }: TextMorphProps) => {
  const id = useId();
  const freqArray: {
    [key: string]: number;
  } = {};

  return (
    <MotionConfig transition={{ ease: easeOut }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {!copied && (
          <motion.div
            key="copy-icon"
            layoutId={id}
            variants={ANIMATION_VARIANTS}
            initial="fadeOut"
            animate="fadeIn"
            exit="fadeOut"
          >
            <ClipboardIcon />
          </motion.div>
        )}
        {children.split("").map((eachChar) => {
          if (eachChar in freqArray) {
            freqArray[eachChar]++;
          } else {
            freqArray[eachChar] = 1;
          }
          const key = id + eachChar.repeat(freqArray[eachChar]);

          return (
            <motion.div
              key={key}
              layoutId={key}
              initial="fadeOut"
              animate="fadeIn"
              exit="fadeOut"
              variants={ANIMATION_VARIANTS}
              transition={{ duration: 0.3 }}
            >
              {eachChar}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default TextMorph;
