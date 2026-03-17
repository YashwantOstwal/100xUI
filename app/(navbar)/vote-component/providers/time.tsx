"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const getUnixTimestamp = () => BigInt(Math.floor(Date.now() / 1000));
const TimeContext = createContext<{
  timeNow: ReturnType<typeof getUnixTimestamp>;
  reload: () => void;
} | null>(null);

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [timeNow, setTimeNow] = useState(getUnixTimestamp);
  const reload = useCallback(() => {
    setTimeNow(getUnixTimestamp);
  }, []);

  useEffect(() => {
    // update the time every minute or 2.
  }, []);
  return (
    <TimeContext.Provider value={{ timeNow, reload }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTimeContext() {
  const ctx = useContext(TimeContext);
  if (ctx === null) throw new Error("must be used within the Time provider");
  return ctx;
}
