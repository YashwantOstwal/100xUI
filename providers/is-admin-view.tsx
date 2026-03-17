"use client";

import { createContext, SetStateAction, useContext, useState } from "react";

interface IsAdminView {
  isAdminView: boolean;
  setIsAdminView: React.Dispatch<SetStateAction<boolean>>;
}
const IsAdminViewContext = createContext<IsAdminView | null>(null);
export function IsAdminViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdminView, setIsAdminView] = useState(false);
  return (
    <IsAdminViewContext.Provider value={{ isAdminView, setIsAdminView }}>
      {children}
    </IsAdminViewContext.Provider>
  );
}

export function useIsAdminView() {
  const ctx = useContext(IsAdminViewContext);
  if (ctx == null) {
    throw new Error("useIdAdmin must be used within a <IsAdminViewProvider/>");
  }
  return ctx;
}
