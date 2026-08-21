"use client";

import type { Transition } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface RotateCwIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface RotateCwIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const ROTATE_TRANSITION: Transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

const RotateCwIcon = forwardRef<RotateCwIconHandle, RotateCwIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start({ rotate: 180, transition: ROTATE_TRANSITION }).then(() => controls.set({ rotate: 0 })),
        stopAnimation: () => controls.set({ rotate: 0 }),
      };
    });

    const start = useCallback(() => {
      void controls.start({ rotate: 180, transition: ROTATE_TRANSITION }).then(() => controls.set({ rotate: 0 }));
    }, [controls]);

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseEnter?.(event);
        else start();
      },
      [onMouseEnter, start],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLSpanElement>) => {
        if (isControlledRef.current) onMouseLeave?.(event);
      },
      [onMouseLeave],
    );

    return (
      <span className={cn("inline-flex shrink-0", className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial={{ rotate: 0 }}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </motion.svg>
      </span>
    );
  },
);

RotateCwIcon.displayName = "RotateCwIcon";

export { RotateCwIcon };
