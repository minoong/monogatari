export interface Accommodation {
  id: "bangkok" | "pattaya" | "koh-sichang";
  city: string;
  date: string;
  dateLabel: string;
  name: string;
  englishName: string;
  address: string;
  checkIn: string;
  checkOut: string;
  imageUrl: string;
  mapQuery: string;
  agodaUrl: string;
  score: string;
  highlights: string[];
  amenities: string[];
}

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "bangkok",
    city: "방콕",
    date: "8/29",
    dateLabel: "8월 29일 · 1박",
    name: "셰이드 하우스 방콕 올드타운",
    englishName: "Shade House Bangkok Oldtown",
    address: "195 Samsen 1 Alley, Wat Sam Phraya, Phra Nakhon, Bangkok 10200",
    checkIn: "14:00",
    checkOut: "11:00",
    imageUrl: "https://pix8.agoda.net/hotelImages/64336206/0/6400f6e0887f133e75ef63196f41c0c2.jpg?ce=2&s=1024x768",
    mapQuery: "Shade House Bangkok Oldtown",
    agodaUrl: "https://www.agoda.com/ko-kr/shade-house-bangkok-oldtown/hotel/bangkok-th.html?adults=2&rooms=1&checkIn=2026-08-29&checkOut=2026-08-30",
    score: "9.2",
    highlights: ["카오산 로드 650m", "2025년 신축", "올드타운 산책"],
    amenities: ["무료 Wi‑Fi", "익스프레스 체크인", "짐 보관", "에어컨"],
  },
  {
    id: "pattaya",
    city: "팟타야",
    date: "8/30",
    dateLabel: "8월 30일 · 1박",
    name: "더 그라스 서비스드 스위트 바이 앳 마인드",
    englishName: "The Grass Serviced Suites by At Mind",
    address: "599/10 Pattaya Tai Road, South Pattaya, Pattaya 20150",
    checkIn: "14:00",
    checkOut: "12:00",
    imageUrl: "https://pix8.agoda.net/hotelImages/1622455/-1/0aa45e1afb355375de608953c5690591.jpg?ca=15&ce=1&s=1024x768",
    mapQuery: "The Grass Serviced Suites by At Mind Pattaya",
    agodaUrl: "https://www.agoda.com/ko-kr/the-grass-serviced-suites-by-at-mind/hotel/pattaya-th.html?adults=2&rooms=1&checkIn=2026-08-30&checkOut=2026-08-31",
    score: "8.8",
    highlights: ["루프탑 수영장", "파타야 비치 1.9km", "스위트·간이 주방"],
    amenities: ["무료 Wi‑Fi", "야외 수영장", "피트니스", "사우나", "무료 주차"],
  },
  {
    id: "koh-sichang",
    city: "코시창",
    date: "8/31",
    dateLabel: "8월 31일 · 1박",
    name: "섬웨어 코 시창",
    englishName: "Somewhere Koh Sichang",
    address: "194, 194/1 Tha Thewawong, Koh Si Chang, Chonburi 20120",
    checkIn: "14:00",
    checkOut: "12:00",
    imageUrl: "https://pix8.agoda.net/hotelImages/1157835/-1/0e77488a5d3361f5d13049edd6ca0d70.jpg?ce=0&s=1024x768",
    mapQuery: "Somewhere Koh Sichang",
    agodaUrl: "https://www.agoda.com/ko-kr/somewhere-koh-sichang/hotel/chonburi-th.html?adults=2&rooms=1&checkIn=2026-08-31&checkOut=2026-09-01",
    score: "9.2",
    highlights: ["코시창 선착장 600m", "바다 전망 수영장", "섬 휴양"],
    amenities: ["무료 Wi‑Fi", "야외 수영장", "레스토랑", "무료 조식", "무료 주차"],
  },
];
