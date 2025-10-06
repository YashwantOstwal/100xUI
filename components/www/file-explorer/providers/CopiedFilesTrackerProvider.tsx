"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useState,
} from "react";

type CopiedFilesTrackerContext = {
  copiedFiles: string[];
  isCopyTrackerOn: boolean;
  toggleCopyTrackerMode: () => void;
  dispatchCopiedFiles: (action: Action) => void;
};
const CopiedFilesTrackerContext =
  createContext<CopiedFilesTrackerContext | null>(null);

type Action = { type: "ADD" | "REMOVE" | "RESET"; items?: string[] };
export default function CopiedFilesTrackerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isCopyTrackerOn, setIsCopyTrackerOn] = useState(false);

  const [copiedFiles, dispatchCopiedFiles] = useReducer(
    (prevState: string[], { type, items = [] }: Action) => {
      switch (type) {
        case "ADD":
          return prevState.concat(items);
        case "REMOVE":
          return prevState.filter((eachItem) => !items.includes(eachItem));
        case "RESET":
          return [];
      }
    },
    [],
  );

  const toggleCopyTrackerMode = () => setIsCopyTrackerOn((prev) => !prev);
  return (
    <CopiedFilesTrackerContext
      value={{
        isCopyTrackerOn,
        toggleCopyTrackerMode,
        copiedFiles,
        dispatchCopiedFiles,
      }}
    >
      {children}
    </CopiedFilesTrackerContext>
  );
}

export const useIsCopyTrackerOn = () => {
  const ctx = useContext(
    CopiedFilesTrackerContext,
  ) as CopiedFilesTrackerContext;
  if (!ctx)
    throw new Error(
      "useIsCopyTracker must be called inside <CopiedFilesTrackerProvider/>",
    );

  const { isCopyTrackerOn, toggleCopyTrackerMode } = ctx;
  return { isCopyTrackerOn, toggleCopyTrackerMode };
};
export const useCopiedFiles = () => {
  const ctx = useContext(
    CopiedFilesTrackerContext,
  ) as CopiedFilesTrackerContext;

  if (!ctx)
    throw new Error(
      "useCopiedFiles must be called inside <CopiedFilesTrackerProvider/>",
    );
  const { copiedFiles, dispatchCopiedFiles } = ctx;
  return { copiedFiles, dispatchCopiedFiles };
};
