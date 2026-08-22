"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CircleCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
  reverseAnimation: () => Promise<void>;
  setChecked: (value: boolean) => void;
}

interface CircleCheckIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  checked?: boolean;
  animateOnMount?: boolean;
}

const CHECK_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.3, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.4, opacity: { duration: 0.1 } },
  },
  reverse: {
    opacity: [1, 0],
    pathLength: [1, 0],
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
};

export const CircleCheckIcon = forwardRef<CircleCheckIconHandle, CircleCheckIconProps>(
  ({ className, size = 28, checked = false, animateOnMount = false, onMouseEnter, onMouseLeave, ...props }, ref) => {
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
        setChecked: (value: boolean) => {
          void controls.start(value ? "normal" : "hidden");
        },
      };
    });

    const play = useCallback(async () => {
      await controls.start("animate");
      await controls.start("normal");
    }, [controls]);

    useEffect(() => {
      if (isControlledRef.current) return;
      void controls.start(checked ? "normal" : "hidden");
    }, [checked, controls]);

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
          if (!isControlledRef.current) controls.start(checked ? "normal" : "hidden");
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
          <circle cx="12" cy="12" r="10" />
          <motion.path
            animate={controls}
            d="m9 12 2 2 4-4"
            initial={checked ? "normal" : "hidden"}
            variants={CHECK_VARIANTS}
          />
        </svg>
      </div>
    );
  },
);

CircleCheckIcon.displayName = "CircleCheckIcon";
