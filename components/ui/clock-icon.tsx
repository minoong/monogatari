"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, PointerEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ClockIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ClockIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  animateOnMount?: boolean;
}

const HAND_TRANSITION: Transition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] };
const HAND_VARIANTS: Variants = {
  normal: { rotate: 0, originX: "0%", originY: "100%" },
  animate: { rotate: 360, originX: "0%", originY: "100%" },
};
const MINUTE_HAND_TRANSITION: Transition = { duration: 0.5, ease: "easeInOut" };
const MINUTE_HAND_VARIANTS: Variants = {
  normal: { rotate: 0, originX: "0%", originY: "100%" },
  animate: { rotate: 45, originX: "0%", originY: "100%" },
};

const ClockIcon = forwardRef<ClockIconHandle, ClockIconProps>(
  ({ onMouseEnter, onMouseLeave, onPointerDown, className, size = 28, animateOnMount = false, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return { startAnimation: () => controls.start("animate"), stopAnimation: () => controls.start("normal") };
    });

    const start = useCallback(() => controls.start("animate"), [controls]);
    const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseEnter?.(event);
      else start();
    }, [onMouseEnter, start]);
    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseLeave?.(event);
      else controls.start("normal");
    }, [controls, onMouseLeave]);
    const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (isControlledRef.current || event.pointerType === "mouse") return;
      void start().then(() => controls.start("normal"));
    }, [controls, onPointerDown, start]);

    useEffect(() => {
      if (!animateOnMount || isControlledRef.current) return;
      let active = true;
      void start().then(() => active && controls.start("normal"));
      return () => { active = false; };
    }, [animateOnMount, controls, start]);

    return <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onPointerDown={handlePointerDown} {...props}>
      <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" />
        <motion.line animate={controls} initial="normal" transition={HAND_TRANSITION} variants={HAND_VARIANTS} x1="12" x2="12" y1="12" y2="6" />
        <motion.line animate={controls} initial="normal" transition={MINUTE_HAND_TRANSITION} variants={MINUTE_HAND_VARIANTS} x1="12" x2="16" y1="12" y2="12" />
      </svg>
    </div>;
  },
);

ClockIcon.displayName = "ClockIcon";

export { ClockIcon };
