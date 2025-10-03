import { MotionValue, useTransform } from "motion/react";
import { useIsServer } from "./use-is-server";
import { useEffect, useState } from "react";
export default function useMaskImage(
  localProgress: MotionValue<number>,
  custom: boolean,
  config?: {
    cuts: number;
    inset: number;
    breadth: number;
  },
) {
  const isServer = useIsServer();

  const [isMobile, setIsMobile] = useState(() =>
    isServer ? undefined : window.matchMedia("(max-width:768px)").matches,
  );
  const { cuts = 20, inset = 0, breadth = 0.5 } = config ?? {};
  const func = (i: number, latest: number) => {
    const buffer = (1 - 2 * inset - breadth) / (cuts - 1);
    if (inset + i * buffer > latest) return 0;
    if (inset + breadth + i * buffer < latest) return 1;
    return (latest - (inset + i * buffer)) / breadth;
  };

  const maskImage = useTransform(localProgress, (latest) => {
    if (isServer) return;
    const direction = custom ? "bottom" : "top";
    if (isMobile) {
      return `linear-gradient(to ${direction},rgba(0,0,0,0) 0%,rgba(0,0,0,0) ${latest * 100}% ,rgba(0,0,0,1) ${latest * 100}%,rgba(1,1,1,1) 100%)`;
    }
    let temp = "";

    for (let i = 0; i < cuts; i++) {
      temp += `,rgba(0,0,0,0) ${i * (100 / cuts)}% ,rgba(0,0,0,0) ${func(i, latest) * (100 / cuts) + i * (100 / cuts)}%,rgba(0,0,0,1) ${func(i, latest) * (100 / cuts) + i * (100 / cuts)}%,rgba(0,0,0,1) ${(i + 1) * (100 / cuts)}%`;
    }
    return `linear-gradient(to ${direction}${temp})`;
  });

  useEffect(() => {
    const handleMediaQuery = ({ matches }: { matches: boolean }) => {
      setIsMobile(matches);
    };
    const mediaQuery = window.matchMedia("(max-width:768px)");
    mediaQuery.addEventListener("change", handleMediaQuery);
    return () => mediaQuery.removeEventListener("change", handleMediaQuery);
  }, []);

  return maskImage;
}
