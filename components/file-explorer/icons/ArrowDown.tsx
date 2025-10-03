import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { CSSProperties } from "react";

const ArrowDownIcon = ({
  openSubtree = false,
  className,
  style,
}: {
  openSubtree?: boolean;
  className?: string;
  style?: CSSProperties;
}) => (
  <motion.svg
    style={{ ...style }}
    initial={{ rotate: "-90deg" }}
    animate={{ rotate: openSubtree ? "0deg" : "-90deg" }}
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={cn(className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5px"
      stroke="currentColor"
      d="M15.25 10.75L12 14.25L8.75 10.75"
      fill="none"
    />
  </motion.svg>
);

export default ArrowDownIcon;
