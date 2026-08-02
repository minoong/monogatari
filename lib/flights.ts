export type FlightSegment = {
  id: "outbound" | "return";
  label: "가는편" | "오는편";
  date: string;
  day: string;
  flightNumber: string;
  aircraft: string;
  operatingCarrier: string;
  cabin: string;
  fareFamily: string;
  baggage: string;
  inFlightServices: readonly string[];
  duration: string;
  departure: {
    time: string;
    code: "ICN" | "BKK";
    airport: string;
    terminal?: string;
  };
  arrival: {
    time: string;
    code: "ICN" | "BKK";
    airport: string;
    terminal?: string;
    nextDay?: boolean;
  };
};

export type FlightPassengerId = "gahyun" | "minu";

export const FLIGHT_PASSENGERS = [
  { id: "gahyun" as const, name: "가현짱", initials: "G", image: "/avatars/gahyun.webp" },
  { id: "minu" as const, name: "미누쿤", initials: "M", image: "/avatars/minu.webp" },
] as const satisfies readonly { id: FlightPassengerId; name: string; initials: string; image: string }[];

export const FLIGHT_PASSENGER_DETAILS = {
  gahyun: {
    ticketName: "가현짱",
    serviceNote: "개별 티켓 정보 전달 대기 중",
  },
  minu: {
    ticketName: "LEE MINWOO",
    serviceNote: "LEE MINWOO 여정 1",
    serviceApplications: ["좌석 선택", "초과 수하물", "기타 서비스"],
  },
} as const;

export const FLIGHT_SEGMENTS: readonly FlightSegment[] = [
  {
    id: "outbound",
    label: "가는편",
    date: "2026년 08월 29일",
    day: "토",
    flightNumber: "KE657",
    aircraft: "A330-300",
    operatingCarrier: "대한항공 운항",
    cabin: "일반석 (Q)",
    fareFamily: "일반석 세이버",
    baggage: "위탁 수하물 1개",
    inFlightServices: ["기내 어메니티", "기내 전원 공급 장치", "기내 엔터테인먼트", "부가 서비스"],
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
    aircraft: "A330-300",
    operatingCarrier: "대한항공 운항",
    cabin: "일반석 (Q)",
    fareFamily: "일반석 세이버",
    baggage: "위탁 수하물 1개",
    inFlightServices: ["기내 어메니티", "기내 전원 공급 장치", "기내 엔터테인먼트", "부가 서비스"],
    duration: "5시간 25분",
    departure: { time: "21:40", code: "BKK", airport: "방콕/수완나품" },
    arrival: { time: "05:05", code: "ICN", airport: "서울/인천", terminal: "터미널 2", nextDay: true },
  },
] as const;

export const FLIGHT_ROUTE_LABEL = "ICN → BKK · BKK → ICN";
export const FLIGHT_TICKET_NUMBER = "1805460443724";

export const KOREAN_AIR_LOGO_URL = "https://www.koreanair.com/header/header/images/logo/logo__koreanair.svg";
export const KOREAN_AIR_MARK_URL = "https://www.koreanair.com/assets/images/common/codeshare-ke.svg";

// 탑승객별로 분리해 두어 이후 편명·시간·터미널이 달라도 독립적으로 수정할 수 있습니다.
export const FLIGHT_TICKETS: Record<FlightPassengerId, readonly FlightSegment[]> = {
  gahyun: FLIGHT_SEGMENTS,
  minu: FLIGHT_SEGMENTS,
};
