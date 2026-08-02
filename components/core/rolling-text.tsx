"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface RollingTextProps {
  value: string;
  className?: string;
}

/** A compact, value-driven version of Motion Primitives' rolling text treatment. */
export function RollingText({ value, className }: RollingTextProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className={cn("relative inline-block h-[1.35em] overflow-hidden align-middle", className)} aria-live="polite">
      <span aria-hidden="true" className="invisible block leading-[1.35]">{value}</span>
      <span className="sr-only">{value}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 block whitespace-nowrap leading-[1.35]"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
