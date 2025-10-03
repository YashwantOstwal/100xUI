import { CSSProperties } from "react";

interface Primitives {
  name: string;
  type: "directory" | "file";
}
interface File extends Primitives {
  code: string;
  absolutePath?: string;
}

interface EnhancedDirectory extends Directory {
  absolutePath: string;
  descendentFiles: string[];
}
interface EnhancedFile extends File {
  absolutePath: string;
}
interface Directory extends Primitives {
  absolutePath?: string;
  items: DirectoryItem[];
  descendentFiles?: string[];
}
interface ActiveFile {
  code: string;
  absolutePath: string;
}
interface FileTreeProps {
  rootDirectory: EnhancedDirectoryItem[];
}
type DirectoryItem = Directory | File;
type EnhancedDirectoryItem = EnhancedDirectory | EnhancedFile;

type FileExplorerProps = TailwindCSSClassname &
  React.ComponentProps<"div"> & {
    rootDirectory: DirectoryItem[];
    defaultActiveFile: ActiveFile;
  };

type TailwindCSSClassname = { className?: string };
type Style = { style?: CSSProperties };
export type {
  Directory,
  DirectoryItem,
  File,
  EnhancedDirectoryItem,
  EnhancedFile,
  EnhancedDirectory,
  FileTreeProps,
  ActiveFile,
  FileExplorerProps,
  TailwindCSSClassname,
  Style,
};
