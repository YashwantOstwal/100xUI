export const USE_DEBOUNCED_STATE_TS = `import React from "react";

export function useDebouncedState<T>(initialValue: T, delay: number) {
  const [state, setState] = React.useState(initialValue);
  const timeoutRef = React.useRef<NodeJS.Timeout>(undefined);

  const setDebouncedState = React.useCallback(
    (newState: T) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setState(newState), delay);
    },
    [delay],
  );

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return [state, setDebouncedState] as const;
}`;
