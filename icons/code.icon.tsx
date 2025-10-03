import type { Transition, Variants } from "motion";
import * as motion from "motion/react-client";

const CodeIcon = (pathProps: {
  variants: Variants;
  transition: Transition;
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <motion.path {...pathProps} d="m18 16 4-4-4-4" />
    <motion.path {...pathProps} d="m6 8-4 4 4 4" />
    <motion.path {...pathProps} d="m14.5 4-5 16" />
  </svg>
);

export default CodeIcon;
