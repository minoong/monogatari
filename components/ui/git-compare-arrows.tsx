"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface GitCompareArrowsIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface GitCompareArrowsIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const DURATION = 0.3;

const CALCULATE_DELAY = (i: number) => (i === 0 ? 0.1 : i * DURATION + 0.1);

const NODE_VARIANTS = {
  normal: { pathLength: 1, opacity: 1, transition: { delay: 0 } },
  animate: { pathLength: [0, 1], opacity: [0, 1] },
};

const TRACK_VARIANTS = {
  normal: { pathLength: 1, pathOffset: 0, opacity: 1, transition: { delay: 0 } },
  animate: { pathLength: [0, 1], opacity: [0, 1], pathOffset: [1, 0] },
};

const HEAD_VARIANTS = {
  normal: { opacity: 1 },
  animate: { opacity: [0, 1] },
};

const GitCompareArrowsIcon = forwardRef<GitCompareArrowsIconHandle, GitCompareArrowsIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            animate={controls}
            cx="5"
            cy="6"
            initial="normal"
            r="3"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(0),
              opacity: { delay: CALCULATE_DELAY(0) },
            }}
            variants={NODE_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 6h5a2 2 0 0 1 2 2v7"
            initial="normal"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(1),
              opacity: { delay: CALCULATE_DELAY(1) },
            }}
            variants={TRACK_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m15 9-3-3 3-3"
            initial="normal"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(1),
              opacity: { delay: CALCULATE_DELAY(1) },
            }}
            variants={HEAD_VARIANTS}
          />
          <motion.circle
            animate={controls}
            cx="19"
            cy="18"
            initial="normal"
            r="3"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(2),
              opacity: { delay: CALCULATE_DELAY(2) },
            }}
            variants={NODE_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 18H7a2 2 0 0 1-2-2V9"
            initial="normal"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(1),
              opacity: { delay: CALCULATE_DELAY(1) },
            }}
            variants={TRACK_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="m9 15 3 3-3 3"
            initial="normal"
            transition={{
              duration: DURATION,
              delay: CALCULATE_DELAY(1),
              opacity: { delay: CALCULATE_DELAY(1) },
            }}
            variants={HEAD_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

GitCompareArrowsIcon.displayName = "GitCompareArrowsIcon";

export { GitCompareArrowsIcon };
