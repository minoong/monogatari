import type { ExpenseCategory, ExpensePaymentMethod } from "../expenses";

/** DB `trips.id`와 반드시 같은 값이어야 한다. (supabase/migrations/20261115100000_create_trips.sql) */
export type TripId = string;

export type TripSlug = "thailand-2026-08" | "japan-yonago-2026-12";

export type TripCurrencyCode = "THB" | "JPY";

export interface TripCurrency {
  code: TripCurrencyCode;
  /** 환율을 화면에 보여줄 때의 기준 수량. 엔화는 보통 100엔당 원화로 본다. 내부 계산은 항상 1단위 기준. */
  displayUnit: number;
}

export interface TripLanguage {
  /** ISO 639-1 */
  code: "th" | "ja";
  label: string;
  /** Web Speech API 언어 태그 */
  speechLang: "th-TH" | "ja-JP";
}

export interface TripWeatherPlace {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface TripStaySeed {
  id: string;
  city: string;
  name: string;
  englishName: string;
  /** 체크인 날짜 (현지, YYYY-MM-DD) */
  checkInDate: string;
  /** 체크아웃 날짜 (현지, YYYY-MM-DD) */
  checkOutDate: string;
  googleMapsUrl: string;
  agodaUrl: string;
  address: string;
  /** 체크인 가능 시작 시각 (HH:mm) */
  checkInTime: string;
  /** 체크아웃 마감 시각 (HH:mm) */
  checkOutTime: string;
  /** 아고다 평점 (10점 만점)과 후기 수 */
  score: number;
  reviewCount: number;
  imageUrl: string;
  /** 아고다 상세 페이지에서 확인된 사실만 적는다. */
  highlights: readonly string[];
}

export interface TripDayTripSeed {
  date: string;
  title: string;
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
}

export interface TripFlightEndpoint {
  /** IATA 공항 코드 */
  code: string;
  /** 짧은 도시명. 보딩패스 카드 등 좁은 곳에 쓴다. */
  city: string;
  airport: string;
  /** 해당 공항의 UTC 오프셋("+09:00"). 비행시간과 다음날 도착 여부를 계산하는 데 쓴다. */
  utcOffset: string;
  /** 해당 공항 현지 시각(HH:mm) */
  time: string;
}

export interface TripFlightSeed {
  id: "outbound" | "return";
  flightNumber: string;
  /** 출발일 (출발 공항 현지 날짜, YYYY-MM-DD) */
  date: string;
  departure: TripFlightEndpoint;
  arrival: TripFlightEndpoint;
  /** 항공사·기종처럼 확인된 부가 정보. 모르면 생략한다. */
  detail?: string;
}

/** 앱바 제목처럼 여행마다 달라지는 문구 */
export interface TripCopy {
  homeTitle: string;
  dictionaryTitle: string;
}

/** 여행별 분위기. 색은 `--trip-accent`, `--trip-tint` CSS 변수로 노출된다. */
export interface TripTheme {
  id: "bangkok" | "onsen";
  /** 강조색(hex) */
  accent: string;
  /** 아주 연한 배경 틴트(hex) */
  tint: string;
  /** 홈 상단 배경. none이면 아무것도 그리지 않는다. */
  backdrop:
    | { kind: "none" }
    | {
        /** 바탕 그라디언트 위로 흐린 빛 덩어리가 천천히 피어오르는 CSS 전용 효과. WebGL을 쓰지 않는다. */
        kind: "steam";
        gradient: string;
        /** 피어오르는 빛 덩어리 색상(3개 권장) */
        puffColors: readonly string[];
      };
}

export interface TripConfig {
  id: TripId;
  slug: TripSlug;
  name: string;
  /** 앱바나 카드에 쓰는 짧은 이름 */
  shortName: string;
  countryCode: "TH" | "JP";
  flag: string;
  /** 현지 기준 첫날과 마지막 날 (YYYY-MM-DD) */
  startDate: string;
  endDate: string;
  /** IANA 타임존 */
  timeZone: string;
  /** 현지 UTC 오프셋. 일본과 태국 모두 DST가 없어 고정값을 쓴다. */
  utcOffset: string;
  /** 여행 단계(before -> during)가 바뀌는 시각. 보통 가는 항공편 출발 시각. */
  phaseStartsAt: string;
  /** 여행 단계(during -> after)가 바뀌는 시각. 보통 오는 항공편 출발 시각. */
  phaseEndsAt: string;
  copy: TripCopy;
  theme: TripTheme;
  currency: TripCurrency;
  language: TripLanguage;
  /** 지출 등록에서 추천하는 카테고리 (이미 저장된 다른 카테고리도 계속 표시된다). */
  expenseCategories: readonly ExpenseCategory[];
  paymentMethods: readonly ExpensePaymentMethod[];
  weatherPlaces: readonly TripWeatherPlace[];
  /** 가는 편과 오는 편. 항공편이 없는 여행은 빈 배열. */
  flights: readonly TripFlightSeed[];
  /** 숙소 초기 데이터. 상세(주소, 시설 등)는 확정되는 대로 채운다. */
  stays: readonly TripStaySeed[];
  dayTrips: readonly TripDayTripSeed[];
}

export type TripPhase = "before" | "during" | "after";
