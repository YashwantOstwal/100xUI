"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type packageManagers = "pnpm" | "npm" | "bun" | "yarn";
const PackageManagerContext = createContext<
  | {
      packageManager: packageManagers;
      handleClick: (tab: packageManagers) => void;
    }
  | undefined
>(undefined);
export function PackageManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPackageManager, setCurrentPackageManager] =
    useState<packageManagers>("pnpm");
  const handleClick = (tab: packageManagers) => {
    setCurrentPackageManager(tab);
    window.localStorage.setItem("packageManager", tab);
  };

  useEffect(() => {
    const packageManager = window.localStorage.getItem("packageManager");
    if (
      packageManager === "npm" ||
      packageManager === "pnpm" ||
      packageManager === "yarn" ||
      packageManager === "bun"
    ) {
      setCurrentPackageManager(packageManager);
    }
  }, []);

  return (
    <PackageManagerContext.Provider
      value={{ packageManager: currentPackageManager, handleClick }}
    >
      {children}
    </PackageManagerContext.Provider>
  );
}

export function usePackageManager() {
  const ctx = useContext(PackageManagerContext);
  if (!ctx)
    throw new Error(
      "usePackageManager must be used within <PackageManagerProvider/>",
    );
  return ctx;
}
