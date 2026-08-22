"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SparklesIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SparklesIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const SPARKLE_TRANSITION: Transition = { duration: 0.35, ease: "easeOut" };
const SPARKLE_VARIANTS: Variants = {
  normal: { scale: 1, opacity: 1 },
  animate: { scale: [1, 1.15, 1], opacity: [1, 0.65, 1] },
};

export const SparklesIcon = forwardRef<SparklesIconHandle, SparklesIconProps>(
  ({ className, size = 28, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const play = useCallback(async () => {
      await controls.start("animate");
      await controls.start("normal");
    }, [controls]);

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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={SPARKLE_TRANSITION}
          variants={SPARKLE_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </motion.svg>
      </div>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
