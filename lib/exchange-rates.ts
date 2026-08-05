import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const DEFAULT_THB_TO_KRW_RATE = 42.8;
export const DEFAULT_USD_TO_KRW_RATE = 1380;

export const EXCHANGE_RATES_QUERY_KEY = ["exchange-rates"] as const;

export interface ExchangeRatesData {
  THB: number;
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
        let lastUpdatedText: string | null = null;
        if (json.time_last_update_utc) {
          const dateObj = new Date(json.time_last_update_utc);
          lastUpdatedText = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")} 기준`;
        }
        return { THB: thbRate, USD: usdRate, lastUpdatedText };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch live exchange rates, falling back:", err);
  }

  // 2. Supabase 캐시 백업 조회
  try {
    const { data } = await supabase.from("exchange_rates").select("*").in("currency", ["THB", "USD"]);
    if (data && data.length > 0) {
      let thb = DEFAULT_THB_TO_KRW_RATE;
      let usd = DEFAULT_USD_TO_KRW_RATE;
      data.forEach((item) => {
        if (item.currency === "THB") thb = Number(item.rate_to_krw);
        if (item.currency === "USD") usd = Number(item.rate_to_krw);
      });
      return { THB: thb, USD: usd, lastUpdatedText: "DB 기준" };
    }
  } catch (err) {
    console.warn("Supabase fallback failed:", err);
  }

  return { THB: DEFAULT_THB_TO_KRW_RATE, USD: DEFAULT_USD_TO_KRW_RATE, lastUpdatedText: null };
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
