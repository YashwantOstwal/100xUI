import { Transition, Variants } from "motion";
import * as motion from "motion/react-client";

const ComponentIcon = (pathProps: {
  variants: Variants;
  transition: Transition;
}) => (
  // <svg
  //   className="stroke-foreground"
  //   width="24"
  //   height="24"
  //   fill="none"
  //   viewBox="0 0 24 24"
  // >
  //   <motion.path
  //     {...pathProps}
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     strokeWidth="1.5px"
  //     d="M19.25 10.25v-1.5a2 2 0 0 0-2-2H6.75a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h4.5m3.5-3.5 1.275 5.5.975-2.085 2.25-.647-4.5-2.768Z"
  //     fill="none"
  //   ></motion.path>
  // </svg>
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
