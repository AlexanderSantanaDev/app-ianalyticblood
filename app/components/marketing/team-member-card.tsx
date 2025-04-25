"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateOnScroll } from "./animated-sections";

type Props = {
  name: string;
  role: string;
  img: string;
  delay?: number;
};

export function TeamMemberCard({ name, role, img, delay = 0 }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative">
          <Image
            src={img}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-muted-foreground">{role}</p>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
