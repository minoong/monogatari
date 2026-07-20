"use client";

import { motion } from "motion/react";
import * as React from "react";

type SlidingNumberProps = React.HTMLAttributes<HTMLSpanElement> & {
  value: number;
  padStart?: boolean;
};

const DIGITS = Array.from({ length: 10 }, (_, index) => index);

const SlidingDigit: React.FC<{ value: number }> = ({ value }) => (
  <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom" aria-hidden="true">
    <motion.span
      className="absolute inset-x-0 top-0 flex flex-col items-center"
      initial={false}
      animate={{ y: `-${value}em` }}
      transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.5 }}
    >
      {DIGITS.map((digit) => (
        <span key={digit} className="flex h-[1em] items-center justify-center">
          {digit}
        </span>
      ))}
    </motion.span>
  </span>
);

export const SlidingNumber = React.forwardRef<HTMLSpanElement, SlidingNumberProps>(
  ({ value, padStart = false, className, ...props }, ref) => {
    const displayValue = String(value).padStart(padStart ? 2 : 1, "0");

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
