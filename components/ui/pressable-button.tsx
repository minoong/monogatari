"use client";

import type React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type PressableButtonProps = HTMLMotionProps<"button"> & {
  whileTapScale?: number;
};

export function PressableButton({
  className,
  children,
  whileTapScale = 0.98,
  transition,
  ...props
}: PressableButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={cn(className)}
      whileTap={
        prefersReducedMotion
          ? undefined
          : { scale: whileTapScale, opacity: 0.9 }
      }
      transition={
        transition ?? { type: "spring", stiffness: 520, damping: 30 }
      }
      {...props}
    >
      {children}
    </motion.button>
  );
}
