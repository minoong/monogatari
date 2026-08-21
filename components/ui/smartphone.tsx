"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SmartphoneIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SmartphoneIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  animateOnMount?: boolean;
}

const FLOAT_TRANSITION: Transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };
const FLOAT_VARIANTS: Variants = {
  normal: { y: 0, rotate: 0 },
  animate: { y: [-1, -4, 0], rotate: [0, -8, 0] },
};

const SmartphoneIcon = forwardRef<SmartphoneIconHandle, SmartphoneIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, animateOnMount = false, ...props }, ref) => {
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

    useEffect(() => {
      if (!animateOnMount || isControlledRef.current) return;
      void start();
    }, [animateOnMount, start]);

    return (
      <span className={cn("inline-flex shrink-0", className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={FLOAT_TRANSITION}
          variants={FLOAT_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect height="20" rx="2" ry="2" width="14" x="5" y="2" />
          <path d="M12 18h.01" />
        </motion.svg>
      </span>
    );
  },
);

SmartphoneIcon.displayName = "SmartphoneIcon";

export { SmartphoneIcon };
