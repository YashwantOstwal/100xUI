"use client";

import React from "react";

const AnimatedTabsContext = React.createContext<string | null>(null);
export function AnimatedTabsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState("");

  React.useEffect(() => {
    const elements = document.querySelectorAll(`[data-tracker]`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState(entry.target.getAttribute("data-tracker") as string);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
      },
    );

    setState(elements[0]?.getAttribute("data-tracker") ?? "");
    elements.forEach((eachEl) => {
      observer.observe(eachEl);
    });
    return () => {
      elements.forEach((eachEl) => {
        observer.unobserve(eachEl);
      });
    };
  }, []);
  return <AnimatedTabsContext value={state}>{children}</AnimatedTabsContext>;
}
export function useAnimatedTabs() {
  const state = React.useContext(AnimatedTabsContext);
  if (state === null)
    throw new Error("it must be used within <AnimatedTabsProvider/>");
  return state;
}
