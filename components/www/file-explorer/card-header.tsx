import { cn } from "@/lib/utils";

export function CardHeader({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "flex items-center justify-between gap-2 px-1 py-1.5 font-medium",
        className,
      )}
    />
  );
}

CardHeader.FlexOneFlex = function CardHeaderFlexOneFlex({
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "flex flex-1 items-center gap-1 overflow-auto text-nowrap whitespace-nowrap md:gap-2 [&>svg]:shrink-0",
        className,
      )}
    />
  );
};
