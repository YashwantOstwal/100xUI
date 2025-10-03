import type { Transition, Variants } from "motion";
import * as motion from "motion/react-client";

const ComponentIcon = (pathProps: {
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
    <motion.path
      {...pathProps}
      d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"
    />
    <motion.rect x="14" y="2" width="8" height="8" rx="1" {...pathProps} />
  </svg>
);
export default ComponentIcon;
