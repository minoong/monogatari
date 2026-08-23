"use client";

import { motion, useReducedMotion } from "motion/react";

type BlurFadeProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
};

export function BlurFade({
  children,
  className,
  delay = 0,
  yOffset = 8,
}: BlurFadeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
