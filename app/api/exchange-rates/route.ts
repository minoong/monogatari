import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const shiftDate = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const bangkokToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

type FrankfurterRate = { date?: unknown; base?: unknown; quote?: unknown; rate?: unknown };

export async function GET(request: Request) {
  const requestedDate = new URL(request.url).searchParams.get("date") ?? "";
  if (!isRealDate(requestedDate) || requestedDate > bangkokToday()) {
    return NextResponse.json({ error: "구매 날짜를 확인해 주세요." }, { status: 400 });
  }

  for (let offset = 0; offset >= -7; offset -= 1) {
    const candidate = shiftDate(requestedDate, offset);
    try {
      const response = await fetch(`https://api.frankfurter.dev/v2/rate/THB/KRW?date=${candidate}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 * 60 * 6 },
      });
      if (!response.ok) continue;
      const data = (await response.json()) as FrankfurterRate;
      const rate = Number(data.rate);
      const observedDate = typeof data.date === "string" ? data.date : candidate;
      if (!Number.isFinite(rate) || rate <= 0 || !isRealDate(observedDate)) continue;
      return NextResponse.json({
        data: { rate, requestedDate, observedDate, source: "frankfurter" },
      });
    } catch (error) {
      console.warn("Frankfurter exchange-rate lookup failed", { candidate, error });
    }
  }

  if (requestedDate === bangkokToday()) {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("rate_to_krw")
      .eq("currency", "THB")
      .maybeSingle();
    const rate = Number(data?.rate_to_krw);
    if (!error && Number.isFinite(rate) && rate > 0) {
      return NextResponse.json({
        data: { rate, requestedDate, observedDate: requestedDate, source: "supabase_fallback" },
      });
    }
  }

  return NextResponse.json(
    { error: "해당 날짜의 환율을 찾지 못했어요. 환율을 직접 입력해 주세요." },
    { status: 502 },
  );
}
