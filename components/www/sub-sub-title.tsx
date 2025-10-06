import { cn } from "@/lib/utils";

export const SubSubTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3
    className={cn(
      "mb-4 text-lg leading-tight font-semibold tracking-tight sm:text-xl",
      className,
    )}
  >
    {children}
  </h3>
);
