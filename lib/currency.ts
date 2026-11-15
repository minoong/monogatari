import type { TripCurrencyCode } from "./trips/types";

/** 여행지 현지 통화. 원화(KRW)는 항상 정산 기준 통화로 따로 다룬다. */
export type LocalCurrencyCode = TripCurrencyCode;
export type CurrencyCode = LocalCurrencyCode | "KRW";

export interface CurrencyInfo {
  label: string;
  symbol: string;
  /** flagcdn.com 국기 코드 */
  flagCode: string;
  /** 소수점 자릿수. 엔과 원은 0, 바트는 2. */
  fractionDigits: number;
}

export const CURRENCY_INFO: Record<CurrencyCode, CurrencyInfo> = {
  THB: { label: "태국 바트", symbol: "฿", flagCode: "th", fractionDigits: 2 },
  JPY: { label: "일본 엔", symbol: "¥", flagCode: "jp", fractionDigits: 0 },
  KRW: { label: "대한민국 원", symbol: "₩", flagCode: "kr", fractionDigits: 0 },
};

export const isLocalCurrency = (value: unknown): value is LocalCurrencyCode =>
  value === "THB" || value === "JPY";

/** 통화의 소수점 자릿수에 맞춰 반올림한다. 유한하지 않은 값은 0. */
export const roundAmount = (value: number, currency: CurrencyCode) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** CURRENCY_INFO[currency].fractionDigits;
  return Math.round(value * factor) / factor;
};

/** 통화 기호가 붙은 금액 문자열. 예: ฿1,234.5, ¥1,200, ₩9,800 */
export const formatAmount = (value: number, currency: CurrencyCode) => {
  const info = CURRENCY_INFO[currency];
  const safe = Number.isFinite(value) ? value : 0;
  return `${info.symbol}${safe.toLocaleString("ko-KR", { maximumFractionDigits: info.fractionDigits })}`;
};
