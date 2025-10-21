"use client";

import * as React from "react";
import {
  motion,
  useAnimate,
  type Transition,
  type HTMLMotionProps,
  type MotionStyle,
} from "motion/react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface NotificationContextType {
  dismissNotification: () => void;
  showNotification: () => Promise<void>;
  hideNotification: () => Promise<void>;
  scope: React.RefObject<HTMLDivElement>;
  expandedGap: React.CSSProperties["gap"];
  minVisibleContentHeight: React.CSSProperties["height"];
  initialContentScale: React.CSSProperties["scale"];
  slideFromTop: boolean;
}

const NotificationContext = React.createContext<NotificationContextType | null>(
  null,
);

function useNotification() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within Notification Provider",
    );
  return ctx;
}

interface NotificationProps extends React.ComponentProps<"div"> {
  transition?: Partial<Record<"scale" | "translateY", Transition>>;
  initialContentScale?: React.CSSProperties["scale"];
  expandedGap?: React.CSSProperties["gap"];
  minVisibleContentHeight?: React.CSSProperties["height"];
  slideContentFrom?: "bottom" | "top";
}

export function Notification({
  transition: { scale: scaleTransition, translateY: translateYTransition } = {
    scale: { ease: "easeOut" },
    translateY: { ease: "easeOut" },
  },
  initialContentScale = 0.95,
  expandedGap = "calc(var(--spacing) * 2)",
  minVisibleContentHeight = "calc(var(--spacing) * 2)",
  onMouseLeave,
  className,
  children,
  slideContentFrom = "top",
  ...rest
}: NotificationProps) {
  const [isRendered, setIsRendered] = React.useState(true);
  const [scope, animate] = useAnimate();
  const slideFromTop = slideContentFrom === "top";

  const showNotification = async () => {
    await animate(scope.current, { y: "0px" }, translateYTransition);
    await animate(scope.current, { scale: 1 }, scaleTransition);
  };

  const hideNotification = async () => {
    await animate(
      scope.current,
      { scale: initialContentScale },
      scaleTransition,
    );
    await animate(
      scope.current,
      {
        y: `calc(${slideFromTop ? "1" : "-1"} * (-100% - ${expandedGap} + ${minVisibleContentHeight}))`,
      },
      translateYTransition,
    );
  };

  const dismissNotification = () => setIsRendered(false);

  return (
    <>
      {isRendered && (
        <NotificationContext.Provider
          value={{
            dismissNotification,
            showNotification,
            hideNotification,
            scope,
            expandedGap,
            minVisibleContentHeight,
            initialContentScale,
            slideFromTop,
          }}
        >
          <div
            className={cn("fixed isolate flex flex-col", className)}
            onMouseLeave={(e) => {
              hideNotification();
              onMouseLeave?.(e);
            }}
            {...rest}
          >
            {children}
          </div>
        </NotificationContext.Provider>
      )}
    </>
  );
}

export function NotificationTrigger({
  className,
  children,
  onMouseEnter,
  ...rest
}: React.ComponentProps<"div">) {
  const { showNotification, slideFromTop } = useNotification();

  return (
    <div
      onMouseEnter={(e) => {
        showNotification();
        onMouseEnter?.(e);
      }}
      className={cn(
        "bg-secondary text-secondary-foreground border-border/50 relative z-20 rounded-lg border p-3 shadow-md",
        className,
        slideFromTop ? "order-1" : "order-2",
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function NotificationContent({
  children,
  className,
  style,
  ...rest
}: Omit<HTMLMotionProps<"div">, "ref">) {
  const {
    scope,
    expandedGap,
    minVisibleContentHeight,
    initialContentScale,
    slideFromTop,
  } = useNotification();

  const contentStyle: MotionStyle = {
    ...style,
    scale: initialContentScale,
    y: `calc(${slideFromTop ? "1" : "-1"} * (-100% - ${expandedGap} + ${minVisibleContentHeight}))`,
    transformOrigin: `50% ${slideFromTop ? "100%" : "0%"}`,
    [slideFromTop ? "marginTop" : "marginBottom"]: expandedGap,
  };

  return (
    <div
      className={cn(
        "pointer-events-none relative z-10 -m-2 flex overflow-hidden p-2",
        slideFromTop ? "order-2 pb-10" : "order-1 pt-10",
      )}
    >
      <motion.div
        style={contentStyle}
        ref={scope}
        className={cn(
          "bg-secondary text-secondary-foreground border-border/50 pointer-events-auto w-full overflow-y-auto rounded-lg border p-3 shadow-md",
          className,
        )}
        {...rest}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function NotificationCancel({
  children = <XIcon className="size-3" />,
}: React.ComponentProps<"button">) {
  const { dismissNotification, hideNotification, slideFromTop } =
    useNotification();

  return (
    <button
      onClick={dismissNotification}
      onMouseEnter={hideNotification}
      className={cn(
        "bg-destructive text-primary-foreground absolute right-0 z-30 aspect-square translate-x-1/3 cursor-pointer rounded-full p-1",
        slideFromTop ? "top-0 -translate-y-1/3" : "bottom-0 translate-y-1/3",
      )}
    >
      {children}
    </button>
  );
}
