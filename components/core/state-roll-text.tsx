"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface StateRollTextProps {
  value: string;
  className?: string;
}

/** Transitions a state value out through the top before the next value enters from below. */
export function StateRollText({ value, className }: StateRollTextProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className={cn("relative inline-flex min-h-[1.35em] overflow-hidden align-middle leading-[1.35]", className)} aria-live="polite">
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={value}
          initial={prefersReducedMotion ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="block whitespace-nowrap leading-[1.35]"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
