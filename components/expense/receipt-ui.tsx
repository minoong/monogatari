import type { ReactNode } from "react";
import { ExpenseCurrencyAmount } from "@/components/expense/currency-display";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function ReceiptDashedRule({ className }: { className?: string }) {
  return <Separator className={cn("border-t border-dashed border-slate-300 bg-transparent data-[orientation=horizontal]:h-0", className)} />;
}

export function ReceiptSolidRule({ className }: { className?: string }) {
  return <Separator className={cn("bg-slate-200 dark:bg-slate-700", className)} />;
}

export function ReceiptKeyValue({
  label,
  labelNode,
  value,
  valueNode,
  className,
}: {
  label?: string;
  labelNode?: ReactNode;
  value?: string;
  valueNode?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-1 text-[12px] leading-none text-slate-700 dark:text-slate-300", className)}>
      {labelNode ?? <span className="shrink-0 font-medium text-slate-500 dark:text-slate-400">{label}</span>}
      <span aria-hidden="true" className="mb-0.5 min-w-3 flex-1 border-b border-dotted border-slate-300 dark:border-slate-600" />
      {valueNode ?? <span className="max-w-[62%] shrink-0 text-right font-semibold tabular-nums">{value}</span>}
    </div>
  );
}

export function ReceiptAmountRow({
  label,
  krw,
  thb,
  className,
}: {
  label: string;
  krw: number;
  thb: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-[12px]", className)}>
      <span className="shrink-0 font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex flex-col items-end tabular-nums">
        <ExpenseCurrencyAmount currency="KRW" size="inline" value={krw} />
        <ExpenseCurrencyAmount className="mt-0.5" currency="THB" size="inline" value={thb} />
      </div>
    </div>
  );
}

export function ReceiptTotalBlock({ krw, thb }: { krw: number; thb: number }) {
  return (
    <section aria-label="결제금액" className="py-3">
      <ReceiptSolidRule />
      <div className="flex items-center justify-between gap-3 py-3">
        <span className="text-[15px] font-bold text-slate-900 dark:text-white">결제금액</span>
        <div className="flex flex-col items-end tabular-nums">
          <ExpenseCurrencyAmount currency="KRW" size="hero" value={krw} />
          <ExpenseCurrencyAmount className="mt-1" currency="THB" size="secondary" value={thb} />
        </div>
      </div>
      <ReceiptSolidRule />
    </section>
  );
}
