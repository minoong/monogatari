"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@heroui/react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { CircleCheckIcon, type CircleCheckIconHandle } from "@/components/ui/lucide-animated/circle-check";
import { cn } from "@/lib/utils";
import { WISH_COMPLETION_LABEL, type WishType } from "@/lib/wishes";

type WishCompletionToggleProps = {
  type: WishType;
  completed: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  className?: string;
  onToggle: (nextCompleted: boolean) => void;
};

const iconSizes = {
  sm: { px: 28 },
  md: { px: 40 },
  lg: { px: 48 },
} as const;

export function WishCompletionToggle({
  type,
  completed,
  disabled = false,
  size = "md",
  variant = "icon",
  className,
  onToggle,
}: WishCompletionToggleProps) {
  const label = WISH_COMPLETION_LABEL[type];
  const iconRef = useRef<CircleCheckIconHandle>(null);
  const dimensions = iconSizes[size];
  const [initialCompleted] = useState(completed);
  const [showChecked, setShowChecked] = useState(completed);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (isAnimatingRef.current) return;
    setShowChecked(completed);
  }, [completed]);

  const handleToggle = () => {
    if (disabled) return;

    const nextCompleted = !completed;
    triggerHapticFeedback(completed ? 8 : 14);

    if (nextCompleted) {
      setShowChecked(true);
      requestAnimationFrame(() => iconRef.current?.startAnimation());
      onToggle(true);
      return;
    }

    isAnimatingRef.current = true;
    void iconRef.current?.reverseAnimation().finally(() => {
      isAnimatingRef.current = false;
      setShowChecked(false);
    });
    onToggle(false);
  };

  const iconClassName = cn(
    showChecked ? "text-emerald-500" : "text-slate-300 dark:text-slate-500",
  );

  if (variant === "button") {
    return (
      <Button
        className={cn(
          "rounded-2xl text-base font-bold shadow-sm",
          completed
            ? "border-2 border-emerald-500 bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-slate-900 dark:hover:bg-emerald-500/10"
            : "bg-[#00256C] text-white hover:bg-[#003580] dark:bg-white dark:text-slate-900",
          size === "lg" && "flex-1",
          className,
        )}
        isDisabled={disabled}
        onPress={handleToggle}
        size="lg"
        variant="ghost"
      >
        <span className="inline-flex items-center gap-2">
          <CircleCheckIcon
            ref={iconRef}
            checked={initialCompleted}
            className={iconClassName}
            size={18}
          />
          <span>{completed ? `${label} 완료` : label}</span>
        </span>
      </Button>
    );
  }

  return (
    <motion.button
      aria-label={completed ? `${label} 취소` : label}
      aria-pressed={completed}
      className={cn("shrink-0 rounded-full", disabled && "pointer-events-none", className)}
      disabled={disabled}
      onClick={handleToggle}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.9 }}
    >
      <CircleCheckIcon
        ref={iconRef}
        checked={initialCompleted}
        className={iconClassName}
        size={dimensions.px}
      />
    </motion.button>
  );
}
