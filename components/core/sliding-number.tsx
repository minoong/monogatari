"use client";

import { motion } from "motion/react";
import * as React from "react";
import { useSyncExternalStore } from "react";

type SlidingNumberProps = React.HTMLAttributes<HTMLSpanElement> & {
  value: number;
  padStart?: boolean;
};

const DIGITS = Array.from({ length: 10 }, (_, index) => index);
const DIGIT_LINE_HEIGHT = 1.12;

const SlidingDigit: React.FC<{ value: number }> = ({ value }) => (
  <span className="relative inline-block h-[1.12em] w-[0.72em] align-bottom [clip-path:inset(0_-0.12em)]" aria-hidden="true">
    <motion.span
      className="absolute inset-x-0 top-0 flex flex-col items-center"
      initial={false}
      animate={{ y: `-${value * DIGIT_LINE_HEIGHT}em` }}
      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.5 }}
    >
      {DIGITS.map((digit) => (
        <span key={digit} className="flex h-[1.12em] items-center justify-center leading-none">
          {digit}
        </span>
      ))}
    </motion.span>
  </span>
);

export const SlidingNumber = React.forwardRef<HTMLSpanElement, SlidingNumberProps>(
  ({ value, padStart = false, className, ...props }, ref) => {
    const mounted = useSyncExternalStore(
      () => () => {},
      () => true,
      () => false,
    );
    const displayValue = String(value).padStart(padStart ? 2 : 1, "0");

    if (!mounted) {
      return (
        <span ref={ref} className={`inline-flex items-center gap-0.5 leading-none ${className ?? ""}`} {...props}>
          {displayValue}
        </span>
      );
    }

    return (
      <span ref={ref} className={`inline-flex items-center gap-0.5 leading-none ${className ?? ""}`} {...props}>
        {displayValue.split("").map((character, index) => (
          <SlidingDigit key={index} value={Number(character)} />
        ))}
        <span className="sr-only">{displayValue}</span>
      </span>
    );
  },
);

SlidingNumber.displayName = "SlidingNumber";
