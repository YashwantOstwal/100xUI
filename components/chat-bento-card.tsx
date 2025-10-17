"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  stagger,
  type HTMLMotionProps,
} from "motion/react";
import { CheckCheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface OutgoingMessageType {
  type: "outgoing";
  content: React.ReactNode;
}

interface IncomingMessageType {
  type: "incoming";
  content: React.ReactNode;
  from: string;
  avatarProps: { src?: string | Blob; fallback: string };
}

export type ChatMessageType = OutgoingMessageType | IncomingMessageType;

const MotionAvatar = motion.create(Avatar);

interface ChatBentoCardProps extends React.ComponentPropsWithoutRef<"div"> {
  messages: ChatMessageType[];
  staggerMessagesInSec?: number;
  typingDurationInSec?: number;
  initialMessagesCount?: number;
  timestamp?: React.ReactNode;
  viewOptions?: IntersectionObserverInit;
  startChatOn?: "hover" | "view";
}

const POP_LAYOUT_SYNC_DURATION = 0.2;

export function ChatBentoCard({
  messages,
  className,
  startChatOn = "view",
  initialMessagesCount = 1,
  staggerMessagesInSec = 2,
  typingDurationInSec = 0.75,
  timestamp = "Today",
  onMouseEnter,
  onMouseLeave,
  viewOptions = { threshold: 1 },
  ...rest
}: ChatBentoCardProps) {
  const id = React.useId();

  const [totalMessagesAnimated, setTotalMessagesAnimated] = React.useState(0);
  const [typing, setTyping] = React.useState(true);
  const intervalRef = React.useRef<NodeJS.Timeout>(undefined);

  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const upcomingMessage = React.useRef<number>(initialMessagesCount);

  const startAnimation = React.useCallback(() => {
    const advanceMessage = () => {
      if (messages[upcomingMessage.current]) {
        setTotalMessagesAnimated((prev) => prev + 1);
        upcomingMessage.current += 1;
        setTyping(true);
      } else {
        clearInterval(intervalRef.current);
      }
    };
    advanceMessage();
    intervalRef.current = setInterval(
      advanceMessage,
      staggerMessagesInSec * 1000,
    );
  }, [messages, staggerMessagesInSec]);

  const resetAnimation = () => {
    setTotalMessagesAnimated(0);
    setTyping(true);
    upcomingMessage.current = 0;
    clearInterval(intervalRef.current);
  };

  React.useEffect(() => {
    if (startChatOn !== "view") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAnimation();
      else resetAnimation();
    }, viewOptions);

    observer.observe(chatContainerRef.current!);

    return () => {
      clearInterval(intervalRef.current);
      observer.disconnect();
    };
  }, [startAnimation, startChatOn, viewOptions]);

  return (
    <div
      ref={chatContainerRef}
      onMouseEnter={(e) => {
        if (startChatOn === "hover") startAnimation();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (startChatOn === "hover") resetAnimation();
        onMouseLeave?.(e);
      }}
      className={cn(
        "bg-card relative flex w-full flex-col items-center justify-end gap-y-2 overflow-hidden p-2 text-sm",
        className,
      )}
      aria-hidden
      {...rest}
    >
      <motion.div
        className="text-muted-foreground pt-2 text-xs"
        layoutId={`${id}-timestamp`}
        {...(totalMessagesAnimated === 0 && {
          transition: { layout: { delay: (messages.length - 1) * 0.1 } },
        })}
      >
        {timestamp}
      </motion.div>

      <div className="flex w-full flex-1 flex-col justify-end">
        <motion.div
          layoutId={id + "chat-box-initial"}
          className="relative mb-2 flex flex-col gap-y-2"
          {...(totalMessagesAnimated === 0 && {
            transition: { layout: { delay: (messages.length - 1) * 0.1 } },
          })}
        >
          {messages
            .slice(0, initialMessagesCount)
            .map((eachMessage, i) =>
              eachMessage.type === "outgoing" ? (
                <OutgoingMessage
                  initial={false}
                  Message={eachMessage as OutgoingMessageType}
                  key={`${id}-initial-message-${i}`}
                />
              ) : (
                <IncomingMessage
                  Message={eachMessage as IncomingMessageType}
                  key={`${id}-initial-message-${i}`}
                  typingDurationInSec={typingDurationInSec}
                  initial={false}
                />
              ),
            )}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {totalMessagesAnimated !== 0 && (
            <motion.div
              key={id + "chat-box-animate"}
              className="space-y-2"
              exit="exit"
              variants={{
                exit: {
                  transition: { delayChildren: stagger(0.1) },
                },
              }}
            >
              {messages
                .slice(
                  initialMessagesCount,
                  totalMessagesAnimated + initialMessagesCount,
                )
                .map((message, index) =>
                  message.type === "outgoing" ? (
                    <OutgoingMessage
                      Message={message}
                      key={`${id}-animate-message-${index}`}
                      id={`${id}-animate-message-${index}`}
                      variants={{
                        exit: { opacity: 0, scale: 0.95 },
                      }}
                    />
                  ) : (
                    <IncomingMessage
                      {...(index + 1 === totalMessagesAnimated && { typing })}
                      setTyping={setTyping}
                      Message={message}
                      key={`${id}-animate-message-${index}`}
                      id={`${id}-animate-message-${index}`}
                      typingDurationInSec={typingDurationInSec}
                      variants={{
                        exit: { opacity: 0, scale: 0.95 },
                      }}
                    />
                  ),
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface IncomingMessageProps extends HTMLMotionProps<"div"> {
  Message: IncomingMessageType;
  id?: string;
  typing?: boolean;
  typingDurationInSec: number;
  setTyping?: React.Dispatch<React.SetStateAction<boolean>>;
}

function IncomingMessage({
  Message,
  typing = false,
  setTyping,
  id,
  typingDurationInSec,
  initial = true,
  ...rest
}: IncomingMessageProps) {
  React.useEffect(() => {
    const timeout = setTimeout(
      () => setTyping?.(false),
      typingDurationInSec * 1000,
    );
    return () => clearTimeout(timeout);
  }, [setTyping, typingDurationInSec]);

  return (
    <motion.div
      {...rest}
      className="grid w-full origin-bottom-left grid-cols-[auto_1fr] gap-x-2 gap-y-1"
    >
      <MotionAvatar
        {...(initial && { initial: { opacity: 0, scale: 0.95 } })}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { delay: POP_LAYOUT_SYNC_DURATION },
        }}
        {...(id && { layoutId: id + "-avatar" })}
        className="mt-auto size-9"
      >
        <AvatarImage src={Message.avatarProps.src} alt="" />
        <AvatarFallback>{Message.avatarProps.fallback}</AvatarFallback>
      </MotionAvatar>

      <motion.div
        {...(initial && { initial: { opacity: 0 } })}
        animate={{
          opacity: 1,
          transition: { delay: POP_LAYOUT_SYNC_DURATION },
        }}
        layoutId={id + "-from"}
        className="text-muted-foreground col-start-2 row-start-2 origin-bottom-left text-xs"
      >
        {Message.from}
      </motion.div>

      <AnimatePresence mode="popLayout">
        {!typing ? (
          <motion.div
            key="content"
            {...(id && { layoutId: id + "-content" })}
            exit={{ opacity: 0 }}
            {...(initial && { initial: { opacity: 0 } })}
            animate={{
              opacity: 1,
              transition: { delay: POP_LAYOUT_SYNC_DURATION },
            }}
            className="bg-secondary text-secondary-foreground mt-auto size-fit max-w-3/4 origin-bottom-left rounded-xl rounded-bl-md px-3 py-2 shadow-md"
          >
            {Message.content}
          </motion.div>
        ) : (
          <motion.div
            key="typing"
            {...(id && { layoutId: id + "-typing" })}
            exit={{
              opacity: 0,
              transition: { duration: POP_LAYOUT_SYNC_DURATION },
            }}
            {...(initial && { initial: { opacity: 0, scale: 0.95 } })}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { delay: POP_LAYOUT_SYNC_DURATION },
            }}
            className="bg-secondary text-secondary-foreground col-start-2 mt-auto size-fit shrink-0 origin-bottom-left rounded-xl rounded-bl-md px-3 py-2"
          >
            <TypingIndicatorDots className="h-[1lh] w-5 shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TypingIndicatorDots = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 100 24" {...props}>
    <circle r="12" fill="currentColor" cx="12" cy="12"></circle>
    <circle r="12" fill="currentColor" cx="44" cy="12"></circle>
    <circle r="12" fill="currentColor" cx="76" cy="12"></circle>
  </svg>
);

interface OutgoingMessageProps extends HTMLMotionProps<"div"> {
  Message: OutgoingMessageType;
}

function OutgoingMessage({ Message, id, ...rest }: OutgoingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { delay: POP_LAYOUT_SYNC_DURATION },
      }}
      layoutId={id}
      {...rest}
      className="flex flex-col items-end gap-y-1"
    >
      <div className="bg-muted text-muted-foreground max-w-3/4 rounded-xl rounded-br-md px-3 py-2 shadow-md">
        {Message.content}
      </div>
      <CheckCheckIcon className="text-muted-foreground size-4" />
    </motion.div>
  );
}
