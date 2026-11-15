import type { TripConfig } from "./types";

/**
 * 2026-12-18 ~ 12-21 일본 요나고(돗토리현) 온천과 돗토리 사구 여행.
 *
 * - 일본(JST, UTC+9)은 한국(KST)과 시차가 없다.
 * - 항공편이 확정되지 않아 단계 전환 시각은 현지 날짜 경계(첫날 00:00 ~ 마지막 날 24:00)로 둔다.
 *   항공편이 정해지면 phaseStartsAt/phaseEndsAt을 출발 시각으로 바꾼다.
 * - 숙소의 주소, 체크인 시각, 시설 정보는 아직 확인되지 않아 포함하지 않았다.
 */
export const JAPAN_YONAGO_TRIP: TripConfig = {
  id: "00000000-0000-4000-8000-000000000002",
  slug: "japan-yonago-2026-12",
  name: "일본 요나고·돗토리 여행",
  shortName: "요나고",
  countryCode: "JP",
  flag: "🇯🇵",
  startDate: "2026-12-18",
  endDate: "2026-12-21",
  timeZone: "Asia/Tokyo",
  utcOffset: "+09:00",
  phaseStartsAt: "2026-12-18T00:00:00+09:00",
  phaseEndsAt: "2026-12-22T00:00:00+09:00",
  currency: { code: "JPY", label: "엔", symbol: "¥", fractionDigits: 0, displayUnit: 100 },
  language: { code: "ja", label: "일본어", speechLang: "ja-JP" },
  weatherPlaces: [
    { id: "yonago", label: "요나고", latitude: 35.4235, longitude: 133.3352 },
    { id: "tottori-dunes", label: "돗토리 사구", latitude: 35.5416, longitude: 134.2286 },
  ],
  stays: [
    {
      id: "yonago-town-hotel",
      city: "요나고",
      name: "요나고 타운 호텔",
      englishName: "Yonago Town Hotel",
      checkInDate: "2026-12-18",
      checkOutDate: "2026-12-20",
      googleMapsUrl: "https://maps.app.goo.gl/n69ATB3wxuWz6F3o9",
      agodaUrl: "https://www.agoda.com/ko-kr/yonago-town-hotel/hotel/tottori-jp.html?adults=2&rooms=1&checkIn=2026-12-18&checkOut=2026-12-20",
    },
    {
      id: "yukibou-hakusen",
      city: "요나고",
      name: "유키보 하쿠센",
      englishName: "Yukibou Hakusen",
      checkInDate: "2026-12-20",
      checkOutDate: "2026-12-21",
      googleMapsUrl: "https://maps.app.goo.gl/3WYSC5fQJ6WApjb49",
      agodaUrl: "https://www.agoda.com/ko-kr/yukibou-hakusen/hotel/all/yonago-jp.html?adults=2&rooms=1&checkIn=2026-12-20&checkOut=2026-12-21",
    },
  ],
  dayTrips: [
    {
      date: "2026-12-19",
      title: "돗토리 사구 당일치기",
      googleMapsUrl: "https://maps.app.goo.gl/HYgDtS2SHFDPAdZf9",
      latitude: 35.5416,
      longitude: 134.2286,
    },
  ],
};
