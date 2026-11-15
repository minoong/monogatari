import { getFlight, type TripConfig, type TripFlightSeed } from "./trips";

export type FlightSegment = {
  id: "outbound" | "return";
  label: "가는편" | "오는편";
  /** 예: "2026년 08월 29일" */
  date: string;
  /** 요일 한 글자 */
  day: string;
  flightNumber: string;
  /** 항공사 등 확인된 부가 정보. 대한항공 상세(koreanAir)가 없는 예약에서만 쓴다. */
  detail?: string;
  /** 좌석 선택 상태. 예: "좌석 선택 전" */
  seatStatus?: string;
  /** "5시간 50분"처럼 시간과 분을 모두 적은 문자열 */
  duration: string;
  departure: {
    time: string;
    code: string;
    airport: string;
    terminal?: string;
  };
  arrival: {
    time: string;
    code: string;
    airport: string;
    terminal?: string;
    nextDay?: boolean;
  };
  /**
   * 대한항공 예약 상세(기종, 좌석 등급, 기내 서비스). 확인된 경우에만 있고,
   * 없으면 화면은 항공사 브랜딩과 상세 항목을 보여주지 않는다.
   */
  koreanAir?: {
    aircraft: string;
    operatingCarrier: string;
    cabin: string;
    fareFamily: string;
    baggage: string;
    inFlightServices: readonly string[];
  };
};

export type FlightPassengerId = "gahyun" | "minu";

export const FLIGHT_PASSENGERS = [
  { id: "gahyun" as const, name: "가현짱", initials: "G", image: "/avatars/gahyun.webp" },
  { id: "minu" as const, name: "미누쿤", initials: "M", image: "/avatars/minu.webp" },
] as const satisfies readonly { id: FlightPassengerId; name: string; initials: string; image: string }[];

export const FLIGHT_PASSENGER_DETAILS = {
  gahyun: {
    ticketName: "OH GAHYUN",
    serviceNote: "개별 티켓 정보 전달 대기 중",
  },
  minu: {
    ticketName: "LEE MINWOO",
    serviceNote: "LEE MINWOO 여정 1",
    serviceApplications: ["좌석 선택", "초과 수하물", "기타 서비스"],
  },
} as const;

const KOREAN_AIR_A330_ECONOMY = {
  aircraft: "A330-300",
  operatingCarrier: "대한항공 운항",
  cabin: "일반석 (Q)",
  fareFamily: "일반석 세이버",
  baggage: "위탁 수하물 1개",
  inFlightServices: ["기내 어메니티", "기내 전원 공급 장치", "기내 엔터테인먼트", "부가 서비스"],
} as const;

/** 태국 여행(KE657/KE658) 예약 상세. */
export const THAILAND_FLIGHT_SEGMENTS: readonly FlightSegment[] = [
  {
    id: "outbound",
    label: "가는편",
    date: "2026년 08월 29일",
    day: "토",
    flightNumber: "KE657",
    koreanAir: KOREAN_AIR_A330_ECONOMY,
    duration: "5시간 50분",
    departure: { time: "09:45", code: "ICN", airport: "서울/인천", terminal: "터미널 2" },
    arrival: { time: "13:35", code: "BKK", airport: "방콕/수완나품" },
  },
  {
    id: "return",
    label: "오는편",
    date: "2026년 09월 01일",
    day: "화",
    flightNumber: "KE658",
    koreanAir: KOREAN_AIR_A330_ECONOMY,
    duration: "5시간 25분",
    departure: { time: "21:40", code: "BKK", airport: "방콕/수완나품" },
    arrival: { time: "05:05", code: "ICN", airport: "서울/인천", terminal: "터미널 2", nextDay: true },
  },
] as const;


export const FLIGHT_TICKET_NUMBERS: Record<FlightPassengerId, string> = {
  gahyun: "1805460443724",
  minu: "1805460443724",
};

export const KOREAN_AIR_LOGO_URL = "https://www.koreanair.com/header/header/images/logo/logo__koreanair.svg";
export const KOREAN_AIR_MARK_URL = "https://www.koreanair.com/assets/images/common/codeshare-ke.svg";

const minutesOf = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const offsetMinutesOf = (offset: string) => {
  const [hour, minute] = offset.slice(1).split(":").map(Number);
  return (offset.startsWith("-") ? -1 : 1) * (hour * 60 + minute);
};

/** 출발·도착 현지 시각과 UTC 오프셋으로 비행시간과 다음날 도착 여부를 계산한다. */
export const computeFlightTiming = (flight: TripFlightSeed) => {
  const departUtc = minutesOf(flight.departure.time) - offsetMinutesOf(flight.departure.utcOffset);
  let arriveUtc = minutesOf(flight.arrival.time) - offsetMinutesOf(flight.arrival.utcOffset);
  while (arriveUtc <= departUtc) arriveUtc += 1440;
  const total = arriveUtc - departUtc;
  // 출발일 UTC 자정 기준 분. 출발지 현지 날짜는 0일째이고, 도착지 현지 날짜가 1일 이상이면 다음날 도착이다.
  const nextDay = Math.floor((arriveUtc + offsetMinutesOf(flight.arrival.utcOffset)) / 1440) > 0;
  return { duration: `${Math.floor(total / 60)}시간 ${total % 60}분`, nextDay };
};

const toSegment = (flight: TripFlightSeed): FlightSegment => {
  const [year, month, day] = flight.date.split("-");
  const { duration, nextDay } = computeFlightTiming(flight);
  return {
    id: flight.id,
    label: flight.id === "outbound" ? "가는편" : "오는편",
    date: `${year}년 ${month}월 ${day}일`,
    day: new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "UTC" }).format(new Date(`${flight.date}T12:00:00Z`)),
    flightNumber: flight.flightNumber,
    detail: flight.detail,
    seatStatus: flight.seatStatus,
    duration,
    departure: { time: flight.departure.time, code: flight.departure.code, airport: flight.departure.airport },
    arrival: { time: flight.arrival.time, code: flight.arrival.code, airport: flight.arrival.airport, ...(nextDay ? { nextDay } : {}) },
  };
};

/** 여행의 항공 구간. 태국은 확인된 예약 상세를 그대로 쓰고, 그 외에는 설정의 편명과 시각으로 만든다. */
export const getFlightSegments = (trip: TripConfig): readonly FlightSegment[] =>
  trip.slug === "thailand-2026-08" ? THAILAND_FLIGHT_SEGMENTS : trip.flights.map(toSegment);

/** 탑승객별 티켓. 현재는 두 사람이 같은 구간이다. */
export const getFlightTickets = (trip: TripConfig): Record<FlightPassengerId, readonly FlightSegment[]> => {
  const segments = getFlightSegments(trip);
  return { gahyun: segments, minu: segments };
};

/** 항공권 번호. 확인된 예약(태국)에만 있다. */
export const getFlightTicketNumber = (trip: TripConfig, passengerId: FlightPassengerId): string | null =>
  trip.slug === "thailand-2026-08" ? FLIGHT_TICKET_NUMBERS[passengerId] : null;

/** 여행의 항공 예약이 대한항공 상세와 함께 확인된 경우. */
export const hasKoreanAirBooking = (trip: TripConfig) => trip.slug === "thailand-2026-08";

/** 오늘(출발지 현지 날짜)이 가는 편 날짜를 지났으면 오는 편을 기본으로 보여준다. */
export function getDefaultFlightSegmentId(trip: TripConfig, now = new Date()): FlightSegment["id"] {
  const outbound = getFlight(trip, "outbound");
  if (!outbound) return "outbound";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: trip.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return today > outbound.date ? "return" : "outbound";
}
