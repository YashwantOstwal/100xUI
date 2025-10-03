import { Transition, Variants } from "motion";
import * as motion from "motion/react-client";

const CodeIcon = (pathProps: {
  variants: Variants;
  transition: Transition;
}) => (
  // <svg
  //   className="stroke-foreground"
  //   xmlnsXlink="http://www.w3.org/1999/xlink"
  //   xmlns="http://www.w3.org/2000/svg"
  //   width="24"
  //   height="24"
  //   fill="none"
  //   viewBox="0 0 24 24"
  // >
  //   <motion.path
  //     {...pathProps}
  //     transition={{ duration: 0.8, ease: "easeInOut" }}
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     strokeWidth="1.5px"
  //     d="m15.75 8.75 3.5 3.25-3.5 3.25m-7.5-6.5L4.75 12l3.5 3.25m5-9.5-2.5 12.5"
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
    <motion.path {...pathProps} d="m18 16 4-4-4-4" />
    <motion.path {...pathProps} d="m6 8-4 4 4 4" />
    <motion.path {...pathProps} d="m14.5 4-5 16" />
  </svg>
);

export default CodeIcon;
