import { DirectoryItem } from "../file-explorer.types";

export default function sortDirectory(a: DirectoryItem, b: DirectoryItem) {
  const swap = 1,
    dontSwap = -1;
  return a.type !== b.type
    ? a.type === "file"
      ? swap
      : dontSwap
    : a.name > b.name
      ? swap
      : dontSwap;
}
