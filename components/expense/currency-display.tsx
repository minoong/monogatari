import {
  EXPENSE_CURRENCY_META,
  formatKrw,
  formatThb,
  type ExpenseCurrencyCode,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type CurrencySize = "hero" | "main" | "secondary" | "compact" | "inline";

const SIZE_CLASS: Record<CurrencySize, string> = {
  hero: "text-[38px] font-black leading-none tracking-[-0.04em]",
  main: "text-[15px] font-black tracking-[-0.02em]",
  secondary: "text-[12px] font-semibold",
  compact: "text-[10px] font-bold",
  inline: "text-[11px] font-black tracking-[-0.01em]",
};

interface ExpenseCurrencyAmountProps {
  currency: ExpenseCurrencyCode;
  value: number;
  size?: CurrencySize;
  className?: string;
}

export function ExpenseCurrencyAmount({
  currency,
  value,
  size = "main",
  className,
}: ExpenseCurrencyAmountProps) {
  const meta = EXPENSE_CURRENCY_META[currency];
  const formatted = currency === "KRW" ? formatKrw(value) : formatThb(value);
  const colorClass =
    size === "inline"
      ? currency === "KRW"
        ? meta.colorClass
        : meta.mutedClass
      : size === "secondary" || size === "compact"
        ? meta.mutedClass
        : meta.colorClass;

  return (
    <span className={cn("tabular-nums", SIZE_CLASS[size], colorClass, className)}>
      {formatted}
    </span>
  );
}

interface ExpenseCurrencyPairProps {
  krw: number;
  thb: number;
  mainSize?: CurrencySize;
  secondarySize?: CurrencySize;
  className?: string;
  stackClassName?: string;
}

/** 원화를 메인, 바트를 세컨더리로 묶어 보여준다. */
export function ExpenseCurrencyPair({
  krw,
  thb,
  mainSize = "main",
  secondarySize = "secondary",
  className,
  stackClassName,
}: ExpenseCurrencyPairProps) {
  return (
    <div className={cn("flex flex-col items-end", stackClassName, className)}>
      <ExpenseCurrencyAmount currency="KRW" size={mainSize} value={krw} />
      <ExpenseCurrencyAmount className={cn(mainSize === "hero" ? "mt-2" : "mt-1")} currency="THB" size={secondarySize} value={thb} />
    </div>
  );
}

interface ExpenseDaySummaryProps {
  count: number;
  krw: number;
  thb: number;
}

/** 일별 헤더용: 건수 · 원화 · 바트를 구분선으로 나눠 같은 크기로 보여준다. */
export function ExpenseDaySummary({ count, krw, thb }: ExpenseDaySummaryProps) {
  return (
    <div
      aria-label={`${count}건, ${formatKrw(krw)}, ${formatThb(thb)}`}
      className="flex shrink-0 items-center gap-1.5 tabular-nums"
    >
      <span className="text-[11px] font-semibold text-slate-400">{count}건</span>
      <DaySummarySeparator />
      <ExpenseCurrencyAmount currency="KRW" size="inline" value={krw} />
      <DaySummarySeparator />
      <ExpenseCurrencyAmount currency="THB" size="inline" value={thb} />
    </div>
  );
}

function DaySummarySeparator() {
  return <Separator className="h-3" orientation="vertical" />;
}
