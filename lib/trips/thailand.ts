import type { TripConfig } from "./types";

/**
 * 2026-08-29 ~ 09-02 태국(방콕, 파타야, 코시창) 여행.
 *
 * 항공, 숙소, 회화처럼 상세한 정적 데이터는 아직 기존 모듈(lib/flights.ts, lib/accommodations.ts,
 * lib/phrases.ts)에 있다. 화면을 여행별로 전환하는 단계에서 이 설정으로 옮긴다.
 * phaseStartsAt/phaseEndsAt은 flights의 출발 시각(각 공항 현지 시간)과 같아야 한다.
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
  copy: {
    homeTitle: "태국을 점령하라!",
    dictionaryTitle: "태국어 사전... 당황하지 말라고!",
    utilsIntro: "방콕에서 바가지 쓰거나 당황하지 말라고!",
    exchangeCardDescription: "태국 바트 바가지 쓰지 않도록 원화랑 달러로 똑바로 확인해!",
    dictionaryCardTitle: "당황 금지! 현지 태국어 사전",
  },
  theme: { id: "bangkok", accent: "#0a84ff", tint: "#ffffff", backdrop: { kind: "none" } },
  currency: { code: "THB", displayUnit: 1 },
  language: { code: "th", label: "태국어", speechLang: "th-TH", genderedPoliteness: true },
  expenseCategories: ["food", "transport", "shopping", "stay", "activity", "massage", "convenience", "other"],
  paymentMethods: ["cash", "card", "qr", "other"],
  weatherPlaces: [
    { id: "bangkok", label: "방콕", latitude: 13.7563, longitude: 100.5018 },
    { id: "pattaya", label: "팟타야", latitude: 12.9236, longitude: 100.8825 },
    { id: "koh-sichang", label: "코시창", latitude: 13.161, longitude: 100.808 },
  ],
  flights: [
    {
      id: "outbound",
      flightNumber: "KE657",
      date: "2026-08-29",
      departure: { code: "ICN", city: "인천", airport: "서울/인천", utcOffset: "+09:00", time: "09:45" },
      arrival: { code: "BKK", city: "방콕", airport: "방콕/수완나품", utcOffset: "+07:00", time: "13:35" },
      detail: "대한항공 A330-300",
    },
    {
      id: "return",
      flightNumber: "KE658",
      date: "2026-09-01",
      departure: { code: "BKK", city: "방콕", airport: "방콕/수완나품", utcOffset: "+07:00", time: "21:40" },
      arrival: { code: "ICN", city: "인천", airport: "서울/인천", utcOffset: "+09:00", time: "05:05" },
      detail: "대한항공 A330-300",
    },
  ],
  stays: [],
  dayTrips: [],
};
