import Image from "next/image";

import Image1 from "@/public/calvin-1.jpg";
import Image21 from "@/public/calvin-couple-jeans.jpg";
import Image22 from "@/public/calvin-couple-jeans-2.jpg";
import Image31 from "@/public/denim-black.jpg";
import Image32 from "@/public/calvin.jpg";
import Image41 from "@/public/download.webp";
import Image42 from "@/public/image-41.jpg";

import { ParallaxCards } from "./parallax-cards";
export function ParallaxCardsDemo() {
  return (
    <ParallaxCards maxStackedCards={3} top="54px">
      <PlaceholderCard
      // index={0}
      >
        <Image src={Image1} alt="" fill className="object-cover object-top" />
      </PlaceholderCard>
      <PlaceholderCard>
        <div className="grid size-full grid-cols-2">
          <div className="relative w-full">
            <Image
              src={Image21}
              alt=""
              fill
              className="object-cover object-bottom"
            />
          </div>
          <div className="relative w-full">
            <Image
              src={Image22}
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      </PlaceholderCard>
      <PlaceholderCard>
        <div className="grid size-full grid-cols-2">
          <div className="relative w-full">
            <Image
              src={Image32}
              alt=""
              fill
              className="object-cover object-bottom"
            />
          </div>
          <div className="relative w-full">
            <Image
              src={Image31}
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      </PlaceholderCard>
      <PlaceholderCard>
        <div className="grid size-full grid-cols-2">
          <div className="relative w-full">
            <Image
              src={Image42}
              alt=""
              fill
              className="object-cover object-bottom"
            />
          </div>
          <div className="relative w-full">
            <Image
              src={Image41}
              alt=""
              fill
              className="object-cover object-top"
            />
          </div>
        </div>
      </PlaceholderCard>
    </ParallaxCards>
  );
}

function PlaceholderCard({
  // index,
  children,
}: {
  // index: number;
  children: React.ReactNode;
}) {
  // function Message({ children }: { children: string }) {
  //   return (
  //     <span className="absolute top-0.75 left-0.75 text-[9px] leading-none sm:text-xs">
  //       {children}
  //     </span>
  //   );
  // }

  return (
    <div
      className="relative h-140"
      // style={{ backgroundColor: `var(--chart-${index + 1})` }}
    >
      {/* <div className="border-foreground relative size-full border border-dashed p-4 sm:p-5">
        <Message>Parallax Cards</Message>

        <div className="size-full p-3.5 sm:p-5">
          <div className="border-foreground relative z-20 size-full border p-4 sm:px-6 sm:py-5">
            <Message>{`Card #${index + 1}`}</Message>

            <div className="border-foreground relative grid size-full place-items-center overflow-hidden border border-dashed">
              <PlusIcon />
            </div>
          </div>
        </div>
      </div> */}
      {children}
    </div>
  );
}
