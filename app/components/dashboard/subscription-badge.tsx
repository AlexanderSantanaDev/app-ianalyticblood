"use client";

import { useSession } from "next-auth/react";
import { Zap, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
/***********************************************************************************************************************/
export default function SubscriptionBadge({ className }: { className?: string }) {
  // Hooks
  const { data: session } = useSession();
  const plan = session?.user?.plan || "free";
  const isPremium = plan === "premium" || plan === "enterprise";
  /***********************************************************************************************************************/
  //JSX
  if (!isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/50 transition-all hover:bg-muted/60",
          className,
        )}
      >
        <Zap className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          Básico
        </span>
      </motion.div>
    );
  }
  /***********************************************************************************************************************/
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={cn(
        "relative flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full",
        "bg-gradient-to-r from-primary-rgb/20 via-primary/10 to-secondary-rgb/20 backdrop-blur-md",
        "border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] group cursor-default",
        className,
      )}
    >
      {/* Animación de brillo sutil en el badge del navbar */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative flex h-4 w-4 items-center justify-center">
        <Crown className="h-3 w-3 text-amber-500 fill-amber-500 animate-pulse" />
        <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.15em] gradient-text">
        {plan}
      </span>
    </motion.div>
  );
}
