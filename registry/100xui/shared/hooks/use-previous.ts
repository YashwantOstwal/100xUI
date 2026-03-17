import React from "react";

export function usePrevious<T>(state: T): T | undefined {
  const prevState = React.useRef<T | undefined>(undefined);
  React.useEffect(() => {
    prevState.current = state;
  }, [state]);
  return prevState.current;
}
