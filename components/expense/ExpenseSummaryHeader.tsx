"use client";

import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState, type RefObject } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletIcon } from "@/components/ui/wallet";
import { useScrollProgressVar } from "@/hooks/use-scroll-progress-var";
import {
  EXPENSE_PERSON_META,
  formatKrw,
  formatThb,
  summarizeExpenses,
  type Expense,
  type ExpensePerson,
} from "@/lib/expenses";
import "./expense-summary-header.css";

interface ExpenseSummaryHeaderProps {
  expenses: Expense[];
  scrollRef: RefObject<HTMLElement | null>;
}

export function ExpenseSummaryHeader({ expenses, scrollRef }: ExpenseSummaryHeaderProps) {
  const summary = useMemo(() => summarizeExpenses(expenses), [expenses]);
  const reduceMotion = useReducedMotion();

  useScrollProgressVar(scrollRef, { enabled: !reduceMotion });

  const settlementAmount = summary.settlement?.amount ?? 0;

  return (
    <header
      aria-label="여행 지출 요약"
      className="sticky top-0 z-30 mx-auto w-full max-w-lg bg-white px-4 pb-1.5 pt-2 dark:bg-slate-950"
    >
      <article className="expense-summary-article relative shadow-[0_10px_28px_-18px_rgba(15,23,42,0.28)]">
        <div className="expense-summary-canvas font-mono text-slate-900 dark:text-slate-100">
          <div className="expense-summary-brand">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-sky-700 dark:bg-white/10 dark:text-sky-300">
              <WalletIcon aria-hidden="true" size={14} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase leading-[11px] tracking-[0.22em] text-slate-400">
                Monogatari Trip Ledger
              </p>
              <p className="truncate font-sans text-xs font-extrabold leading-4 tracking-[-0.01em]">여행 지출</p>
            </div>
          </div>

          <p className="expense-summary-count">{summary.count}건</p>

          <div className="expense-summary-bar">
            <div className="expense-summary-amount-row">
              <span aria-hidden className="expense-summary-spacer-start" />
              <p className="expense-summary-amount text-[32px] font-black tracking-[-0.04em] tabular-nums text-slate-900 dark:text-white">
                <AnimatedKrw value={summary.totalKrw} />
              </p>
              <span aria-hidden className="expense-summary-spacer-end" />
            </div>
          </div>

          <p className="expense-summary-thb tabular-nums text-slate-500">
            <AnimatedThb value={summary.totalThb} />
          </p>

          <div aria-hidden className="expense-summary-perforation">
            <span className="expense-summary-notch expense-summary-notch-left" />
            <span className="expense-summary-perforation-line" />
            <span className="expense-summary-notch expense-summary-notch-right" />
          </div>

          <p className="expense-summary-settle-copy text-slate-400">Current Settlement</p>

          <div className="expense-summary-cluster">
            <span aria-hidden className="expense-summary-cluster-lead" />
            <div className="expense-summary-avatars text-[11px] font-extrabold">
              {summary.settlement ? (
                <>
                  <SettlementPerson person={summary.settlement.from} />
                  <SettlementArrow />
                  <SettlementPerson person={summary.settlement.to} />
                </>
              ) : (
                <p className="expense-summary-avatar-names font-sans text-[11px] font-bold text-slate-500">
                  정산할 금액이 없어요
                </p>
              )}
            </div>
            <span aria-hidden className="expense-summary-cluster-gap" />
            <p className="expense-summary-settle-krw">
              <AnimatedKrw value={settlementAmount} />
            </p>
          </div>
        </div>
      </article>
    </header>
  );
}

function useCountUp(value: number) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(value), 40);
    return () => window.clearTimeout(timer);
  }, [value]);

  return reduceMotion ? value : shown;
}

function AnimatedKrw({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const shown = useCountUp(Math.round(value));
  if (reduceMotion) return <>{formatKrw(value)}</>;
  return (
    <NumberFlow
      className="number-flow-wrap"
      format={{ notation: "standard", minimumFractionDigits: 0, maximumFractionDigits: 0 }}
      locales="ko-KR"
      prefix="₩"
      spinTiming={{ duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      transformTiming={{ duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      value={shown}
    />
  );
}

function AnimatedThb({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const shown = useCountUp(value);
  if (reduceMotion) return <>{formatThb(value)}</>;
  return (
    <NumberFlow
      format={{ notation: "standard", minimumFractionDigits: 0, maximumFractionDigits: 2 }}
      locales="ko-KR"
      prefix="฿"
      spinTiming={{ duration: 900, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      transformTiming={{ duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      value={shown}
    />
  );
}

function SettlementArrow() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      className="shrink-0 text-slate-400"
      fill="none"
      height="12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      viewBox="0 0 24 24"
      width="12"
    >
      <motion.path
        animate={reduceMotion ? { x: 0 } : { x: [0, 3, 0] }}
        d="M4 12h14"
        initial={false}
        transition={reduceMotion ? undefined : { duration: 1.15, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.path
        animate={reduceMotion ? { x: 0 } : { x: [0, 3, 0] }}
        d="m13 6 7 6-7 6"
        initial={false}
        transition={reduceMotion ? undefined : { duration: 1.15, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  );
}

function SettlementPerson({ person }: { person: ExpensePerson }) {
  const meta = EXPENSE_PERSON_META[person];
  return (
    <span className="inline-flex items-center gap-1">
      <Avatar className="!size-4 shrink-0 ring-1 ring-white dark:ring-slate-900" color={person === "gahyun" ? "accent" : "success"} size="sm">
        <AvatarImage alt="" src={meta.image} />
        <AvatarFallback>{person === "gahyun" ? "G" : "M"}</AvatarFallback>
      </Avatar>
      <span className="expense-summary-avatar-names font-sans">{meta.label}</span>
    </span>
  );
}
