"use client";

import { Address } from "@solana/kit";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface CanDrawWinnerContext {
  canDrawWinner: boolean;
  setCanBeWinnerCandidates: Dispatch<SetStateAction<Address[]>>;
  canBeWinnerCandidates: Address[];
}
const CanDrawWinnerContext = createContext<CanDrawWinnerContext | null>(null);
export function CanDrawWinnerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [canBeWinnerCandidates, setCanBeWinnerCandidates] = useState<Address[]>(
    []
  );
  return (
    <CanDrawWinnerContext.Provider
      value={{
        canDrawWinner: canBeWinnerCandidates.length > 0,
        setCanBeWinnerCandidates,
        canBeWinnerCandidates,
      }}
    >
      {children}
    </CanDrawWinnerContext.Provider>
  );
}

export function useCanDrawWinnerContext() {
  const ctx = useContext(CanDrawWinnerContext);
  if (ctx === null)
    throw new Error("must be used within the CanDraw winner  provider");
  return ctx;
}
