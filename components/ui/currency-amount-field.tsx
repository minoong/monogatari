"use client";

import NumberFlow from "@number-flow/react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type FocusEvent } from "react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type CurrencyCode = "THB" | "KRW";

const CURRENCY_META: Record<CurrencyCode, { label: string; symbol: string; flagCode: string; fractionDigits: number }> = {
  THB: { label: "태국 바트", symbol: "฿", flagCode: "th", fractionDigits: 2 },
  KRW: { label: "대한민국 원", symbol: "₩", flagCode: "kr", fractionDigits: 0 },
};

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

interface CurrencyAmountFieldProps {
  amount: string;
  convertedValue: number;
  currency: CurrencyCode;
  inputId: string;
  name?: string;
  onAmountChange: (value: string) => void;
  onInputFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onToggle: () => void;
  rateReady: boolean;
}

export function CurrencyAmountField({
  amount,
  convertedValue,
  currency,
  inputId,
  name,
  onAmountChange,
  onInputFocus,
  onToggle,
  rateReady,
}: CurrencyAmountFieldProps) {
  const groupId = useId();
  const reduceMotion = useReducedMotion();
  const [turns, setTurns] = useState(0);

  const target: CurrencyCode = currency === "THB" ? "KRW" : "THB";
  const source = CURRENCY_META[currency];
  const converted = CURRENCY_META[target];

  const handleToggle = () => {
    triggerHapticFeedback(12);
    setTurns((value) => value + 1);
    onToggle();
  };

  return (
    <div className="relative w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-white/5">
      <LayoutGroup id={groupId}>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-14 shadow-sm transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900">
          <CurrencyBadge code={currency} groupId={groupId} key={currency} reduceMotion={reduceMotion} />
          <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
            <span className="shrink-0 text-base font-bold text-slate-400">{source.symbol}</span>
            <input
              id={inputId}
              aria-label={`${source.label} 금액`}
              className="w-full min-w-0 bg-transparent text-right text-lg font-bold tabular-nums outline-none placeholder:font-semibold placeholder:text-slate-300"
              inputMode={currency === "KRW" ? "numeric" : "decimal"}
              min={currency === "KRW" ? "1" : "0.01"}
              name={name}
              onChange={(event) => onAmountChange(event.target.value)}
              onFocus={onInputFocus}
              placeholder="0"
              step={currency === "KRW" ? "1" : "0.01"}
              type="number"
              value={amount}
            />
          </span>
        </div>

        <div aria-live="polite" className="flex min-w-0 items-center gap-3 py-3 pl-3 pr-14">
          <CurrencyBadge code={target} groupId={groupId} key={target} muted reduceMotion={reduceMotion} />
          <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
            {rateReady ? (
              <>
                <span className="shrink-0 text-sm font-bold text-slate-300">{converted.symbol}</span>
                <NumberFlow
                  className="min-w-0 text-base font-bold tabular-nums text-slate-500 dark:text-slate-400"
                  format={{ maximumFractionDigits: converted.fractionDigits }}
                  value={Number.isFinite(convertedValue) ? convertedValue : 0}
                />
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-400">환율 확인 중</span>
            )}
          </span>
        </div>

        <motion.button
          animate={reduceMotion ? undefined : { rotate: turns * 180 }}
          aria-label={`${converted.label} 입력으로 전환`}
          className={cn(
            "absolute right-3 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full",
            "bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-slate-50",
            "hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-blue-500/40",
            "dark:ring-slate-900",
          )}
          onClick={handleToggle}
          transition={SPRING}
          type="button"
          whileTap={reduceMotion ? undefined : { scale: 0.88 }}
        >
          <SwapGlyph />
        </motion.button>
      </LayoutGroup>
    </div>
  );
}

function CurrencyBadge({
  code,
  groupId,
  muted = false,
  reduceMotion,
}: {
  code: CurrencyCode;
  groupId: string;
  muted?: boolean;
  reduceMotion: boolean | null;
}) {
  const meta = CURRENCY_META[code];

  return (
    <motion.span
      className="relative z-10 flex min-w-0 shrink-0 items-center gap-2"
      layoutId={reduceMotion ? undefined : `${groupId}-${code}`}
      transition={SPRING}
    >
      <Avatar
        className={cn(
          "size-8 shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10",
          muted && "opacity-70",
        )}
      >
        <AvatarImage alt={`${meta.label} 국기`} src={`https://flagcdn.com/w80/${meta.flagCode}.png`} />
        <AvatarFallback>{code}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col">
        <span className={cn("text-[11px] font-bold leading-tight", muted ? "text-slate-400" : "text-slate-700 dark:text-slate-200")}>
          {meta.label}
        </span>
        <span className="text-[10px] font-semibold leading-tight text-slate-400">{code}</span>
      </span>
    </motion.span>
  );
}

function SwapGlyph() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 4v16" />
      <path d="m3 8 4-4 4 4" />
      <path d="M17 20V4" />
      <path d="m21 16-4 4-4-4" />
    </svg>
  );
}
