"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ChartPieIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChartPieIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const SLICE_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: {
    pathLength: [0, 1],
    opacity: [0.4, 1],
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export const ChartPieIcon = forwardRef<ChartPieIconHandle, ChartPieIconProps>(
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
          <motion.path
            animate={controls}
            d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"
            initial="normal"
            variants={SLICE_VARIANTS}
          />
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        </svg>
      </div>
    );
  },
);

ChartPieIcon.displayName = "ChartPieIcon";
