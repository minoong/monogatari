/** DB `trips.id`와 반드시 같은 값이어야 한다. (supabase/migrations/20261115100000_create_trips.sql) */
export type TripId = string;

export type TripSlug = "thailand-2026-08" | "japan-yonago-2026-12";

export type TripCurrencyCode = "THB" | "JPY";

export interface TripCurrency {
  code: TripCurrencyCode;
  label: string;
  symbol: string;
  /** 소수점 자릿수. 엔화는 0, 바트는 2. */
  fractionDigits: number;
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
  airport: string;
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
  currency: TripCurrency;
  language: TripLanguage;
  weatherPlaces: readonly TripWeatherPlace[];
  /** 가는 편과 오는 편. 항공편이 없는 여행은 빈 배열. */
  flights: readonly TripFlightSeed[];
  /** 숙소 초기 데이터. 상세(주소, 시설 등)는 확정되는 대로 채운다. */
  stays: readonly TripStaySeed[];
  dayTrips: readonly TripDayTripSeed[];
}

export type TripPhase = "before" | "during" | "after";
