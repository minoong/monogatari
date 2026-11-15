import type { TripConfig } from "./types";

/**
 * 2026-08-29 ~ 09-02 태국(방콕, 파타야, 코시창) 여행.
 *
 * 항공, 숙소, 회화처럼 상세한 정적 데이터는 아직 기존 모듈(lib/flights.ts, lib/accommodations.ts,
 * lib/phrases.ts)에 있다. 화면을 여행별로 전환하는 단계에서 이 설정으로 옮긴다.
 * phaseStartsAt/phaseEndsAt은 lib/trip-phase.ts의 항공편 출발 시각과 같아야 한다.
 */
export const THAILAND_TRIP: TripConfig = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "thailand-2026-08",
  name: "태국 방콕 여행",
  shortName: "방콕",
  countryCode: "TH",
  flag: "🇹🇭",
  startDate: "2026-08-29",
  endDate: "2026-09-02",
  timeZone: "Asia/Bangkok",
  utcOffset: "+07:00",
  phaseStartsAt: "2026-08-29T09:45:00+09:00",
  phaseEndsAt: "2026-09-01T21:40:00+07:00",
  currency: { code: "THB", displayUnit: 1 },
  language: { code: "th", label: "태국어", speechLang: "th-TH" },
  expenseCategories: ["food", "transport", "shopping", "stay", "activity", "massage", "convenience", "other"],
  paymentMethods: ["cash", "card", "qr", "other"],
  weatherPlaces: [
    { id: "bangkok", label: "방콕", latitude: 13.7563, longitude: 100.5018 },
    { id: "pattaya", label: "팟타야", latitude: 12.9236, longitude: 100.8825 },
    { id: "koh-sichang", label: "코시창", latitude: 13.161, longitude: 100.808 },
  ],
  flights: [],
  stays: [],
  dayTrips: [],
};
