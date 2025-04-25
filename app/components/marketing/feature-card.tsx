import { ReactNode } from "react";
import { AnimateOnScroll } from "./animated-sections";

type Props = { icon: ReactNode; title: string; description: string; delay?: number };

export default function FeatureCard({ icon, title, description, delay = 0 }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </AnimateOnScroll>
  );
}
