"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface PlaneLandingIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface PlaneLandingIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const PLANE_VARIANTS: Variants = {
  normal: { x: 0, y: 0, rotate: 0 },
  animate: { x: [0, -2, 0], y: [0, 1, 0], rotate: [0, -4, 0] },
};

export const PlaneLandingIcon = forwardRef<PlaneLandingIconHandle, PlaneLandingIconProps>(
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
          variants={PLANE_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 22h20" />
          <path d="M3.77 10.77 2 9l2-4.5 1.1.55c.55.28.9.84.9 1.45v5.2c0 .61-.35 1.17-.9 1.45L2 14l1.77-1.77" />
          <path d="M15.5 6.5 19 3l2 4-3.5 3.5" />
          <path d="M12 13.5V19l-3-1.5" />
        </motion.svg>
      </div>
    );
  },
);

PlaneLandingIcon.displayName = "PlaneLandingIcon";
