import { ReactNode } from "react";
import { AnimateOnScroll } from "./animated-sections";

type Props = {
  number: string;
  title: string;
  description: string;
  delay?: number;
  /** Extra content opcional –por si algún día quieres meter un icono */
  children?: ReactNode;
};

export default function ProcessStep({ number, title, description, delay = 0, children }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <div className="flex items-start space-x-4">
        <div className="rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center gradient-bg text-white font-bold">
          {number}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>

          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </AnimateOnScroll>
  );
}
