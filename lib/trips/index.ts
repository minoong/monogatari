import { JAPAN_YONAGO_TRIP } from "./japan-yonago";
import { THAILAND_TRIP } from "./thailand";
import type { TripConfig, TripFlightSeed, TripPhase, TripSlug } from "./types";

export type * from "./types";
export { JAPAN_YONAGO_TRIP, THAILAND_TRIP };

/** 시작일 순서. */
export const TRIPS: readonly TripConfig[] = [THAILAND_TRIP, JAPAN_YONAGO_TRIP];

export const getTripBySlug = (slug: string): TripConfig | null => TRIPS.find((trip) => trip.slug === slug) ?? null;

export const isTripSlug = (value: unknown): value is TripSlug =>
  typeof value === "string" && TRIPS.some((trip) => trip.slug === value);

const addDays = (date: string, days: number) => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

/** 여행 첫날부터 마지막 날까지의 날짜(YYYY-MM-DD) 목록. */
export const getTripDates = (trip: Pick<TripConfig, "startDate" | "endDate">): string[] => {
  const dates: string[] = [];
  for (let date = trip.startDate; date <= trip.endDate; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
};

export const isTripDate = (trip: Pick<TripConfig, "startDate" | "endDate">, value: unknown): value is string =>
  typeof value === "string" && value >= trip.startDate && value <= trip.endDate && getTripDates(trip).includes(value);

/** 가는 편 또는 오는 편. 항공편이 없는 여행이면 null. */
export const getFlight = (trip: Pick<TripConfig, "flights">, id: "outbound" | "return") =>
  trip.flights.find((flight) => flight.id === id) ?? null;

/** 예: "2026년 09월 01일" */
export const formatFlightDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${year}년 ${month}월 ${day}일`;
};

/** 가는 편~오는 편 날짜 차이로 센 박 수. 항공편이 없으면 여행 기간으로 센다. */
export const getTripNights = (trip: TripConfig) => {
  const outbound = getFlight(trip, "outbound");
  const inbound = getFlight(trip, "return");
  const start = outbound?.date ?? trip.startDate;
  const end = inbound?.date ?? trip.endDate;
  return Math.round((new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) / 86_400_000);
};

/** 예: 3 -> "3박 4일" */
export const getTripNightsLabel = (trip: TripConfig) => {
  const nights = getTripNights(trip);
  return `${nights}박 ${nights + 1}일`;
};

/** 여행이 끝난 달. 예: "2026.12" */
export const getTripEndMonthLabel = (trip: Pick<TripConfig, "endDate">) => trip.endDate.slice(0, 7).replace("-", ".");

/** 예: "2026.12.18 (금) 13:20". 요일은 달력 날짜 기준이라 실행 환경 시간대와 무관하다. */
export const formatFlightDeparture = (flight: TripFlightSeed) => {
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "UTC" }).format(new Date(`${flight.date}T12:00:00Z`));
  return `${flight.date.replaceAll("-", ".")} (${weekday}) ${flight.departure.time}`;
};

/**
 * 여행 단계를 `phaseStartsAt` / `phaseEndsAt` 기준으로 계산한다.
 * - before: phaseStartsAt 이전
 * - during: phaseStartsAt 이상, phaseEndsAt 미만
 * - after: phaseEndsAt 이상
 */
export const getTripPhase = (trip: TripConfig, now = new Date()): TripPhase => {
  if (now < new Date(trip.phaseStartsAt)) return "before";
  if (now < new Date(trip.phaseEndsAt)) return "during";
  return "after";
};

/**
 * 지금 화면에 보여줄 여행. 아직 끝나지 않은 여행 중 가장 빠른 것,
 * 모두 끝났다면 가장 최근 여행을 돌려준다.
 */
export const getActiveTrip = (now = new Date()): TripConfig =>
  TRIPS.find((trip) => getTripPhase(trip, now) !== "after") ?? TRIPS[TRIPS.length - 1];
