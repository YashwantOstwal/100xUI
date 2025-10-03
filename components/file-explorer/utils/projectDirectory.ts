import type {
  DirectoryItem,
  Directory,
  EnhancedDirectoryItem,
} from "../file-explorer.types";

interface ProjectDirectoryType {
  enhancedRootDirectory: EnhancedDirectoryItem[];
}
export default class ProjectDirectory implements ProjectDirectoryType {
  public enhancedRootDirectory: EnhancedDirectoryItem[];
  constructor(rootDirectory: DirectoryItem[]) {
    const rootDirectoryCopy = structuredClone(rootDirectory);
    this.processData(rootDirectoryCopy);
    this.enhancedRootDirectory = rootDirectoryCopy as EnhancedDirectoryItem[];
  }
  private processData(directory: DirectoryItem[], pathPrefix = "") {
    let allDescendentFiles: string[] = [];

    for (let i = 0; i < directory.length; i++) {
      const currentItem = directory[i];
      const absolutePath = pathPrefix
        ? [pathPrefix, currentItem.name].join("/")
        : currentItem.name;
      currentItem.absolutePath = absolutePath;

      if (currentItem.type === "directory") {
        const currentDirectoryItem = currentItem as Directory;
        const filesInDirectory = this.processData(
          currentDirectoryItem.items,
          absolutePath,
        );
        currentDirectoryItem.descendentFiles = filesInDirectory;
        allDescendentFiles = allDescendentFiles.concat(filesInDirectory);
      } else {
        allDescendentFiles.push(absolutePath);
      }
    }
    return allDescendentFiles;
  }
}
