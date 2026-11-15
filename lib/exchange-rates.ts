import { useQuery } from "@tanstack/react-query";
import { CURRENCY_INFO, roundAmount, type LocalCurrencyCode } from "@/lib/currency";
import { supabase } from "@/lib/supabase";

export const DEFAULT_THB_TO_KRW_RATE = 42.8;
export const DEFAULT_USD_TO_KRW_RATE = 1380;
/** 실시간 환율과 DB 캐시가 모두 실패할 때만 쓰는 임시값. */
export const DEFAULT_JPY_TO_KRW_RATE = 8.4;

export const EXCHANGE_RATES_QUERY_KEY = ["exchange-rates"] as const;

export interface ExchangeRatesData {
  THB: number;
  JPY: number;
  USD: number;
  lastUpdatedText: string | null;
}

export async function fetchExchangeRates(): Promise<ExchangeRatesData> {
  // 1. 실시간 공개 외환 API 조회 (Open Exchange Rates API)
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/THB");
    if (res.ok) {
      const json = await res.json();
      if (json?.result === "success" && json?.rates?.KRW) {
        const thbRate = Number(json.rates.KRW.toFixed(2));
        const usdRate = Number((json.rates.KRW / json.rates.USD).toFixed(2));
        // 기준 통화가 THB라서 KRW/JPY가 곧 1엔당 원화다.
        const jpyRate = json.rates.JPY > 0 ? Number((json.rates.KRW / json.rates.JPY).toFixed(4)) : DEFAULT_JPY_TO_KRW_RATE;
        let lastUpdatedText: string | null = null;
        if (json.time_last_update_utc) {
          const dateObj = new Date(json.time_last_update_utc);
          lastUpdatedText = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")} 기준`;
        }
        return { THB: thbRate, JPY: jpyRate, USD: usdRate, lastUpdatedText };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch live exchange rates, falling back:", err);
  }

  // 2. Supabase 캐시 백업 조회
  try {
    const { data } = await supabase.from("exchange_rates").select("*").in("currency", ["THB", "JPY", "USD"]);
    if (data && data.length > 0) {
      let thb = DEFAULT_THB_TO_KRW_RATE;
      let usd = DEFAULT_USD_TO_KRW_RATE;
      let jpy = DEFAULT_JPY_TO_KRW_RATE;
      data.forEach((item) => {
        if (item.currency === "THB") thb = Number(item.rate_to_krw);
        if (item.currency === "USD") usd = Number(item.rate_to_krw);
        if (item.currency === "JPY") jpy = Number(item.rate_to_krw);
      });
      return { THB: thb, JPY: jpy, USD: usd, lastUpdatedText: "DB 기준" };
    }
  } catch (err) {
    console.warn("Supabase fallback failed:", err);
  }

  return { THB: DEFAULT_THB_TO_KRW_RATE, JPY: DEFAULT_JPY_TO_KRW_RATE, USD: DEFAULT_USD_TO_KRW_RATE, lastUpdatedText: null };
}

export function useExchangeRates() {
  return useQuery({
    queryKey: EXCHANGE_RATES_QUERY_KEY,
    queryFn: fetchExchangeRates,
    staleTime: 1000 * 60 * 15, // 15분 캐싱
    gcTime: 1000 * 60 * 60, // 1시간
  });
}

export const EXCHANGE_RATE_QUERY_KEY = EXCHANGE_RATES_QUERY_KEY;

export async function fetchThbToKrwRate(): Promise<number> {
  const ratesData = await fetchExchangeRates();
  return ratesData.THB;
}

export const DEFAULT_LOCAL_TO_KRW_RATE: Record<LocalCurrencyCode, number> = {
  THB: DEFAULT_THB_TO_KRW_RATE,
  JPY: DEFAULT_JPY_TO_KRW_RATE,
};

/** 조회된 환율이 없으면 기본값을 돌려준다. rate는 1단위당 원화. */
export const getLocalToKrwRate = (rates: ExchangeRatesData | undefined, currency: LocalCurrencyCode) =>
  rates?.[currency] ?? DEFAULT_LOCAL_TO_KRW_RATE[currency];

/** 환율을 한눈에 보여주는 문구의 기준 수량. 바트는 10바트, 엔은 100엔. */
export const getRatePreviewUnit = (currency: LocalCurrencyCode) => (currency === "JPY" ? 100 : 10);

/** 예: "฿10 ≈ ₩428", "¥100 ≈ ₩950" */
export const formatRatePreview = (rate: number, currency: LocalCurrencyCode, unit = getRatePreviewUnit(currency)) =>
  `${CURRENCY_INFO[currency].symbol}${unit} ≈ ₩${Math.round(rate * unit).toLocaleString("ko-KR")}`;

export type InputCurrency = LocalCurrencyCode | "KRW";

export const toFiniteAmount = (value: number) => (Number.isFinite(value) ? value : 0);

/** 현지 통화 금액을 원화로 환산한다. rate는 1단위당 원화. */
export const convertLocalToKrw = (local: number, rate: number) =>
  Math.round(toFiniteAmount(local) * toFiniteAmount(rate));

/** 원화를 현지 통화로 환산한다. 결과는 해당 통화의 소수점 자릿수로 반올림한다. */
export const convertKrwToLocal = (krw: number, rate: number, currency: LocalCurrencyCode) =>
  rate > 0 ? roundAmount(toFiniteAmount(krw) / rate, currency) : 0;

export const formatCurrencyInputAmount = (value: number, currency: InputCurrency) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  return String(Number(value.toFixed(CURRENCY_INFO[currency].fractionDigits)));
};

/** 입력 통화를 현지 통화와 원화 사이에서 전환하고, 금액을 환율로 변환해 새 입력값으로 돌려준다. */
export const toggleCurrencyAmount = (
  amount: number,
  rate: number,
  from: InputCurrency,
  localCurrency: LocalCurrencyCode,
  fallbackAmount = "",
): { nextCurrency: InputCurrency; nextAmount: string } => {
  const nextCurrency: InputCurrency = from === "KRW" ? localCurrency : "KRW";
  if (rate <= 0) return { nextCurrency, nextAmount: fallbackAmount };

  const currentKrw = from === "KRW" ? toFiniteAmount(amount) : toFiniteAmount(amount) * rate;
  const converted = nextCurrency === "KRW" ? currentKrw : convertKrwToLocal(currentKrw, rate, localCurrency);
  return { nextCurrency, nextAmount: formatCurrencyInputAmount(converted, nextCurrency) };
};
