import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TestimonialCard = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "bg-card text-card-foreground border-border/50 flex flex-col justify-between gap-10 rounded-4xl border px-5 py-4 shadow-md lg:px-7 lg:py-6",
      className,
    )}
    {...rest}
  />
);

const TestimonialContent = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div className={cn("text-lg font-medium lg:text-2xl", className)} {...rest} />
);

const TestimonialAuthor = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-3 lg:gap-x-4",
      className,
    )}
    {...rest}
  />
);

const TestimonialAvatar = ({
  className,
  ...rest
}: React.ComponentProps<typeof Avatar>) => (
  <Avatar
    className={cn("col-start-1 row-span-2 row-start-1 my-auto", className)}
    {...rest}
  />
);

const TestimonialAvatarImage = (
  props: React.ComponentProps<typeof AvatarImage>,
) => <AvatarImage {...props} />;

const TestimonialAvatarFallback = (
  props: React.ComponentProps<typeof AvatarFallback>,
) => <AvatarFallback {...props} />;

const TestimonialName = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "col-start-2 row-start-1 text-sm font-medium lg:text-base",
      className,
    )}
    {...rest}
  />
);

const TestimonialPosition = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-muted-foreground col-start-2 row-start-2 text-xs lg:text-sm",
      className,
    )}
    {...rest}
  />
);

export {
  TestimonialCard,
  TestimonialContent,
  TestimonialAuthor,
  TestimonialAvatar,
  TestimonialName,
  TestimonialPosition,
  TestimonialAvatarFallback,
  TestimonialAvatarImage,
};
