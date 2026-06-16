"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  type MotionProps,
  type Transition,
  useAnimate,
} from "motion/react";
import React, {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TRANSITION: Transition = {
  ease: "easeOut",
  duration: 0.3,
};

type MenuWheelContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeValue: string | null;
  setActiveValue: React.Dispatch<React.SetStateAction<string | null>>;
  showCurrent: boolean;
  onValueChange?: (value: string) => void;
};

const MenuWheelContext = createContext<MenuWheelContextType | null>(null);

export function useMenuWheelContext() {
  const ctx = useContext(MenuWheelContext);
  if (!ctx) {
    throw new Error(
      "MenuWheel components must be used within a MenuWheel provider"
    );
  }
  return ctx;
}

type MenuWheelContainerContextType = {
  totalItems: number;
  moveHighlight: (index: number) => void;
  clearHighlight: () => void;
};

const MenuWheelContainerContext =
  createContext<MenuWheelContainerContextType | null>(null);

export function useMenuWheelContainerContext() {
  const ctx = useContext(MenuWheelContainerContext);
  if (!ctx) {
    throw new Error(
      "MenuWheelItem components must be used within a MenuWheelContainer"
    );
  }
  return ctx;
}

interface MenuWheelProps extends ComponentProps<"div"> {
  showCurrent?: boolean; // Whether to highlight the currently selected item
  defaultValue?: string; // The default value to be selected when the component mounts
  onValueChange?: (value: string) => void; // Callback function to handle value changes
}

