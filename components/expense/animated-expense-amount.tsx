"use client";

import NumberFlow from "@number-flow/react";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocalCurrency } from "@/components/providers/trip-provider";
import { CURRENCY_INFO } from "@/lib/currency";
import { formatKrw, formatLocalAmount } from "@/lib/expenses";
import { cn } from "@/lib/utils";

const NUMBER_FLOW_SPIN_TIMING = { duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" } as const;
const NUMBER_FLOW_TRANSFORM_TIMING = { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" } as const;

function useCountUp(value: number, enabled: boolean) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!enabled) return;
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- NumberFlow 카운트업은 뷰포트 진입 직후 1회 시작한다.
      setShown(value);
      return;
    }
    const timer = window.setTimeout(() => setShown(value), 40);
    return () => window.clearTimeout(timer);
  }, [enabled, reduceMotion, value]);

  if (!enabled) return 0;
  return reduceMotion ? value : shown;
}

type AnimatedKrwProps = {
  value: number;
  animate?: boolean;
  className?: string;
};

export function AnimatedKrw({ value, animate = true, className }: AnimatedKrwProps) {
  const reduceMotion = useReducedMotion();
  const shown = useCountUp(Math.round(value), animate);

  if (reduceMotion) {
    return <span className={cn("tabular-nums", className)}>{formatKrw(value)}</span>;
  }

  return (
    <NumberFlow
      className={cn("number-flow-wrap inline tabular-nums", className)}
      format={{ notation: "standard", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
      locales="ko-KR"
      prefix="₩"
      spinTiming={NUMBER_FLOW_SPIN_TIMING}
      transformTiming={NUMBER_FLOW_TRANSFORM_TIMING}
      value={shown}
    />
  );
}

type AnimatedLocalProps = {
  value: number;
  animate?: boolean;
  className?: string;
};

/** 여행지 현지 통화 금액. 통화 기호와 소수점 자릿수는 활성 여행을 따른다. */
export function AnimatedLocal({ value, animate = true, className }: AnimatedLocalProps) {
  const reduceMotion = useReducedMotion();
  const shown = useCountUp(value, animate);
  const currency = useLocalCurrency();
  const info = CURRENCY_INFO[currency];

  if (reduceMotion) {
    return <span className={cn("tabular-nums", className)}>{formatLocalAmount(value, currency)}</span>;
  }

  return (
    <NumberFlow
      className={cn("number-flow-wrap inline tabular-nums", className)}
      format={{ notation: "standard", minimumFractionDigits: 0, maximumFractionDigits: info.fractionDigits }}
      locales="ko-KR"
      prefix={info.symbol}
      spinTiming={NUMBER_FLOW_SPIN_TIMING}
      transformTiming={NUMBER_FLOW_TRANSFORM_TIMING}
      value={shown}
    />
  );
}

export function ExpenseShortcutAmounts({ todayKrw, totalKrw }: { todayKrw: number; totalKrw: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });

  return (
    <span
      ref={ref}
      aria-label={`오늘 ${formatKrw(todayKrw)}, 총 ${formatKrw(totalKrw)}`}
      className="flex min-w-0 flex-col gap-0.5"
    >
      <span className="flex min-w-0 items-baseline gap-1">
        <span className="shrink-0">오늘</span>
        <AnimatedKrw className="min-w-0 truncate" value={todayKrw} animate={inView} />
      </span>
      <span className="flex min-w-0 items-baseline gap-1">
        <span className="shrink-0">총</span>
        <AnimatedKrw className="min-w-0 truncate" value={totalKrw} animate={inView} />
      </span>
    </span>
  );
}
