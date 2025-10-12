"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

function assertOnlyChild(children: React.ReactNode) {
  if (Array.isArray(children))
    throw new Error(
      "A single child is required, but received multiple siblings.",
    );
  if (
    children &&
    React.isValidElement(children) &&
    children.type === React.Fragment &&
    Array.isArray((children.props as React.FragmentProps).children)
  )
    throw new Error(
      "A single child is required; fragments that render multiple siblings are not allowed.",
    );
}

type MorphModalContextType = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalId: string;
  transition: Transition;
};

const MorphModalContext = React.createContext<
  MorphModalContextType | undefined
>(undefined);

export const useMorphModal = () => {
  const ctx = React.useContext(MorphModalContext);
  if (!ctx)
    throw new Error("useMorphModal must be used within a <MorphModal />");
  return ctx;
};

interface MorphModalProps {
  children: React.ReactNode;
  transition?: Omit<Transition, "delay">;
}

const DEFAULT_DURATION = 0.3;
const DEFAULT_EASE = "easeInOut";

export function MorphModal({ children, transition }: MorphModalProps) {
  const modalId = React.useId();
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <MorphModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        modalId,
        transition: {
          duration: DEFAULT_DURATION,
          ease: DEFAULT_EASE,
          ...transition,
        },
      }}
    >
      {children}
    </MorphModalContext.Provider>
  );
}

interface MorphModalTriggerProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export function MorphModalTrigger({
  children,
  className,
  onClick,
  ...rest
}: MorphModalTriggerProps) {
  assertOnlyChild(children);

  const { openModal, setOpenModal, transition, modalId } = useMorphModal();
  const { duration, ...restTransition } = transition;

  return (
    <div className="relative">
      <AnimatePresence initial={false}>
        {!openModal && (
          <motion.button
            onClick={(e) => {
              setOpenModal(true);
              onClick?.(e);
            }}
            className={cn(
              "bg-primary text-primary-foreground hover:bg-accent/80 hover:text-accent-foreground/80 size-fit cursor-pointer overflow-hidden transition-colors duration-150 ease-out",
              className,
              "!absolute !inset-0",
            )}
            {...rest}
            transition={{ layout: { duration, ...restTransition } }}
            layoutId={modalId + "-morph-modal"}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: duration, ...restTransition },
              }}
              exit={{ opacity: 0 }}
              layoutId={modalId + "morph-modal-trigger-child"}
              transition={{ duration, ...restTransition }}
            >
              {children}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
      <div className={cn("invisible", className)} aria-hidden>
        {children}
      </div>
    </div>
  );
}

interface MorphModalContentProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function MorphModalContent({
  children,
  className,
  onClick,
  ...rest
}: MorphModalContentProps) {
  assertOnlyChild(children);

  const { transition, modalId } = useMorphModal();
  const { duration, ...restTransition } = transition;

  return (
    <motion.div
      layoutId={modalId + "-morph-modal"}
      transition={{ layout: { duration, ...restTransition } }}
      className={cn("size-fit overflow-hidden", className)}
      {...rest}
    >
      <motion.div
        layoutId={modalId + "morph-modal-content-child"}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { delay: duration, ...restTransition },
        }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface MorphModalOverlayProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function MorphModalOverlay({
  children,
  className,
  onClick,
  ...rest
}: MorphModalOverlayProps) {
  const { openModal, setOpenModal, transition } = useMorphModal();

  return (
    <AnimatePresence>
      {openModal && (
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(2px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          transition={transition}
          className={cn(
            "fixed inset-0 isolate z-50 grid place-items-center",
            className,
          )}
          onClick={(e) => {
            setOpenModal(false);
            onClick?.(e);
          }}
          {...rest}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
