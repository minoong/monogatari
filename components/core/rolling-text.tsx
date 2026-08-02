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
    <span className={cn("relative -my-[0.12em] inline-grid overflow-hidden py-[0.12em] align-baseline leading-[1.2]", className)} aria-live="polite">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">{value}</span>
      <span className="sr-only">{value}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 col-start-1 row-start-1 whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
