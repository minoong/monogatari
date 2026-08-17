"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { GitCompareArrowsIcon, type GitCompareArrowsIconHandle } from "@/components/ui/git-compare-arrows";
import { cn } from "@/lib/utils";

interface CurrencySwitchButtonProps {
  convertedText: string;
  isKrwInput: boolean;
  onToggle: () => void;
}

export function CurrencySwitchButton({ convertedText, isKrwInput, onToggle }: CurrencySwitchButtonProps) {
  const iconRef = useRef<GitCompareArrowsIconHandle>(null);
  const reduceMotion = useReducedMotion();
  const targetCurrency = isKrwInput ? "태국 바트" : "대한민국 원";

  const replayIcon = () => {
    if (reduceMotion) return;
    iconRef.current?.stopAnimation();
    requestAnimationFrame(() => requestAnimationFrame(() => iconRef.current?.startAnimation()));
  };

  return (
    <button
      aria-label={`${targetCurrency} 입력으로 전환`}
      aria-pressed={isKrwInput}
      className={cn(
        "flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition-all",
        "hover:border-blue-300 hover:bg-blue-50/60 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2",
        "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10",
      )}
      onClick={() => {
        replayIcon();
        onToggle();
      }}
      onFocus={replayIcon}
      onPointerEnter={replayIcon}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300"
        >
          <GitCompareArrowsIcon ref={iconRef} className="flex" size={16} />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">통화 전환</span>
          <span className="block truncate text-[11px] font-medium text-slate-400">{targetCurrency}로 입력</span>
        </span>
      </span>
      <span className="min-w-0 truncate text-right text-sm font-bold tabular-nums text-slate-700 dark:text-slate-200">
        {convertedText}
      </span>
    </button>
  );
}
