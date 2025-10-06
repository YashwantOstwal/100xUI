import Link from "next/link";
import * as motion from "motion/react-client";
import ComponentIcon from "@/icons/component.icon";
import CodeIcon from "@/icons/code.icon";

import Image, { type ImageProps } from "next/image";

const lineDrawVariants = {
  initial: { pathLength: 1 },
  whileHover: {
    pathLength: [0, 1],
  },
};
const lineDrawTransition = { duration: 0.8 }; // add easeInOut
interface CardProps {
  name: string;
  href: string;
  imgProps?: ImageProps;
}
const Card = ({ name, href, imgProps }: CardProps) => (
  <Link
    href={href}
    className="focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:bg-accent/85 focus-visible:text-accent-foreground/85 hover:bg-accent/85 hover:text-accent-foreground/85 rounded-xl transition-opacity duration-150 ease-out hover:opacity-75 focus-visible:opacity-75 focus-visible:ring-2 focus-visible:ring-offset-3 focus-visible:!outline-0 focus-visible:outline-none dark:hover:opacity-75 dark:focus-visible:opacity-75"
  >
    <div
      className="bg-card text-card-foreground light:border border-border/60 overflow-hidden rounded-xl p-1 shadow-[0px_0px_1px_0px_rgba(25,28,33,0.06),0px_5px_10px_-2px_rgba(106,115,133,0.12),0px_2px_6px_-2px_rgba(0,0,0,0.12)] dark:shadow-[0_-1px_rgba(255,255,255,0.06),0_4px_8px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.1),0_1px_6px_-4px_#000]"
      // shadow-md border-border rounded-2xl border
    >
      <div className="indent-1 text-base leading-[30px]">{name}</div>

      <div
        className="border-border/40 bg-muted relative aspect-[1.90] overflow-hidden rounded-lg rounded-b-md border"
        //  rounded-xl border-border
      >
        {imgProps && (
          <Image
            src={imgProps.src}
            alt={imgProps.alt}
            fill
            className="object-cover"
          />
        )}
      </div>
      <motion.div
        initial="initial"
        whileHover="whileHover"
        className="from-secondary text-secondary-foreground to-background light:inset-shadow-border/40 mt-1 flex items-center justify-center rounded-lg rounded-t-md bg-gradient-to-b px-3.5 py-2 text-lg shadow-sm inset-shadow-2xs [&>svg]:size-5"
        // rounded-xl
      >
        <ComponentIcon
          variants={lineDrawVariants}
          transition={lineDrawTransition}
        />
        &nbsp;+&nbsp;
        <CodeIcon variants={lineDrawVariants} transition={lineDrawTransition} />
      </motion.div>
    </div>
  </Link>
);

export default Card;
