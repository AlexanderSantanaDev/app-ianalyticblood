"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateOnScroll } from "./animated-sections";
/***********************************************************************************************************************/
/** Props para el componente TeamMemberCard. */
type Props = {
  name: string;
  role: string;
  img: string;
  delay?: number;
};
/***********************************************************************************************************************/
/** Componente modular para mostrar los miembros del equipo. */
export function TeamMemberCard({ name, role, img, delay = 0 }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <Card
        className="overflow-hidden border-white/5 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all 
      duration-500 shadow-xl"
      >
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100
           transition-opacity duration-500"
          />
        </div>
        <CardContent className="p-5 relative z-10 transition-colors">
          <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-muted-foreground text-sm font-medium">{role}</p>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
