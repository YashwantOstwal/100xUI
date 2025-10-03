export const USE_IS_SERVER_TS = `import React from "react";

export function useIsServer() {
  const isServer = React.useRef(typeof window === "undefined");
  return isServer.current;
}`;
