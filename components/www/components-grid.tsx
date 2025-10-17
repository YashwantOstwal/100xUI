import Card from "./card";
import SpinningTestimonialsShowcase from "@/public/og/spinning-testimonials.png";
import MotionLinkShowcase from "@/public/og/motion-link.png";

import ParallaxCardsShowcase from "@/public/og/parallax-cards.png";
import InPageNavbarShowcase from "@/public/og/in-page-navbar.png";
import MotionDockShowcase from "@/public/og/motion-dock.png";
import TextSwitcherShowcase from "@/public/og/text-switcher.png";
import MorphModal from "@/public/og/morph-modal.png";
import Default from "@/public/og/default.png";
const components = [
  {
    name: "Chat bento card",
    href: "/components/chat-bento-card",
    imgProps: {
      src: Default,
      alt: "chat-bento-card",
    },
  },
  {
    name: "Morph modal",
    href: "/components/morph-modal",
    imgProps: {
      src: MorphModal,
      alt: "morph-modal",
    },
  },
  {
    name: "Spinning testimonials",
    href: "/components/spinning-testimonials",
    imgProps: {
      src: SpinningTestimonialsShowcase,
      alt: "spinning-testimonials",
    },
  },
  {
    name: "Motion link",
    href: "/components/motion-link",
    imgProps: {
      src: MotionLinkShowcase,
      alt: "motion-link",
    },
  },

  {
    name: "Parallax cards",
    href: "/components/parallax-cards",
    imgProps: {
      src: ParallaxCardsShowcase,
      alt: "parallax-cards",
    },
  },
  {
    name: "In-page navbar",
    href: "/components/in-page-navbar",
    imgProps: {
      src: InPageNavbarShowcase,
      alt: "in-page-navbar",
    },
  },
  {
    name: "Text switcher",
    href: "/components/text-switcher",
    imgProps: {
      src: TextSwitcherShowcase,
      alt: "text-switcher",
    },
  },
  {
    name: "Motion dock",
    href: "/components/motion-dock",
    imgProps: {
      src: MotionDockShowcase,
      alt: "motion-dock",
    },
  },
];

export function ComponentsGrid() {
  return (
    <section
      id="components"
      className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-x-3 gap-y-2.5 pt-8 sm:grid-cols-2"
    >
      {components.map((props) => (
        <Card key={props.href} {...props} />
      ))}
    </section>
  );
}
