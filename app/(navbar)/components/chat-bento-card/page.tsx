import { ComponentPage } from "../_components/container";
import {
  TITLE,
  DESCRIPTION,
  DEFAULT_ACTIVE_FILE,
  ROOT_DIRECTORY,
  PROP_TABLE,
  USAGE,
} from "./page.data";
import { Metadata } from "next";
import { PackageManagerProvider } from "@/components/www/package-manager-providers";
import AnimatedTab from "@/components/www/animated-tab";
import { AnimatedTabsProvider } from "@/components/www/animated-tabs-provider";
import React from "react";
import { ThemePresetSwitcher } from "../../../../components/theme-preset-switcher";
import { ChatBentoCardDemo } from "@/components/chat-bento-card-demo";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: `${TITLE} | 100xUI`,
    description: DESCRIPTION,
    images: [
      {
        url: `/og/chat-bento-card.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
export default function ChatBentoCardPage() {
  return (
    <ComponentPage>
      <ComponentPage.Title>{TITLE}</ComponentPage.Title>
      <ComponentPage.Description>{DESCRIPTION}</ComponentPage.Description>
      <ThemePresetSwitcher />
      <ComponentPage.Preview
        container={false}
        className="flex justify-center py-10"
      >
        <ChatBentoCardDemo />
      </ComponentPage.Preview>

      <ComponentPage.Usage {...USAGE} />
      <ComponentPage.Installation>
        <ComponentPage.SubTitle>Installation</ComponentPage.SubTitle>
        <PackageManagerProvider>
          <div className="mb-10">
            <ComponentPage.SubSubTitle>
              CLI&nbsp;
              <i className="text-base font-light">(recommended)</i>
            </ComponentPage.SubSubTitle>
            <ComponentPage.Note note="cli-installation-step-1"></ComponentPage.Note>
            <ComponentPage.Cli title={TITLE}></ComponentPage.Cli>
          </div>
          <AnimatedTabsProvider>
            <ComponentPage.SubSubTitle>Manual</ComponentPage.SubSubTitle>
            <div className="mb-6" data-tracker="step-1">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-1">1</AnimatedTab>
                Install the following dependencies.
              </ComponentPage.Note>
              <ComponentPage.Dependencies
                dependencies={[
                  "motion",
                  "clsx",
                  "tailwind-merge",
                  "@radix-ui/react-avatar",
                ]}
              />
            </div>
            <div className="mb-6" data-tracker="step-2">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-2">2</AnimatedTab>
                Copy and paste the following code into your project.
              </ComponentPage.Note>
              <ComponentPage.FileExplorer
                defaultActiveFile={DEFAULT_ACTIVE_FILE}
                rootDirectory={ROOT_DIRECTORY}
              />
            </div>
            <div className="-mt-6 -mb-12 pt-6 pb-12" data-tracker="step-3">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-3">3</AnimatedTab> Finally, Update
                the import paths to match your project setup.
              </ComponentPage.Note>
            </div>
          </AnimatedTabsProvider>
        </PackageManagerProvider>
      </ComponentPage.Installation>
      <ComponentPage.Documentation>
        {PROP_TABLE.data.map(({ title, tableData }, i) => (
          <React.Fragment key={i}>
            <ComponentPage.SubSubTitle className="flex flex-col items-start text-base font-medium sm:text-lg">
              {title.map((eachTitle) => (
                <React.Fragment key={eachTitle}>
                  <span className="bg-muted text-muted-foreground p-0.5">
                    {eachTitle}
                  </span>
                </React.Fragment>
              ))}
            </ComponentPage.SubSubTitle>
            <ComponentPage.PropsTable tableData={tableData} />
          </React.Fragment>
        ))}
      </ComponentPage.Documentation>
    </ComponentPage>
  );
}

//   const startAnimation = () => {
//     const advanceMessage = () => {
//       if (messages[upcomingMessage.current]) {
//         setTotalMessagesAnimated((prev) => prev + 1);
//         setTyping(true);
//         upcomingMessage.current = upcomingMessage.current + 1;
//         if (messages[upcomingMessage.current]) {
//           const nextDelayInSec =
//             messages[upcomingMessage.current].type === "send"
//               ? staggerMessagesInSec - typingDurationInSec
//               : staggerMessagesInSec;

//           console.log(nextDelayInSec * 1000);
//           timerRef.current = setTimeout(
//             advanceMessage,
//             (staggerMessagesInSec + nextDelayInSec) * 1000,
//           );
//         }
//       }
//     };
//     advanceMessage();
//     // timerRef.current = setInterval(
//     //   advanceMessage,
//     //   staggerMessagesInSec * 1000,
//     // );
//   };

// "use client";
// import { cn } from "@/lib/utils";
// import { CheckCheckIcon } from "lucide-react";
// // import BentoCardAvatar from "@/bento-card-avatar.png";
// import {
//   AnimatePresence,
//   HTMLMotionProps,
//   motion,
//   stagger,
// } from "motion/react";
// import React, {
//   ReactNode,
//   SetStateAction,
//   useEffect,
//   useId,
//   useRef,
//   useState,
// } from "react";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// interface SendType {
//   type: "send";
//   content: ReactNode;
// }
// interface ReceiveType {
//   type: "receive";
//   content: ReactNode;
//   from: string;
//   avatarProps: { src: "/bento-card-avatar.png"; fallback: string };
// }

// const MotionAvatar = motion.create(Avatar);
// export type Messages = SendType | ReceiveType;

// const SYNC_POPLAYOUT_ANIMATION = 0.2;
// export function ChatBentoCard({
//   messages,
//   className,
//   whenToTrigger = "mouseIn",
//   initialNumberOfMessages = 1,
//   rateAtWhichMessagesAreRenderedInSec = 2,
//   typingDurationInclusiveToTheRateInSec = 0.8,
//   ...rest
// }: React.ComponentProps<"div"> & {
//   messages: Messages[];
//   rateAtWhichMessagesAreRenderedInSec?: number;
//   typingDurationInclusiveToTheRateInSec?: number;
//   initialNumberOfMessages?: number;
//   whenToTrigger?: "mouseIn" | "view";
// }) {
//   const layoutIdPrefix = useId();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [typing, setTyping] = useState(true);
//   const intervalRef = useRef<NodeJS.Timeout>(undefined);
//   const chatContainerRef = useRef<HTMLDivElement>(null);

//   const startAnimation = () => {
//     const advanceMessage = () => {
//       if (messages[currentIndex + 1]) {
//         setCurrentIndex((prev) => prev + 1);
//       } else {
//         clearInterval(intervalRef.current);
//       }
//       setTyping(true);
//     };
//     advanceMessage();
//     intervalRef.current = setInterval(
//       advanceMessage,
//       rateAtWhichMessagesAreRenderedInSec * 1000,
//     );
//   };

//   const resetAnimation = () => {
//     setCurrentIndex(0);
//     clearInterval(intervalRef.current);
//   };

//   useEffect(() => {
//     if (whenToTrigger !== "view") return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) startAnimation();
//         else resetAnimation();
//       },
//       { threshold: 1 },
//     );
//     observer.observe(chatContainerRef.current!);

//     return () => {
//       clearInterval(intervalRef.current);
//       observer.disconnect();
//     };
//   }, []);

//   return (
//     <div
//       ref={chatContainerRef}
//       onMouseEnter={() => whenToTrigger === "mouseIn" && startAnimation()}
//       onMouseLeave={() => whenToTrigger === "mouseIn" && resetAnimation()}
//       className={cn(
//         "bg-muted relative flex size-full flex-col items-center justify-end gap-y-2 overflow-hidden p-2 text-sm",
//         className,
//       )}
//       {...rest}
//     >
//       <motion.div
//         className="text-muted-foreground pt-2 text-xs"
//         layoutId={`${layoutIdPrefix}-timestamp`}
//         transition={
//           currentIndex === 0
//             ? { layout: { delay: (messages.length - 1) * 0.1 } }
//             : undefined
//         }
//       >
//         Today
//       </motion.div>
//       <div className="flex w-full flex-1 flex-col justify-end">
//         <motion.div
//           layoutId={layoutIdPrefix + "chat-box-initial"}
//           className="relative mb-2 flex flex-col gap-y-2"
//           transition={
//             currentIndex === 0
//               ? { layout: { delay: (messages.length - 1) * 0.1 } }
//               : undefined
//           }
//         >
//           {messages
//             .slice(0, initialNumberOfMessages)
//             .map((eachMessage, i) =>
//               eachMessage.type === "send" ? (
//                 <SendMessage
//                   initial={false}
//                   Message={eachMessage as SendType}
//                   key={`${layoutIdPrefix}-initial-${i}`}
//                 />
//               ) : (
//                 <ReceiveMessage
//                   Message={eachMessage as ReceiveType}
//                   key={`${layoutIdPrefix}-initial-${i}`}
//                   typingDurationInclusiveToTheRateInSec={
//                     typingDurationInclusiveToTheRateInSec
//                   }
//                   typing={false}
//                   initial={false}
//                 />
//               ),
//             )}
//         </motion.div>
//         <AnimatePresence mode="popLayout" initial={false}>
//           {currentIndex !== 0 && (
//             <motion.div
//               key={layoutIdPrefix + "chat-box-animate"}
//               className="space-y-2"
//               exit="exit"
//               variants={{
//                 exit: {
//                   transition: {
//                     delayChildren: stagger(0.1),
//                   },
//                 },
//               }}
//             >
//               {messages
//                 .slice(
//                   initialNumberOfMessages,
//                   currentIndex + initialNumberOfMessages,
//                 )
//                 .map((message, index) =>
//                   message.type === "send" ? (
//                     <SendMessage
//                       Message={message}
//                       key={`${layoutIdPrefix}-${index}`}
//                       layoutId={`${layoutIdPrefix}-${index}`}
//                       variants={{
//                         exit: {
//                           opacity: 0,
//                           scale: 0.95,
//                         },
//                       }}
//                     />
//                   ) : (
//                     <ReceiveMessage
//                       typing={index + 1 === currentIndex ? typing : false}
//                       setTyping={setTyping}
//                       Message={message}
//                       key={`${layoutIdPrefix}-${index}`}
//                       layoutId={`${layoutIdPrefix}-${index}`}
//                       typingDurationInclusiveToTheRateInSec={
//                         typingDurationInclusiveToTheRateInSec
//                       }
//                       variants={{
//                         exit: {
//                           opacity: 0,
//                           scale: 0.95,
//                         },
//                       }}
//                       initial={true}
//                     />
//                   ),
//                 )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// function ReceiveMessage({
//   Message,
//   typing,
//   setTyping,
//   layoutId,
//   typingDurationInclusiveToTheRateInSec,
//   initial,
//   ...rest
// }: {
//   Message: ReceiveType;
//   layoutId?: string;
//   typing: boolean;
//   typingDurationInclusiveToTheRateInSec: number;
//   setTyping?: React.Dispatch<SetStateAction<boolean>>;
// } & HTMLMotionProps<"div">) {
//   useEffect(() => {
//     const timeout = setTimeout(
//       () => setTyping?.(false),
//       typingDurationInclusiveToTheRateInSec * 1000,
//     );
//     return () => clearTimeout(timeout);
//   }, []);

//   return (
//     <motion.div
//       {...(layoutId && { key: layoutId })}
//       {...rest}
//       className="grid w-full origin-bottom-left grid-cols-[auto_1fr] gap-x-2 gap-y-1"
//     >
//       <MotionAvatar
//         initial={initial && { opacity: 0, scale: 0.95 }}
//         animate={{
//           opacity: 1,
//           scale: 1,
//           transition: { delay: SYNC_POPLAYOUT_ANIMATION },
//         }}
//         {...(layoutId && { layoutId: layoutId + "-avatar" })}
//         className="mt-auto size-9"
//       >
//         <AvatarImage src={Message.avatarProps.src} />
//         <AvatarFallback>{Message.avatarProps.fallback}</AvatarFallback>
//       </MotionAvatar>
//       <motion.div
//         initial={initial && { opacity: 0 }}
//         animate={{
//           opacity: 1,
//           transition: { delay: SYNC_POPLAYOUT_ANIMATION },
//         }}
//         layoutId={layoutId + "-from"}
//         className="text-muted-foreground col-start-2 row-start-2 origin-bottom-left text-xs"
//       >
//         {Message.from}
//       </motion.div>
//       <AnimatePresence mode="popLayout">
//         {!typing ? (
//           <motion.div
//             key="content"
//             {...(layoutId && { layoutId: layoutId + "-content" })}
//             exit={{ opacity: 0 }}
//             initial={initial && { opacity: 0 }}
//             animate={{
//               opacity: 1,
//               transition: { delay: SYNC_POPLAYOUT_ANIMATION },
//             }}
//             className="bg-primary text-primary-foreground mt-auto size-fit max-w-3/4 origin-bottom-left rounded-xl rounded-bl-md px-3 py-2 shadow-md"
//           >
//             {Message.content}
//           </motion.div>
//         ) : (
//           <motion.div
//             key="typing"
//             {...(layoutId && { layoutId: layoutId + "-typing" })}
//             exit={{
//               opacity: 0,
//               transition: { duration: SYNC_POPLAYOUT_ANIMATION },
//             }}
//             initial={initial && { opacity: 0, scale: 0.95 }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//               transition: { delay: SYNC_POPLAYOUT_ANIMATION },
//             }}
//             className="bg-primary text-primary-foreground col-start-2 mt-auto flex size-fit origin-bottom-left items-center gap-0.5 rounded-xl rounded-bl-md px-3 py-2"
//           >
//             <svg viewBox="0 0 88 24" className="h-[1lh] w-5">
//               <circle r="12" fill="currentColor" cx="12" cy="12"></circle>
//               <circle r="12" fill="currentColor" cx="44" cy="12"></circle>
//               <circle r="12" fill="currentColor" cx="76" cy="12"></circle>
//             </svg>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }
// function SendMessage({
//   Message,
//   layoutId,
//   ...rest
// }: {
//   Message: SendType;
// } & HTMLMotionProps<"div">) {
//   return (
//     <motion.div
//       initial={{
//         opacity: 0,
//         scale: 0.95,
//       }}
//       animate={{
//         opacity: 1,
//         scale: 1,
//         transition: { delay: SYNC_POPLAYOUT_ANIMATION },
//       }}
//       layoutId={layoutId}
//       {...rest}
//       key={layoutId}
//       className="flex flex-col items-end gap-y-1"
//     >
//       <div className="bg-card max-w-3/4 rounded-xl rounded-br-md px-3 py-2 shadow-md">
//         {Message.content}
//       </div>
//       <CheckCheckIcon className="text-muted-foreground size-4 transition-colors" />
//     </motion.div>
//   );
// }
