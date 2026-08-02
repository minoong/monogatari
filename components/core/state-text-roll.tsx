"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface StateTextRollProps {
  value: string;
  /** Incremented whenever either flight tab changes. */
  transitionKey: number;
  className?: string;
}

// Matched to Skiper58's source implementation.
const STAGGER = 0.022;
const DURATION = 0.24;

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
export function StateTextRoll({ value, transitionKey, className }: StateTextRollProps) {
  const reduceMotion = useReducedMotion();
  const visibleValueRef = React.useRef(value);
  const transitionRef = React.useRef(transitionKey);
  const [outgoingValue, setOutgoingValue] = React.useState(value);
  const [isRolling, setIsRolling] = React.useState(false);

  React.useEffect(() => {
    if (transitionRef.current === transitionKey) return;
    transitionRef.current = transitionKey;

    if (reduceMotion) {
      visibleValueRef.current = value;
      return;
    }

    let settleTimer: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      setOutgoingValue(visibleValueRef.current);
      setIsRolling(true);

      const longestText = Math.max(visibleValueRef.current.length, value.length);
      settleTimer = window.setTimeout(() => {
        visibleValueRef.current = value;
        setOutgoingValue(value);
        setIsRolling(false);
      }, DURATION * 1000 + Math.ceil((longestText - 1) / 2) * STAGGER * 1000 + 40);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [reduceMotion, transitionKey, value]);

  if (reduceMotion) return <span className={className}>{value}</span>;

  const getDelay = (index: number, length: number) => STAGGER * Math.abs(index - (length - 1) / 2);

  return (
    <span className={cn("relative inline-block overflow-hidden align-middle leading-[1.2]", className)} data-state-text-roll>
      <span className="sr-only">{value}</span>
      {isRolling ? (
        <motion.span
          initial="initial"
          animate="hovered"
          className="relative block whitespace-pre leading-[1.2]"
          aria-hidden="true"
        >
          <span className="block whitespace-pre">
            {[...outgoingValue].map((character, index, characters) => (
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
        <span className="block whitespace-pre leading-[1.2]" aria-hidden="true">{value}</span>
      )}
    </span>
  );
}
