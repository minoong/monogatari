import { JAPAN_YONAGO_TRIP } from "./japan-yonago";
import { THAILAND_TRIP } from "./thailand";
import type { TripConfig, TripPhase, TripSlug } from "./types";

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
export const getTripDates = (trip: TripConfig): string[] => {
  const dates: string[] = [];
  for (let date = trip.startDate; date <= trip.endDate; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
};

export const isTripDate = (trip: TripConfig, value: unknown): value is string =>
  typeof value === "string" && value >= trip.startDate && value <= trip.endDate && getTripDates(trip).includes(value);

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
