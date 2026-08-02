export type FlightSegment = {
  id: "outbound" | "return";
  label: "가는편" | "오는편";
  date: string;
  day: string;
  flightNumber: string;
  aircraft: string;
  cabin: string;
  baggage: string;
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

export const FLIGHT_PASSENGERS = [
  { id: "gahyun", name: "가현짱", initials: "G", image: "/avatars/gahyun.webp" },
  { id: "minu", name: "미누쿤", initials: "M", image: "/avatars/minu.webp" },
] as const;

export const FLIGHT_SEGMENTS: readonly FlightSegment[] = [
  {
    id: "outbound",
    label: "가는편",
    date: "2026년 08월 29일",
    day: "토",
    flightNumber: "KE657",
    aircraft: "AIRBUS INDUSTRIE A330-300",
    cabin: "일반석 (Q)",
    baggage: "위탁 수하물 1개",
    duration: "5시간 50분",
    departure: { time: "09:45", code: "ICN", airport: "인천국제공항", terminal: "터미널 2" },
    arrival: { time: "13:35", code: "BKK", airport: "수완나품국제공항" },
  },
  {
    id: "return",
    label: "오는편",
    date: "2026년 09월 01일",
    day: "화",
    flightNumber: "KE658",
    aircraft: "AIRBUS INDUSTRIE A330-300",
    cabin: "일반석 (Q)",
    baggage: "위탁 수하물 1개",
    duration: "5시간 25분",
    departure: { time: "21:40", code: "BKK", airport: "수완나품국제공항" },
    arrival: { time: "05:05", code: "ICN", airport: "인천국제공항", terminal: "터미널 2", nextDay: true },
  },
] as const;

export const FLIGHT_ROUTE_LABEL = "ICN → BKK · BKK → ICN";

export const KOREAN_AIR_LOGO_URL = "https://www.koreanair.com/header/header/images/logo/logo__koreanair.svg";
