import { ComponentProps } from "react";
import { TailwindCSSClassname } from "../components/file-explorer/file-explorer.types";

export default function LeftArrowIcon(
  props: TailwindCSSClassname & ComponentProps<"svg">,
) {
  return (
    <svg {...props} width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5px"
        d="M10.25 6.75L4.75 12L10.25 17.25"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5px"
        d="M19.25 12H5"
      />
    </svg>
  );
}
