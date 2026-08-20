"use client";

import { Skeleton } from "@heroui/react";
import "./expense-summary-header.css";

function ExpenseRowSkeleton({ showDivider }: { showDivider?: boolean }) {
  return (
    <div className="relative flex min-h-[80px] items-center gap-3 px-3.5 py-3">
      <Skeleton className="size-11 shrink-0 rounded-[11px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-[74%] max-w-52 rounded-md" />
        <Skeleton className="h-3 w-[58%] max-w-40 rounded-full" />
        <div className="flex items-center gap-2 pt-0.5">
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 self-stretch py-0.5">
        <Skeleton className="h-4 w-[4.5rem] rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
        <Skeleton className="mt-auto h-3 w-10 rounded-full" />
      </div>
      {showDivider && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-[4.75rem] right-3.5 h-px bg-slate-100 dark:bg-slate-800"
        />
      )}
    </div>
  );
}

function ExpenseDayGroupSkeleton({ rows, fill }: { rows: number; fill?: boolean }) {
  return (
    <section className={fill ? "flex min-h-0 flex-1 flex-col space-y-2" : "space-y-2"}>
      <header className="flex min-w-0 shrink-0 items-center justify-between gap-3 px-2 py-1.5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-8 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-14 rounded-full" />
        </div>
      </header>
      <div
        className={
          fill
            ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_-26px_rgba(15,23,42,0.55)] ring-1 ring-black/[0.055] dark:bg-slate-900 dark:ring-white/10"
            : "overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_-26px_rgba(15,23,42,0.55)] ring-1 ring-black/[0.055] dark:bg-slate-900 dark:ring-white/10"
        }
      >
        {Array.from({ length: rows }, (_, index) => (
          <ExpenseRowSkeleton key={index} showDivider={index < rows - 1 || fill} />
        ))}
        {fill && <div aria-hidden="true" className="min-h-0 flex-1 bg-white dark:bg-slate-900" />}
      </div>
    </section>
  );
}

function ExpenseSummarySkeleton() {
  return (
    <header aria-hidden="true" className="sticky top-0 z-30 mx-auto w-full max-w-lg shrink-0 bg-white px-4 pb-1.5 pt-2 dark:bg-slate-950">
      <article className="expense-summary-article relative shadow-[0_10px_28px_-18px_rgba(15,23,42,0.28)]">
        <div className="expense-summary-canvas font-mono text-slate-900 dark:text-slate-100">
          <div className="expense-summary-brand">
            <Skeleton className="size-7 shrink-0 rounded-lg" />
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-2 w-24 rounded-full" />
              <Skeleton className="h-3.5 w-14 rounded-full" />
            </div>
          </div>

          <div className="expense-summary-count">
            <Skeleton className="h-3.5 w-8 rounded-full" />
          </div>

          <div className="expense-summary-bar">
            <div className="expense-summary-amount-row">
              <span aria-hidden className="expense-summary-spacer-start" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <span aria-hidden className="expense-summary-spacer-end" />
            </div>
          </div>

          <div className="expense-summary-thb">
            <Skeleton className="mx-auto h-3.5 w-20 rounded-full" />
          </div>

          <div aria-hidden className="expense-summary-perforation">
            <span className="expense-summary-notch expense-summary-notch-left" />
            <span className="expense-summary-perforation-line" />
            <span className="expense-summary-notch expense-summary-notch-right" />
          </div>

          <div className="expense-summary-settle-copy">
            <Skeleton className="h-2 w-24 rounded-full" />
          </div>

          <div className="expense-summary-cluster">
            <span aria-hidden className="expense-summary-cluster-lead" />
            <div className="expense-summary-avatars">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <span aria-hidden className="expense-summary-cluster-gap" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        </div>
      </article>
    </header>
  );
}

export function ExpenseListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="지출 내역 불러오는 중"
      className="mx-auto flex min-h-0 w-full min-w-0 max-w-lg flex-1 flex-col"
    >
      <ExpenseSummarySkeleton />
      <section className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-11 min-w-0 flex-1 rounded-xl" />
          <Skeleton className="size-11 shrink-0 rounded-xl" />
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-5">
          <ExpenseDayGroupSkeleton rows={2} />
          <ExpenseDayGroupSkeleton fill rows={2} />
        </div>
      </section>
    </div>
  );
}

export function ExpenseChartSkeleton() {
  return (
    <div aria-busy="true" aria-label="통계 불러오는 중" className="space-y-4">
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-52 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
