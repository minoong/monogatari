"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface TextRollProps {
  children: string;
  className?: string;
  /** Changes when a selected tab should briefly play the roll on touch devices. */
  triggerKey?: string;
}

const characterTransition = {
  duration: 0.36,
  ease: [0.16, 1, 0.3, 1] as const,
};

/**
 * Skiper-style character roll. The visible duplicate text is hidden from assistive
 * technology, so this can safely be used inside controls such as HeroUI Tabs.
 */
export function TextRoll({ children, className, triggerKey }: TextRollProps) {
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTriggered, setIsTriggered] = React.useState(false);

  React.useEffect(() => {
    if (!triggerKey || reduceMotion) return;

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      setIsTriggered(true);
      timeoutId = window.setTimeout(() => setIsTriggered(false), 520);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [reduceMotion, triggerKey]);

  const isRolling = isHovered || isTriggered;

  return (
    <span
      className={cn("relative inline-grid overflow-hidden align-middle leading-[1.2]", className)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <span className="sr-only">{children}</span>
      <span className="col-start-1 row-start-1 whitespace-pre" aria-hidden="true">
        {[...children].map((character, index) => (
          <span key={`${character}-${index}`} className="relative inline-block overflow-hidden align-top">
            <motion.span
              animate={{ y: reduceMotion ? "0%" : isRolling ? "-105%" : "0%" }}
              transition={{ ...characterTransition, delay: index * 0.025 }}
              className="block whitespace-pre"
            >
              {character}
            </motion.span>
            <motion.span
              animate={{ y: reduceMotion ? "105%" : isRolling ? "0%" : "105%" }}
              transition={{ ...characterTransition, delay: index * 0.025 }}
              className="absolute inset-x-0 top-0 block whitespace-pre"
            >
              {character}
            </motion.span>
          </span>
        ))}
      </span>
    </span>
  );
}
