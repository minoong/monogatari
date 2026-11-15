import type { TripConfig } from "./types";

/**
 * 2026-12-18 ~ 12-21 일본 요나고(돗토리현) 온천과 돗토리 사구 여행.
 *
 * - 일본(JST, UTC+9)은 한국(KST)과 시차가 없다.
 * - 항공사는 에어서울이고 좌석은 당일 선택한다. 항공권 번호는 아직 모른다. 가현쨩과 같은 항공편이다.
 * - 여행 단계는 가는 편 출발(인천 12/18 13:20)부터 오는 편 출발(요나고 12/21 15:50)까지를 during으로 본다.
 *   두 공항 모두 UTC+9라 시각 계산에 시차 보정이 필요 없다.
 * - 숙소 정보는 2026-11-15 아고다 상세 페이지에서 확인한 값이다. 객실 타입, 식사 포함 여부 등은
 *   예약 내역과 다를 수 있어 포함하지 않았다. 한글 숙소명은 직접 옮긴 표기다.
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
  phaseStartsAt: "2026-12-18T13:20:00+09:00",
  phaseEndsAt: "2026-12-21T15:50:00+09:00",
  copy: { homeTitle: "온천과 사구를 만끽하라!", dictionaryTitle: "일본어 사전... 당황하지 말라고!" },
  // 온천 테마: 김이 오르는 따뜻한 복숭아·살구빛에 온천수의 옅은 청록을 섞는다.
  theme: {
    id: "onsen",
    accent: "#e07a5f",
    tint: "#fff7f0",
    backdrop: {
      kind: "steam",
      gradient: "radial-gradient(120% 80% at 50% 0%, #ffd9c0 0%, #fbe3d6 38%, rgba(155,220,210,0.35) 70%, rgba(255,255,255,0) 100%)",
      puffColors: ["#ffc9a8", "#ffe3d2", "#a6e0d6"],
    },
  },
  currency: { code: "JPY", displayUnit: 100 },
  language: { code: "ja", label: "일본어", speechLang: "ja-JP", genderedPoliteness: false },
  expenseCategories: ["food", "transport", "shopping", "stay", "activity", "onsen", "convenience", "other"],
  paymentMethods: ["cash", "card", "qr", "ic_card", "other"],
  weatherPlaces: [
    { id: "yonago", label: "요나고", latitude: 35.4235, longitude: 133.3352 },
    { id: "tottori-dunes", label: "돗토리 사구", latitude: 35.5416, longitude: 134.2286 },
  ],
  flights: [
    {
      id: "outbound",
      flightNumber: "RS471",
      date: "2026-12-18",
      departure: { code: "ICN", city: "인천", airport: "서울 인천", utcOffset: "+09:00", time: "13:20" },
      arrival: { code: "YGJ", city: "요나고", airport: "돗토리 요나고", utcOffset: "+09:00", time: "14:50" },
      detail: "에어서울",
      seatStatus: "좌석은 당일 선택",
    },
    {
      id: "return",
      flightNumber: "RS472",
      date: "2026-12-21",
      departure: { code: "YGJ", city: "요나고", airport: "돗토리 요나고", utcOffset: "+09:00", time: "15:50" },
      arrival: { code: "ICN", city: "인천", airport: "서울 인천", utcOffset: "+09:00", time: "17:40" },
      detail: "에어서울",
      seatStatus: "좌석은 당일 선택",
    },
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
      weatherPlaceId: "yonago",
      agodaUrl: "https://www.agoda.com/ko-kr/yonago-town-hotel/hotel/tottori-jp.html?adults=2&rooms=1&checkIn=2026-12-18&checkOut=2026-12-20",
      address: "255 Meijicho, Yonago, Tottori 683-0053",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      score: 7.7,
      reviewCount: 129,
      imageUrl: "https://pix8.agoda.net/property/5556813/0/b6f61dbd1c2b72a0ac52df2f359e9655.jpg?ca=0&ce=1&s=1024x768",
      highlights: ["요나고역 바로 앞", "무료 Wi-Fi", "24시간 프런트 데스크", "체크인 22:00까지"],
    },
    {
      id: "kaike-hakusen",
      city: "카이케 온천",
      name: "카이케 하쿠센",
      englishName: "Kaike Hakusen",
      checkInDate: "2026-12-20",
      checkOutDate: "2026-12-21",
      googleMapsUrl: "https://maps.app.goo.gl/3WYSC5fQJ6WApjb49",
      weatherPlaceId: "yonago",
      agodaUrl: "https://www.agoda.com/ko-kr/yukibou-hakusen/hotel/all/yonago-jp.html?adults=2&rooms=1&checkIn=2026-12-20&checkOut=2026-12-21",
      address: "皆生温泉3-12-33, Kaike Onsen, Yonago, Tottori 683-0001",
      checkInTime: "15:00",
      checkOutTime: "10:00",
      score: 8.9,
      reviewCount: 90,
      imageUrl: "https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/761596819.jpg?k=774ac3842d7454cf61b75ab8f0f59d65d540da3f7ad32d29e8863d74d9338802&o=",
      highlights: ["온천", "무료 주차", "무료 Wi-Fi", "24시간 프런트 데스크", "체크인 22:00까지"],
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
