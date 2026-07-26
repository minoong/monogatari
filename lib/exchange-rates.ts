import { supabase } from "@/lib/supabase";

export const DEFAULT_THB_TO_KRW_RATE = 38.5;

export const EXCHANGE_RATE_QUERY_KEY = ["exchange-rates", "THB"] as const;

export async function fetchThbToKrwRate() {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate_to_krw")
    .eq("currency", "THB")
    .single();

  if (error) throw error;

  const rate = Number(data.rate_to_krw);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_THB_TO_KRW_RATE;
}
