import { DirectoryItem } from "../file-explorer.types";

export default function sortDirectory(a: DirectoryItem, b: DirectoryItem) {
  const swap = 1,
    dontSwap = -1;

  // Sort the directory items based on its "type" ("directory" and then "files") first, and sort them based on alphabetical order too.
  return a.type !== b.type
    ? a.type === "file"
      ? swap
      : dontSwap
    : a.name > b.name
      ? swap
      : dontSwap;
}
