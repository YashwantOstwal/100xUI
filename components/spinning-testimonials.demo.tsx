import { SpinningCarousel } from "@/components/spinning-carousel";
import {
  TestimonialCard,
  TestimonialContent,
  TestimonialAvatar,
  TestimonialAvatarFallback,
  TestimonialAvatarImage,
  TestimonialName,
  TestimonialPosition,
  TestimonialAuthor,
} from "@/components/ui/testimonial";

export function SpinningTestimonialsDemo() {
  return (
    <SpinningCarousel className="h-[calc(500px_-_30vw)] min-h-60 lg:h-[calc(400px_-_7vw)]">
      {TESTIMONIALS.map(({ name, testimonial, position, src, fallback }) => (
        <TestimonialCard key={name}>
          <TestimonialContent className="-indent-1.5 lg:-indent-2">
            &quot;{testimonial}&quot;
          </TestimonialContent>
          <TestimonialAuthor>
            <TestimonialAvatar className="size-10">
              <TestimonialAvatarImage src={src} />
              <TestimonialAvatarFallback>{fallback}</TestimonialAvatarFallback>
            </TestimonialAvatar>
            <TestimonialName>{name}</TestimonialName>
            <TestimonialPosition>{position}</TestimonialPosition>
          </TestimonialAuthor>
        </TestimonialCard>
      ))}
    </SpinningCarousel>
  );
}

const TESTIMONIALS = [
  {
    testimonial:
      "This SaaS cut our onboarding time from days to hours, all without messy spreadsheets.",
    name: "Guillermo Rauch",
    position: "CEO / Vercel",
    src: "https://github.com/rauchg.png",
    fallback: "GR",
  },
  {
    testimonial:
      "The dashboard delivers real-time insights, helping us make faster, smarter decisions.",
    name: "Theo Browne",
    position: "CEO / Ping Labs",
    src: "https://github.com/t3dotgg.png",
    fallback: "TB",
  },
  {
    testimonial:
      "We replaced three tools with this one. It’s clean, intuitive, and a joy to use.We replaced three tools with this one. It’s clean, intuitive, and a joy to use.",
    name: "Kent C. Dodds",
    position: "Frontend Educator",
    src: "https://github.com/kentcdodds.png",
    fallback: "KCD",
  },
  {
    testimonial:
      "Support is fast, friendly, and the product keeps getting better with each update.",
    name: "shadcn",
    position: "Creator of shadcn/ui",
    src: "https://github.com/shadcn.png",
    fallback: "CN",
  },
  {
    name: "Paul Copperstone",
    position: "CEO / Supabase",
    testimonial:
      "Setup took less than a day, and productivity improved immediately across teams.",
    src: "https://github.com/kiwicopple.png",
    fallback: "PC",
  },
];
