"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface StateTextRollProps {
  value: string;
  previousValue: string;
  /** Incremented whenever either flight tab changes. */
  transitionKey: number;
  className?: string;
}

// Matched to Skiper58's source implementation.
const STAGGER = 0.016;
const DURATION = 0.18;

const outgoingVariants = {
  initial: { y: 0 },
  hovered: { y: "-100%" },
};

const incomingVariants = {
  initial: { y: "100%" },
  hovered: { y: 0 },
};

/**
 * Uses Skiper58's two-line hover construction for a value change: the outgoing
 * value rolls upward while the next value rises from below, character by character.
 */
export function StateTextRoll({ value, previousValue, transitionKey, className }: StateTextRollProps) {
  const reduceMotion = useReducedMotion();
  const [settledKey, setSettledKey] = React.useState(transitionKey);
  const isRolling = !reduceMotion && transitionKey !== settledKey;

  React.useEffect(() => {
    if (!isRolling) return;

    const longestText = Math.max(previousValue.length, value.length);
    const settleTimer = window.setTimeout(
      () => setSettledKey(transitionKey),
      DURATION * 1000 + Math.ceil((longestText - 1) / 2) * STAGGER * 1000 + 40,
    );

    return () => window.clearTimeout(settleTimer);
  }, [isRolling, previousValue, transitionKey, value]);

  if (reduceMotion) return <span className={className}>{value}</span>;

  const getDelay = (index: number, length: number) => STAGGER * Math.abs(index - (length - 1) / 2);

  return (
    <span className={cn("relative inline-block overflow-hidden align-middle leading-[1.24] py-[0.1em] -my-[0.1em]", className)} data-state-text-roll>
      <span className="sr-only">{value}</span>
      {isRolling ? (
        <motion.span
          initial="initial"
          animate="hovered"
          className="relative block whitespace-pre leading-[1.24]"
          aria-hidden="true"
        >
          <span className="block whitespace-pre">
            {[...previousValue].map((character, index, characters) => (
              <motion.span
                key={`${transitionKey}-out-${character}-${index}`}
                variants={outgoingVariants}
                transition={{ duration: DURATION, ease: "easeInOut", delay: getDelay(index, characters.length) }}
                className="inline-block"
              >
                {character}
              </motion.span>
            ))}
          </span>
          <span className="absolute inset-0 block whitespace-pre">
            {[...value].map((character, index, characters) => (
              <motion.span
                key={`${transitionKey}-in-${character}-${index}`}
                variants={incomingVariants}
                transition={{ duration: DURATION, ease: "easeInOut", delay: getDelay(index, characters.length) }}
                className="inline-block"
              >
                {character}
              </motion.span>
            ))}
          </span>
        </motion.span>
      ) : (
        <span className="block whitespace-pre leading-[1.24]" aria-hidden="true">{value}</span>
      )}
    </span>
  );
}
