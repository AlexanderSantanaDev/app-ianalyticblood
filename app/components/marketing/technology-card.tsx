"use client";

import { Brain, Code, FlaskRoundIcon as Flask, FileText, Database, LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateOnScroll } from "./animated-sections";

export const iconMap = {
  brain: <Brain className="h-6 w-6 text-white" />,
  code: <Code className="h-6 w-6 text-white" />,
  flask: <Flask className="h-6 w-6 text-white" />,
  file: <FileText className="h-6 w-6 text-white" />,
  database: <Database className="h-6 w-6 text-white" />,
  chart: <LineChart className="h-6 w-6 text-white" />,
} as const;

type Props = {
  icon: keyof typeof iconMap;
  title: string;
  desc: string;
  delay?: number;
};

export function TechnologyCard({ icon, title, desc, delay = 0 }: Props) {
  return (
    <AnimateOnScroll delay={delay}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="rounded-full w-12 h-12 flex items-center justify-center gradient-bg mb-4">
            {iconMap[icon]}
          </div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground">{desc}</p>
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
}
