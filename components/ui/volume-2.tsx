"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, PointerEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface Volume2IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface Volume2IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  animateOnMount?: boolean;
}

const WAVE_TRANSITION: Transition = { duration: 0.35, ease: "easeOut" };
const WAVE_VARIANTS: Variants = {
  normal: { opacity: 1, pathLength: 1 },
  animate: { opacity: [0.35, 1, 0.35], pathLength: [0.2, 1, 0.2] },
};

const Volume2Icon = forwardRef<Volume2IconHandle, Volume2IconProps>(
  ({ onMouseEnter, onMouseLeave, onPointerDown, className, size = 28, animateOnMount = false, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const start = useCallback(async () => {
      await controls.start("animate");
      await controls.start("normal");
    }, [controls]);

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseEnter?.(event);
        else void start();
      },
      [onMouseEnter, start],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseLeave?.(event);
        else controls.start("normal");
      },
      [controls, onMouseLeave],
    );

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLSpanElement>) => {
        onPointerDown?.(event);
        if (isControlledRef.current || event.pointerType === "mouse") return;
        void start();
      },
      [onPointerDown, start],
    );

    useEffect(() => {
      if (!animateOnMount || isControlledRef.current) return;
      void start();
    }, [animateOnMount, start]);

    return (
      <span
        className={cn("inline-flex shrink-0", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
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
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
          <motion.path
            animate={controls}
            d="M16 9a5 5 0 0 1 0 6"
            initial="normal"
            transition={WAVE_TRANSITION}
            variants={WAVE_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M19.364 5.636a9 9 0 0 1 0 12.728"
            initial="normal"
            transition={{ ...WAVE_TRANSITION, delay: 0.08 }}
            variants={WAVE_VARIANTS}
          />
        </svg>
      </span>
    );
  },
);

Volume2Icon.displayName = "Volume2Icon";

export { Volume2Icon };
