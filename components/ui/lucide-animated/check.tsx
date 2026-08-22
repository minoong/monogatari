"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
  reverseAnimation: () => Promise<void>;
}

interface CheckIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  animateOnMount?: boolean;
}

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    scale: 1,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.35, 1.08, 1],
    transition: {
      duration: 0.42,
      ease: [0.34, 1.45, 0.64, 1],
      opacity: { duration: 0.08 },
      scale: { duration: 0.38 },
    },
  },
  reverse: {
    opacity: [1, 0],
    pathLength: [1, 0],
    scale: [1, 0.35],
    transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
  },
  hidden: {
    opacity: 0,
    pathLength: 0,
    scale: 0.35,
  },
};

export const CheckIcon = forwardRef<CheckIconHandle, CheckIconProps>(
  ({ className, size = 28, animateOnMount = false, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: async () => {
          await controls.start("animate");
          await controls.start("normal");
        },
        stopAnimation: () => controls.start("normal"),
        reverseAnimation: async () => {
          await controls.start("reverse");
          await controls.start("hidden");
        },
      };
    });

    const play = useCallback(async () => {
      await controls.start("animate");
      await controls.start("normal");
    }, [controls]);

    useEffect(() => {
      if (animateOnMount && !isControlledRef.current) void play();
    }, [animateOnMount, play]);

    return (
      <div
        className={cn("inline-flex shrink-0", className)}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          if (!isControlledRef.current) void play();
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          if (!isControlledRef.current) controls.start("normal");
        }}
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
          <motion.path animate={controls} d="M4 12 9 17L20 6" initial="normal" variants={PATH_VARIANTS} />
        </svg>
      </div>
    );
  },
);

CheckIcon.displayName = "CheckIcon";
