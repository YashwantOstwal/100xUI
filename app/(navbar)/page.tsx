import { ComponentsGrid } from "@/components/www/components-grid";
import { Hero } from "@/components/www/hero";

export default function Page() {
  return (
    <main className="mx-auto max-w-screen-2xl px-3 py-16">
      <Hero />
      <ComponentsGrid />
    </main>
  );
}