export function MenuWheel({
  children,
  className,
  showCurrent = true,
  defaultValue,
  onValueChange,
  onMouseDown,
  ...props
}: MenuWheelProps) {
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(
    defaultValue ?? null
  );

  useEffect(() => {
    const handleMouseUp = () => {
      setOpen(false);
    };
    if (open) {
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [open]);

  return (
    <MenuWheelContext.Provider
      value={{
        open,
        setOpen,
        activeValue,
        setActiveValue,
        showCurrent,
        onValueChange,
      }}
    >
      <MotionConfig transition={TRANSITION}>
        <div
          className={cn(
            "relative isolate grid size-12 place-items-center rounded-full",
            open ? "*:cursor-grabbing" : "*:cursor-grab",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MenuWheelContext.Provider>
  );
}

export function MenuWheelTrigger({
  cancel = <XIcon />,
  children,
  className,
  ...props
}: {
  cancel?: React.ReactNode; // The content to display when the menu wheel is open (default is an X Icon)
} & React.ComponentProps<"button"> &
  MotionProps) {
  const { open, setOpen } = useMenuWheelContext();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {!open ? (
        <motion.button
          key="open"
          aria-label="open menu wheel"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0.5 }}
          className={cn(
            "bg-secondary text-secondary-foreground relative z-20 grid size-full place-items-center rounded-full",
            className
          )}
          {...props}
          onMouseDown={(e) => {
            setOpen(true);
            props.onMouseDown?.(e);
          }}
        >
          {children}
        </motion.button>
      ) : (
        <motion.div
          key="close"
          aria-label="close menu wheel"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0.5 }}
          className="bg-destructive text-destructive-foreground z-20 grid size-full place-items-center rounded-full"
        >
          {cancel}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MenuWheelContainer({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & MotionProps) {
  const { open } = useMenuWheelContext();
  const [scope, animate] = useAnimate();
  const maybeHoveredItem = useRef<
    { exists: false } | { exists: true; index: number; angle: number }
  >({ exists: false });

  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement
  );
  const totalItems = validChildren.length;

  const moveHighlight = (newHoveredItem: number) => {
    if (!maybeHoveredItem.current.exists) {
      const rotate = (newHoveredItem * 360) / totalItems;
      const enterAnimation = async () => {
        await animate(scope.current, { rotate }, { duration: 0 });
        animate(scope.current, { opacity: 1 }, TRANSITION);
      };
      enterAnimation();
      maybeHoveredItem.current = {
        exists: true,
        index: newHoveredItem,
        angle: rotate,
      };
    } else {
      let forwardPath = 0,
        backwardPath = 0;
      const currentAngle = maybeHoveredItem.current.angle;
      const currentIndex = maybeHoveredItem.current.index;

      for (
        let i = currentIndex;
        i != newHoveredItem;
        i = (i + 1) % totalItems
      ) {
        forwardPath += 360 / totalItems;
      }
      for (
        let j = currentIndex;
        j != newHoveredItem;
        j = (j - 1 + totalItems) % totalItems
      ) {
        backwardPath -= 360 / totalItems;
      }

      const shortestPath =
        Math.abs(forwardPath) <= Math.abs(backwardPath)
          ? forwardPath
          : backwardPath;
      const rotate = currentAngle + shortestPath;
      maybeHoveredItem.current.index = newHoveredItem;
      maybeHoveredItem.current.angle = rotate;
      animate(scope.current, { rotate }, TRANSITION);
    }
  };

  const clearHighlight = () => {
    maybeHoveredItem.current = { exists: false };
    animate(scope.current, { opacity: 0 });
  };

  return (
    <MenuWheelContainerContext.Provider
      value={{ totalItems, moveHighlight, clearHighlight }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            onMouseLeave={clearHighlight}
            initial={{
              maskImage:
                "conic-gradient(rgba(0,0,0,1) 0%,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 100%)",
              scale: 0.85,
              opacity: 0.5,
            }}
            animate={{
              maskImage:
                "conic-gradient(rgba(0,0,0,1) 0%,rgba(0,0,0,1) 100%,rgba(0,0,0,0) 100%,rgba(0,0,0,0) 100%)",
              scale: 1,
              opacity: 1,
            }}
            exit={{
              maskImage:
                "conic-gradient(rgba(0,0,0,1) 0%,rgba(0,0,0,1) 0%,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 100%)",
              scale: 0.85,
              opacity: 0.5,
            }}
            className={cn(
              "bg-border text-secondary-foreground absolute isolate z-10 flex size-[325%] rounded-full",
              className
            )}
            {...props}
          >
            {children}
            <div
              ref={scope}
              className="bg-primary absolute inset-y-0 left-0 z-10 w-1/2 origin-right opacity-0"
              style={{
                clipPath: `polygon(100% 50%,100% 0%,0% 0%,0% ${
                  50 - Math.tan(((90 - 360 / totalItems) * Math.PI) / 180) * 50
                }%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MenuWheelContainerContext.Provider>
  );
}

export function MenuWheelItem({
  className,
  onMouseEnter,
  onMouseUp,
  index, // The index of the item in the menu wheel
  value, // The value associated with the item, used for selection
  children,
  ...props
}: React.ComponentProps<"button"> & { value?: string; index: number }) {
  const { setActiveValue, onValueChange, showCurrent, activeValue } =
    useMenuWheelContext();
  const { totalItems, moveHighlight, clearHighlight } =
    useMenuWheelContainerContext();

  return (
    <button
      onMouseEnter={(e) => {
        moveHighlight(index);
        onMouseEnter?.(e);
      }}
      onMouseUp={(e) => {
        if (!value) return;
        setActiveValue(value);
        clearHighlight();
        onValueChange?.(value);
        onMouseUp?.(e);
      }}
      {...props}
      className={cn(
        "bg-muted text-muted-foreground border-border/50 absolute inset-y-1 right-1/2 left-1 z-20 origin-right cursor-grabbing rounded-l-full border-r transition-opacity hover:opacity-80",
        showCurrent && activeValue === value && "text-secondary-foreground",
        className
      )}
      style={{
        clipPath: `polygon(100% 50%,100% 0%,0% 0%,0% ${
          50 - Math.tan(((90 - 360 / totalItems) * Math.PI) / 180) * 50
        }%)`,
        transform: `rotate(${(index * 360) / totalItems}deg)`,
      }}
    >
      <div
        style={{
          offsetPath: "circle(40% at 100% 50%)",
          offsetDistance: `${((-90 - 360 / totalItems / 2) / 360) * 100}%`,
          offsetRotate: `${(-index * 360) / totalItems}deg`,
          offsetAnchor: "center",
        }}
        className="w-fit"
      >
        {children}
      </div>
    </button>
  );
}
