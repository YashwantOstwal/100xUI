"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import type { ActiveFile } from "../file-explorer.types";
interface ActiveFileContext {
  activeFile: ActiveFile;
  setActiveFile: Dispatch<SetStateAction<ActiveFile>>;
}
const ActiveFileContext = createContext<ActiveFileContext | null>(null);
export default function ActiveFileProvider({
  defaultActiveFile,
  children,
}: {
  defaultActiveFile: ActiveFile;
  children: ReactNode;
}) {
  const [activeFile, setActiveFile] = useState<ActiveFile>(defaultActiveFile);
  return (
    <ActiveFileContext value={{ activeFile, setActiveFile }}>
      {children}
    </ActiveFileContext>
  );
}

export const useActiveFile = () =>
  useContext(ActiveFileContext) as ActiveFileContext;
