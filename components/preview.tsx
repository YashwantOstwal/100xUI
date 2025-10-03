import { cn } from "@/lib/utils";

export default function Preview({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-layout relative mx-auto flex min-h-[400px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl py-20 shadow-[0px_8px_12px_-4px_rgba(16,16,16,0.08),_0px_0px_2px_0px_rgba(16,16,16,0.10),_0px_1px_2px_0px_rgba(16,16,16,0.10)]/5 dark:shadow-[0px_8px_12px_-4px_rgba(0,0,0,0.08),_0px_0px_2px_0px_rgba(0,0,0,0.10),_0px_1px_2px_0px_rgba(0,0,0,0.10)]",
        className,
      )}
      {...rest}
    />
  );
}
