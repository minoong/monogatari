import { FLIGHT_SEGMENTS } from "@/lib/flights";

export type TripPhase = "before" | "during" | "after";

const outboundFlight = FLIGHT_SEGMENTS.find((segment) => segment.id === "outbound");
const returnFlight = FLIGHT_SEGMENTS.find((segment) => segment.id === "return");

/** 인천 출발(KE657) 2026-08-29 09:45 — 한국 시간(KST, UTC+9) */
export const OUTBOUND_DEPARTURE = new Date("2026-08-29T09:45:00+09:00");

/** 방콕 출발(KE658) 2026-09-01 21:40 — 태국 시간(ICT, UTC+7) */
export const TRIP_RETURN_DEPARTURE = new Date("2026-09-01T21:40:00+07:00");

export const TRIP_RETURN_FLIGHT = returnFlight;

export function isBeforeOutboundDeparture(now = new Date()) {
  return now < OUTBOUND_DEPARTURE;
}

export function isBeforeReturnBoarding(now = new Date()) {
  return now < TRIP_RETURN_DEPARTURE;
}

/**
 * 여행 단계는 각 항공편 출발 시각(공항 현지 시간)을 기준으로 판단한다.
 * - before: 인천 출발 전 (KST)
 * - during: 인천 출발 후 ~ 방콕 귀국편 출발 전 (ICT)
 * - after: 방콕 귀국편 출발 후
 */
export function getTripPhase(now = new Date()): TripPhase {
  if (isBeforeOutboundDeparture(now)) return "before";
  if (isBeforeReturnBoarding(now)) return "during";
  return "after";
}

export const TRIP_PHASE_LABELS = {
  outboundDeparture: outboundFlight
    ? `${outboundFlight.date} ${outboundFlight.departure.time} KST`
    : "2026-08-29 09:45 KST",
  returnDeparture: returnFlight
    ? `${returnFlight.date} ${returnFlight.departure.time} ICT`
    : "2026-09-01 21:40 ICT",
} as const;
