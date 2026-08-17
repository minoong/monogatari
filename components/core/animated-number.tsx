"use client";

import * as React from "react";
import { animate, motion } from "motion/react";

import { cn } from "@/lib/utils";

interface AnimatedNumberProps extends Omit<React.ComponentProps<typeof motion.span>, "children"> {
  value: number;
  springOptions?: {
    bounce?: number;
    duration?: number;
  };
  formatOptions?: Intl.NumberFormatOptions;
}

export function AnimatedNumber({
  className,
  formatOptions,
  springOptions,
  value,
  ...props
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValueRef = React.useRef(value);

  React.useEffect(() => {
    const duration = (springOptions?.duration ?? 1000) / 1000;
    const controls = animate(previousValueRef.current, value, {
      bounce: springOptions?.bounce ?? 0,
      duration,
      onUpdate: (latest) => setDisplayValue(latest),
      type: "spring",
    });

    previousValueRef.current = value;
    return () => controls.stop();
  }, [springOptions?.bounce, springOptions?.duration, value]);

  const formattedValue = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
    ...formatOptions,
  }).format(displayValue);

  return (
    <motion.span className={cn("tabular-nums", className)} {...props}>
      {formattedValue}
    </motion.span>
  );
}
