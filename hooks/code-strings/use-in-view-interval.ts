export const USE_IS_IN_VIEW_INTERVAL = `import { useInView, type UseInViewOptions } from "motion/react";
import React from "react";

export function useInViewInterval<T extends HTMLElement | null>(
  ref: React.RefObject<T>,
  handleInterval: () => void,
  time: number,
  option?: UseInViewOptions,
) {
  const isInView = useInView(ref, option);
  const intervalRef = React.useRef<NodeJS.Timeout>(undefined);

  React.useEffect(() => {
    if (!isInView) return;

    intervalRef.current = setInterval(handleInterval, time);

    return () => clearInterval(intervalRef.current);
  }, [time, isInView]);
}
`;
