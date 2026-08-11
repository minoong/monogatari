"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, PointerEvent } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MapPinIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MapPinIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  animateOnMount?: boolean;
}

const SVG_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: [0, -5, -3], transition: { duration: 0.5, times: [0, 0.6, 1] } },
};

const CIRCLE_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [0.5, 0],
    transition: { delay: 0.3, duration: 0.5, opacity: { duration: 0.1, delay: 0.3 } },
  },
};

const MapPinIcon = forwardRef<MapPinIconHandle, MapPinIconProps>(
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

    const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseEnter?.(event);
      else controls.start("animate");
    }, [controls, onMouseEnter]);
    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseLeave?.(event);
      else controls.start("normal");
    }, [controls, onMouseLeave]);
    const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (isControlledRef.current || event.pointerType === "mouse") return;
      void controls.start("animate").then(() => controls.start("normal"));
    }, [controls, onPointerDown]);

    useEffect(() => {
      if (!animateOnMount || isControlledRef.current) return;
      let active = true;
      void controls.start("animate").then(() => active && controls.start("normal"));
      return () => { active = false; };
    }, [animateOnMount, controls]);

    return <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onPointerDown={handlePointerDown} {...props}>
      <motion.svg animate={controls} fill="none" height={size} initial="normal" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" variants={SVG_VARIANTS} viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <motion.circle animate={controls} cx="12" cy="10" initial="normal" r="3" variants={CIRCLE_VARIANTS} />
      </motion.svg>
    </div>;
  },
);

MapPinIcon.displayName = "MapPinIcon";

export { MapPinIcon };
