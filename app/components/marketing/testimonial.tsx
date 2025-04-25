import { AnimateOnScroll } from "./animated-sections";

type Props = {
  quote: string;
  author: string;
  role: string;
  delay?: number;
};

export default function Testimonial({ quote, author, role, delay = 0 }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="bg-card rounded-xl p-6 shadow-lg h-full">
        <p className="italic mb-4 text-muted-foreground">“{quote}”</p>

        <div>
          <p className="font-bold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </AnimateOnScroll>
  );
}
