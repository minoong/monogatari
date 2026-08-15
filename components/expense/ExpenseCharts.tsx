"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EXPENSE_PERSON_META,
  aggregateExpensesByCategory,
  aggregateExpensesByDate,
  formatKrw,
  formatThb,
  summarizeExpenses,
  type Expense,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ExpenseCharts({ expenses }: { expenses: Expense[] }) {
  const reduceMotion = useReducedMotion();
  const [personMode, setPersonMode] = useState<"used" | "paid">("used");
  const summary = useMemo(() => summarizeExpenses(expenses), [expenses]);
  const daily = useMemo(() => aggregateExpensesByDate(expenses), [expenses]);
  const categories = useMemo(() => aggregateExpensesByCategory(expenses), [expenses]);
  const people = [
    { name: "가현쨩", value: summary[personMode].gahyun },
    { name: "미누쿤", value: summary[personMode].minu },
  ];
  const animationDuration = reduceMotion ? 0 : 400;
  const average = summary.count ? Math.round(summary.totalKrw / Math.max(1, daily.length)) : 0;

  return <div className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden">
    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
      <Metric label="총 지출" value={formatKrw(summary.totalKrw)} />
      <Metric label="태국 바트" value={formatThb(summary.totalThb)} />
      <Metric label="지출 건수" value={`${summary.count}건`} />
      <Metric label="일평균" value={formatKrw(average)} />
    </section>

    <Card className="w-full min-w-0 max-w-full gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="mb-3 px-4 pt-4"><div className="min-w-0"><h2 className="truncate text-sm font-extrabold">날짜별 지출</h2><p className="mt-0.5 truncate text-[11px] text-slate-400">태국 현지 날짜 기준 원화</p></div></CardHeader>
      <CardContent className="px-4 pb-4">
      <div className="h-48 w-full min-w-0 max-w-full overflow-hidden" aria-hidden="true"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 192 }}><BarChart data={daily} margin={{ top: 8, right: 0, bottom: 0, left: -20 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5).replace("-", "/")} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}천`} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatKrw(Number(value))} labelFormatter={(label) => `${label} 지출`} /><Bar dataKey="amount" fill="#0a84ff" radius={[6, 6, 2, 2]} isAnimationActive={!reduceMotion} animationDuration={animationDuration} /></BarChart></ResponsiveContainer></div>
      <AccessibleTable caption="날짜별 원화 지출" rows={daily.map((item) => [item.date, formatKrw(item.amount)])} />
      </CardContent>
    </Card>

    <Card className="w-full min-w-0 max-w-full gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="mb-3 flex px-4 pt-4"><div className="min-w-0"><h2 className="truncate text-sm font-extrabold">사용자별 비교</h2><p className="mt-0.5 truncate text-[11px] text-slate-400">{personMode === "used" ? "각자 사용한 비용" : "각자 결제한 비용"}</p></div><div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">{(["used", "paid"] as const).map((mode) => <button key={mode} className={cn("min-h-8 rounded-md px-3 text-[11px] font-bold", personMode === mode ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500")} onClick={() => setPersonMode(mode)} type="button">{mode === "used" ? "사용액" : "결제액"}</button>)}</div></CardHeader>
      <CardContent className="px-4 pb-4">
      <div className="h-36 w-full min-w-0 max-w-full overflow-hidden" aria-hidden="true"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 320, height: 144 }}><BarChart data={people} layout="vertical" margin={{ left: 0, right: 12, top: 5, bottom: 5 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} width={58} /><Tooltip formatter={(value) => formatKrw(Number(value))} /><Bar dataKey="value" fill="#0a84ff" radius={[0, 7, 7, 0]} isAnimationActive={!reduceMotion} animationDuration={animationDuration} /></BarChart></ResponsiveContainer></div>
      <AccessibleTable caption={`사용자별 ${personMode === "used" ? "사용액" : "결제액"}`} rows={people.map((item) => [item.name, formatKrw(item.value)])} />
      </CardContent>
    </Card>

    <Card className="w-full min-w-0 max-w-full gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="mb-3 px-4 pt-4"><div className="min-w-0"><h2 className="truncate text-sm font-extrabold">카테고리별 지출</h2><p className="mt-0.5 truncate text-[11px] text-slate-400">금액이 큰 순서</p></div></CardHeader>
      <CardContent className="px-4 pb-4">
      <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
        <div className="h-32 min-w-0 overflow-hidden" aria-hidden="true"><ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 112, height: 128 }}><PieChart><Pie data={categories} dataKey="amount" nameKey="label" innerRadius={35} outerRadius={55} paddingAngle={2} isAnimationActive={!reduceMotion} animationDuration={animationDuration}>{categories.map((item) => <Cell key={item.key} fill={item.color} />)}</Pie><Tooltip formatter={(value) => formatKrw(Number(value))} /></PieChart></ResponsiveContainer></div>
        <ol className="min-w-0 space-y-2">{categories.map((item) => <li key={item.key} className="flex min-w-0 items-center gap-2 text-xs"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate font-semibold" title={item.label}>{item.label}</span><span className="shrink-0 font-bold tabular-nums">{formatKrw(item.amount)}</span></li>)}</ol>
      </div>
      <AccessibleTable caption="카테고리별 원화 지출" rows={categories.map((item) => [item.label, formatKrw(item.amount)])} />
      </CardContent>
    </Card>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-extrabold">자동 정산</p>
      {summary.settlement ? <><p className="mt-3 text-xl font-bold tracking-tight"><span className="text-blue-600">{EXPENSE_PERSON_META[summary.settlement.from].label}</span> → {EXPENSE_PERSON_META[summary.settlement.to].label}</p><p className="mt-1 text-2xl font-black tabular-nums">{formatKrw(summary.settlement.amount)}</p><details className="mt-3 text-xs text-slate-500"><summary className="min-h-11 cursor-pointer py-3 font-bold">정산 근거 보기</summary><div className="grid grid-cols-2 gap-2 border-t pt-3"><p>가현 결제 {formatKrw(summary.paid.gahyun)}</p><p>가현 사용 {formatKrw(summary.used.gahyun)}</p><p>미누 결제 {formatKrw(summary.paid.minu)}</p><p>미누 사용 {formatKrw(summary.used.minu)}</p></div></details></> : <p className="mt-2 text-sm text-slate-500">현재 서로 주고받을 금액이 없어요.</p>}
    </section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="bg-white p-4 dark:bg-slate-900"><p className="text-[11px] font-semibold text-slate-400">{label}</p><p className="mt-1 text-lg font-extrabold tabular-nums">{value}</p></div>; }

function AccessibleTable({ caption, rows }: { caption: string; rows: string[][] }) { return <table className="sr-only"><caption>{caption}</caption><thead><tr><th>구분</th><th>금액</th></tr></thead><tbody>{rows.map((row) => <tr key={row.join("-")}><th>{row[0]}</th><td>{row[1]}</td></tr>)}</tbody></table>; }
