import { cn } from "@/lib/utils";
import { TailwindCSSClassname } from "./file-explorer/file-explorer.types";

export type ListContainerProps = TailwindCSSClassname &
  React.ComponentProps<"div"> & {
    title?: string;
    list: React.ReactNode[];
    variant?: "pro-tips" | "caveats";
  };
export default function ListContainer({
  className,
  variant = "pro-tips",
  title = "Good to know",
  list,
  ...rest
}: ListContainerProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted border border-t-0 border-dashed px-1.5 py-3",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "font-medium capitalize",
          variant === "pro-tips" && "text-[#032f62] dark:text-[#99ffe4]",
          variant === "caveats" && "text-[#24292e] dark:text-[#ffc799]",
        )}
      >
        {title}
      </span>
      <div
        className={cn(
          "space-y-4 p-5 pb-0",
          variant === "pro-tips" && "text-[#032f62] dark:text-[#99ffe4]",
          variant === "caveats" && "text-[#24292e] dark:text-[#ffc799]",
        )}
      >
        {list.map((eachListItem, i) => (
          <li key={`list-item-${i}`}>{eachListItem}</li>
        ))}
      </div>
    </div>
  );
}
