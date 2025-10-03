"use client";
import { useTransform, useScroll, motion } from "motion/react";
import { useRef } from "react";

export default function Roblox({
  navHeight = 0,
  offset = 80,
  robloxHeight = 100,
  containerHeight = 1000,
}: {
  navHeight?: number;
  offset?: number;
  robloxHeight?: number;
  containerHeight?: number;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: [
      "0 0",
      `${containerHeight - (2 * (offset + navHeight) + robloxHeight)}px 0`,
    ],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], ["0deg", "-270deg"]);
  // const rotateY = useTransform(scrollYProgress, [0, 1], ["-15deg", "0deg"]);
  return (
    <>
      <style>
        {`
        #roblox-roll{
        --h : ${robloxHeight}px;}
      `}
      </style>
      <motion.div
        ref={targetRef}
        id="roblox-roll"
        style={{ paddingBlock: offset + navHeight, height: containerHeight }}
        className="relative mx-auto flex max-w-2xl justify-center text-nowrap whitespace-nowrap"
      >
        <div
          style={{
            top: offset + navHeight,
          }}
          data-slot="parent-card"
          className="sticky h-(--h) w-[85%] text-[clamp(0px,_6.5vw,_45px)] leading-none font-bold uppercase [perspective:1000px]"
        >
          <motion.div
            className="[&>div]:bg-muted [&>div]:text-muted-foreground relative h-full"
            style={{
              rotateX,
              // rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <div className="absolute inset-0 flex [transform:translateZ(calc(var(--h)_/_2))] items-center justify-center overflow-hidden">
              Transform your
            </div>
            <div className="absolute inset-0 flex [transform:rotateX(0.25turn)_translateZ(calc(var(--h)_/_2))] items-center justify-center overflow-hidden">
              User Interface
            </div>

            <div className="absolute inset-0 flex [transform:rotateX(0.5turn)_translateZ(calc(var(--h)_/_2))] items-center justify-center overflow-hidden">
              from standard
            </div>

            <div className="absolute inset-0 flex [transform:rotateX(-0.25turn)_translateZ(calc(var(--h)_/_2))] items-center justify-center overflow-hidden">
              to statement.
            </div>
            <div className="absolute left-[calc(var(--h)_/_-2)] aspect-square h-(--h) [transform:rotateY(0.25turn)] bg-white"></div>

            <div className="absolute right-[calc(var(--h)_/_-2)] aspect-square h-(--h) rotate-y-90 bg-white" />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// "use client";
// import { useTransform, useScroll, motion } from "motion/react";
// import { useRef } from "react";

// export default function Experiment() {
//   const targetRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: targetRef,
//     offset: ["0 0", "1 0"],
//   });

//   const rotateX = useTransform(scrollYProgress, [0, 0.75], ["0deg", "-270deg"]);
//   // const rotateY = useTransform(scrollYProgress, [0, 0.75], ["-15deg", "0deg"]);
//   return (
//     <>
//       <style>
//         {`
//         .roblox-font-size {
//     font-size: clamp(0px, 5vw, 70px);
//   }
//   .parent-card {
//     height: 154px;
//   }
//   .front-card {
//     transform: translateZ(77px);
//   }
//   .top-card {
//     transform: rotateX(0.25turn) translateZ(77px);
//   }
//   .back-card {
//     transform: rotateX(0.5turn) translateZ(77px);
//   }
//   .bottom-card {
//     transform: rotateX(-0.25turn) translateZ(77px);
//   }
//   .left-card {
//     aspect-ratio: 1;
//     height: 154px;
//     left: -77px;
//     transform: rotateY(0.25turn);
//   }
//   .right-card {
//     aspect-ratio: 1;
//     height: 154px;
//     right: -77px;
//     transform: rotateY(0.25turn);
//   }
//   @media (min-width: 640px) and (max-width: 1024px) {
//     .left-card,
//     .right-card,
//     .parent-card {
//       height: 124px;
//     }
//     .left-card {
//       left: -62px;
//     }
//     .right-card {
//       right: -62px;
//     }
//     .front-card {
//       transform: translateZ(62px);
//     }
//     .top-card {
//       transform: rotateX(0.25turn) translateZ(62px);
//     }
//     .back-card {
//       transform: rotateX(0.5turn) translateZ(62px);
//     }
//     .bottom-card {
//       transform: rotateX(-0.25turn) translateZ(62px);
//     }
//   }
//   @media (max-width: 640px) {
//     .roblox-font-size {
//       font-size: 7vw;
//     }
//     .left-card,
//     .right-card,
//     .parent-card {
//       height: 100px;
//     }
//     .left-card {
//       left: -50px;
//     }
//     .right-card {
//       right: -50px;
//     }
//     .front-card {
//       transform: translateZ(50px);
//     }
//     .top-card {
//       transform: rotateX(0.25turn) translateZ(50px);
//     }
//     .back-card {
//       transform: rotateY(0.5turn) rotateZ(0.5turn) translateZ(50px);
//     }
//     .bottom-card {
//       transform: rotateX(-0.25turn) translateZ(50px);
//     }
//   }
//       `}
//       </style>
//       <motion.div
//         ref={targetRef}
//         className="relative mx-auto flex h-[800px] max-w-[500px] justify-center bg-red-400 pt-[100px] text-nowrap white/40space-nowrap text-neutral-800 md:h-[1000px]"
//       >
//         <div className="roblox-font-size  parent-card sticky top-[100px] w-[90%] font-bold uppercase [perspective:1000px] max-sm:top-12 sm:w-3/4 lg:w-4/6">
//           <motion.div
//             className="relative h-full"
//             style={{
//               rotateX,
//               // rotateY: rotateY,
//               transformStyle: "preserve-3d",
//             }}
//           >
//             <div className="front-card absolute inset-0 grid place-items-center bg-white/40  text-[#136a8a]">
//               <p
//                 style={{
//                   backgroundImage: "linear-gradient(to top,#136a8a,#14566e)",
//                 }}
//                 className="bg-[image:] bg-clip-text text-transparent t"
//               >
//                 Text animations
//               </p>
//             </div>

//             <div className="back-card absolute inset-0 grid place-items-center bg-white/40 text-[#136a8a]">
//               <p
//                 style={{
//                   backgroundImage: "linear-gradient(to top,#15404f,#172824)",
//                 }}
//                 className="bg-clip-text text-transparent"
//               >
//                 and stunning for
//               </p>
//             </div>

//             <div className="top-card absolute inset-0 grid place-items-center bg-white/40 text-[#136a8a]">
//               <p
//                 style={{
//                   backgroundImage: "linear-gradient(to top,#14566e,#15404f)",
//                 }}
//                 className="bg-clip-text text-transparent"
//               >
//                 made simple
//               </p>
//             </div>

//             <div className="bottom-card absolute inset-0 grid place-items-center bg-white/40 text-[#136a8a]">
//               <p
//                 style={{
//                   backgroundImage: "linear-gradient(to top,#172824,#171717)",
//                 }}
//                 className="bg-[image:] bg-clip-text text-transparent"
//               >
//                 React/Nextjs Apps
//               </p>
//             </div>

//             <div className="left-card absolute bg-white/40 text-[#136a8a]"></div>

//             <div className="right-card absolute bg-white/40 text-[#136a8a]"></div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </>
//   );
// }
