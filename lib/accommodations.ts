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
  facilityGroups: Array<{
    title: string;
    items: string[];
  }>;
  dining: {
    primary: string;
    details: string[];
  };
  importantInfo?: {
    breakfast: {
      title: string;
      details: string;
    };
    shuttle: {
      title: string;
      details: string;
    };
  };
  notice?: string;
}

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "bangkok",
    city: "방콕",
    date: "8/29",
    dateLabel: "8월 29일 · 1박",
    name: "방콕 리버 로카 호텔",
    englishName: "Bangkok River Loka Hotel",
    address: "2250/93-94 Charoenkrung Road, Charoenkrung Soi 76/1, Bang Kho Laem, Bangkok 10120",
    checkIn: "14:00",
    checkOut: "12:00",
    imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/128367042.jpg?k=e16b88fee90fd0d0e5cee2d22f64f389032f7caa6375766c9f95a7ab328e1f31&o=",
    mapQuery: "Bangkok River Loka Hotel, 2250/93-94 Charoenkrung Road, Charoenkrung Soi 76/1, Bang Kho Laem, Bangkok 10120",
    agodaUrl: "https://www.agoda.com/ko-kr/bangkok-river-loka_2/hotel/bangkok-th.html?adults=2&rooms=1&checkIn=2026-08-29&checkOut=2026-08-30",
    score: "8.3",
    highlights: ["아시아티크 리버프론트 440m", "2024년 신축", "차오프라야 강변"],
    facilityGroups: [
      { title: "숙소 편의 시설/서비스", items: ["무료 Wi-Fi", "24시간 프런트 데스크", "셔틀 서비스", "여행 가방 보관 서비스", "발코니/테라스", "여행 안내소", "세탁", "금연 객실"] },
      { title: "사용 가능한 언어", items: ["영어", "태국어"] },
      { title: "인터넷", items: ["Wi-Fi (공용 구역)", "무료 Wi-Fi (모든 객실)", "인터넷", "인터넷 서비스"] },
      { title: "액티비티 및 레저 활동", items: ["여행 안내소", "티켓 서비스"] },
      { title: "청결 및 안전", items: ["객실 소독 제외 가능", "리넨 및 세탁물 온수 세탁", "매일 소독", "모든 객실 매일 소독", "소독 후 객실 봉인", "손 소독제", "안티 바이러스 청소 용품", "직원 대상 안전 규정 교육", "투숙 간 객실 소독"] },
      { title: "식음료 시설/서비스", items: ["생수(병)"] },
      { title: "서비스 및 편의 시설", items: ["공용 구역 내 냉방", "금연 숙소", "도어맨", "비대면 체크인/체크아웃", "비즈니스 센터 내 복사기/팩스", "엘리베이터", "여행 가방 보관 서비스", "음식 배달", "일일 청소 서비스", "테라스", "편의점"] },
      { title: "출입/접근 서비스", items: ["24시간 경비 서비스", "24시간 상시 체크인", "24시간 프런트 데스크", "객실 장식", "거울룸", "공용 구역 내 CCTV", "금연 객실", "방음 객실", "소화기 (Fire extinguisher)", "숙소 외부 CCTV", "연기 감지기", "익스프레스 체크인/체크아웃", "테마룸"] },
      { title: "이동 편의 시설/서비스", items: ["셔틀 서비스"] },
      { title: "모든 객실에서 이용 가능", items: ["Wi-Fi (무료)", "거울", "금연", "냉장고", "리넨", "마룻바닥", "목욕 가운", "무료 생수", "무료 인스턴트 커피", "무료 차", "무선인터넷", "미니바", "샤워 부스", "샤워실", "세면도구", "소파", "슬리퍼", "식사 공간", "식탁", "암막 커튼", "에어컨", "옷 거는 행거", "옷장", "위성 방송/케이블 방송", "유선인터넷(무료)", "유선인터넷(유료)", "전기 주전자", "전화기", "주전자", "창문", "책상", "커피/티 메이커", "타월", "프라이빗 욕실", "헤어드라이어", "휴식 공간", "휴지통"] },
    ],
    dining: {
      primary: "무료 생수 · 커피/티 메이커",
      details: ["매일 하우스키핑", "객실·공용 구역 무료 Wi‑Fi"],
    },
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
    facilityGroups: [
      { title: "숙소 편의 시설/서비스", items: ["무료 Wi-Fi", "전망이 있는 수영장", "무료 주차", "24시간 프런트 데스크", "피트니스 센터", "레스토랑", "마사지", "공항 이동 교통편 서비스"] },
      { title: "사용 가능한 언어", items: ["영어", "태국어"] },
      { title: "장애인 접근 편의 관련", items: ["전자 객실 키", "휠체어 접근 가능"] },
      { title: "인터넷", items: ["Wi-Fi (공용 구역)", "무료 Wi-Fi (모든 객실)", "인터넷", "인터넷 서비스"] },
      { title: "액티비티 및 레저 활동", items: ["마사지", "사우나", "수영장", "수영장 시설", "스팀룸/한증실", "스파/사우나", "실외 수영장", "전망이 있는 수영장", "전용탕", "정원", "체육관/피트니스", "컴퓨터 사용 가능 구역", "피트니스 센터"] },
      { title: "청결 및 안전", items: ["개별 포장된 음식", "객실 소독 제외 가능", "공용 구역의 안전 보호막", "공용 문구류 비치 제외", "구급상자", "리넨 및 세탁물 온수 세탁", "마스크 무료 제공", "매일 소독", "모든 객실 매일 소독", "무현금 결제 서비스", "손 소독제", "신체적 거리 두기 (최소 1m)", "안전한 식사 환경 조성", "안티 바이러스 청소 용품", "위생 인증", "주방 및 식기류 소독", "직원 대상 안전 규정 교육", "직원의 안면 보호 장구 착용", "체온계", "투숙 간 객실 소독", "투숙객 및 직원 대상 체온 측정", "호텔 룸서비스용 앱"] },
      { title: "식음료 시설/서비스", items: ["단품 요리 레스토랑", "디저트 카페", "레스토랑", "룸서비스", "미국식 조식", "샐러드 레스토랑", "생수(병)", "스프 레스토랑", "아시아식 조식", "조식 레스토랑", "조식 뷔페", "조식 서비스", "주방", "카페", "커피숍"] },
      { title: "서비스 및 편의 시설", items: ["공용 구역 내 냉방", "공용 라운지/TV 시청 구역", "금연 숙소", "다림질 서비스", "단장/미용 서비스", "드라이클리닝", "미용실", "상점", "세탁 서비스", "안전 금고", "엘리베이터", "여행 가방 보관 서비스", "음식 배달", "일일 청소 서비스", "장애인용 편의 시설/서비스", "테라스", "편의점", "현금 인출기", "회의/연회 시설", "흡연 구역"] },
      { title: "아동용 시설/서비스", items: ["가족/아동 여행객 친화형 시설", "아동용 수영장"] },
      { title: "출입/접근 서비스", items: ["24시간 경비 서비스", "24시간 상시 체크인", "24시간 프런트 데스크", "공용 구역 내 CCTV", "금연 객실", "성인 전용 숙소", "소화기 (Fire extinguisher)", "숙소 외부 CCTV", "안전/보안 시설/서비스", "연기 감지기", "외부 복도"] },
      { title: "이동 편의 시설/서비스", items: ["공항 이동 교통편 서비스", "숙소 근처 주차장", "숙소 내 주차장", "주차장(무료)", "택시 서비스"] },
      { title: "모든 객실에서 이용 가능", items: ["Wi-Fi (무료)", "간이주방", "개별 에어컨", "객실 내 안전 금고", "거울", "고층", "금연", "난로", "냉장고", "리넨", "모닝콜 서비스", "무료 생수", "무료 인스턴트 커피", "무료 차", "무선인터넷", "미니바", "발코니/테라스", "샤워실", "세면도구", "소파", "소화기", "슬리퍼", "식기세척기", "식사 공간", "식탁", "안전/보안 시설/서비스", "알람시계", "암막 커튼", "에어컨", "엘리베이터 이용 가능", "열리는 창문", "옷 거는 행거", "옷장", "외부 복도", "위성 방송/케이블 방송", "저층 객실 이용 가능", "전기 주전자", "전자레인지", "전화기", "주전자", "지체/이동 장애인 친화형 편의", "창문", "책상", "청소용품", "커피/티 메이커", "타월", "프라이빗 욕실", "헤어드라이어", "화재감지기", "휴식 공간", "휴지통", "흡연 가능"] },
    ],
    dining: {
      primary: "호텔 레스토랑",
      details: ["조식 뷔페", "룸서비스 이용 가능"],
    },
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
    facilityGroups: [
      { title: "사용 가능한 언어", items: ["영어", "태국어"] },
      { title: "야외", items: ["자전거"] },
      { title: "인터넷", items: ["Wi‑Fi (공용 구역)", "무료 Wi‑Fi (모든 객실)", "인터넷", "인터넷 서비스"] },
      { title: "액티비티 및 레저 활동", items: ["등산로", "수영장", "스노클링", "실외 수영장", "여행 안내소", "전망이 있는 수영장", "정원", "티켓 서비스"] },
      { title: "청결 및 안전", items: ["구급상자", "매일 소독", "모든 객실 매일 소독", "살균/소독 장비", "손 소독제", "위생 인증", "직원 대상 안전 규정 교육"] },
      { title: "식음료 시설/서비스", items: ["단품 요리 레스토랑", "레스토랑", "룸서비스", "바", "생수(병)", "유럽식 조식", "조식 뷔페", "주류", "커피숍"] },
      { title: "서비스 및 편의 시설", items: ["공용 구역 내 냉방", "공용 라운지/TV 시청 구역", "금연 숙소", "다림질 서비스", "복사기/팩스", "안전 금고", "일일 청소", "컨시어지", "테라스", "회의/연회 시설", "흡연 구역"] },
      { title: "출입/접근 서비스", items: ["24시간 경비", "24시간 상시 체크인", "24시간 프런트", "공용 구역 CCTV", "금연 객실", "소화기", "숙소 외부 CCTV", "연기 감지기"] },
      { title: "이동 편의 시설/서비스", items: ["공항 셔틀", "셔틀 서비스", "무료 주차", "택시 서비스"] },
      { title: "이용 안내", items: ["엘리베이터 없음", "반려동물 불가"] },
      { title: "객실 편의시설", items: ["DVD/CD 플레이어", "Wi‑Fi (무료)", "객실 내 안전 금고", "거울", "금연", "냉장고", "스트리밍 서비스", "리넨", "모닝콜 서비스", "무료 생수", "무료 인스턴트 커피", "무료 차", "무선인터넷", "발코니/테라스", "샤워실", "세면도구", "소파", "소화기", "수영장 시설", "숙면용 편의 용품", "슬리퍼", "알람시계", "암막 커튼", "야외용 가구", "에어컨", "열리는 창문", "옷 거는 행거", "옷장", "욕조 및 샤워실", "위성 방송/케이블 방송", "유선인터넷(무료)", "유아용 침대(요청 시)", "일일 청소 서비스", "전기 주전자", "전용 수영장", "전화기", "접이식 침대", "주전자", "창문", "책상", "침대 옆 콘센트", "타월", "프라이빗 욕실", "헤어드라이어", "화재감지기", "휴식 공간", "휴지통"] },
    ],
    dining: {
      primary: "The Verandah Restaurant",
      details: ["유럽식 조식", "인터내셔널 · 태국식", "뷔페 · 알라카르트"],
    },
    importantInfo: {
      breakfast: {
        title: "The Verandah Restaurant",
        details: "유럽식 조식 · 조식 뷔페 이용 가능",
      },
      shuttle: {
        title: "공항 셔틀 · 셔틀 서비스",
        details: "요청 시 제공되며 추가 요금이 부과될 수 있어요.",
      },
    },
  },
];

const TRIP_YEAR = 2026;
const BANGKOK_TIME_ZONE = "Asia/Bangkok";

const parseStayMdDate = (date: string) => {
  const [month, day] = date.split("/").map(Number);
  return new Date(TRIP_YEAR, month - 1, day);
};

const toBangkokIsoDateTime = (month: number, day: number, hour: number, minute: number) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return new Date(`${TRIP_YEAR}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+07:00`);
};

/** Bangkok 현지 시각으로 숙소 체크인/체크아웃 시점을 만든다. */
export function parseStayDateTime(date: string, time: string) {
  const [month, day] = date.split("/").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return toBangkokIsoDateTime(month, day, hour, minute);
}

export function getStayCheckInAt(stay: Accommodation) {
  return parseStayDateTime(stay.date, stay.checkIn);
}

export function getStayCheckOutAt(stay: Accommodation) {
  return parseStayDateTime(getStayCheckoutDate(stay.date), stay.checkOut);
}

export function getActiveTripDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value ?? "2026";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function getActiveAccommodationId(now = new Date()): Accommodation["id"] | null {
  for (let index = 0; index < ACCOMMODATIONS.length; index += 1) {
    const stay = ACCOMMODATIONS[index];
    const checkInAt = getStayCheckInAt(stay);
    const checkOutAt = getStayCheckOutAt(stay);

    if (now >= checkInAt && now < checkOutAt) {
      return stay.id;
    }
  }

  const firstStay = ACCOMMODATIONS[0];
  if (now < getStayCheckInAt(firstStay)) {
    return firstStay.id;
  }

  for (let index = 0; index < ACCOMMODATIONS.length - 1; index += 1) {
    const currentStay = ACCOMMODATIONS[index];
    const nextStay = ACCOMMODATIONS[index + 1];
    const checkOutAt = getStayCheckOutAt(currentStay);
    const nextCheckInAt = getStayCheckInAt(nextStay);

    if (now >= checkOutAt && now < nextCheckInAt) {
      return nextStay.id;
    }
  }

  const lastStay = ACCOMMODATIONS[ACCOMMODATIONS.length - 1];
  if (now >= getStayCheckOutAt(lastStay)) {
    return null;
  }

  return null;
}

export const formatStayDateWithWeekday = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseStayMdDate(date));

export const formatStayCheckDateTime = (date: string, time: string) =>
  `${formatStayDateWithWeekday(date)} · ${time}`;

export const getStayCheckoutDate = (checkInDate: string) => {
  const checkout = parseStayMdDate(checkInDate);
  checkout.setDate(checkout.getDate() + 1);
  return `${checkout.getMonth() + 1}/${checkout.getDate()}`;
};

const TICKER_START_TIME = "23:00";
const DURING_TRIP_STAY_TICKER_STORAGE_KEY = "during-trip-stay-ticker-dismissed";

export interface DuringTripStayTickerInfo {
  tripDate: string;
  currentStay: Accommodation;
  checkoutTime: string;
  nextStay: Accommodation | null;
  nextCheckInTime: string | null;
}

const getStayTickerStartAt = (stay: Accommodation) => {
  const checkoutDateMd = getStayCheckoutDate(stay.date);
  const previousDay = parseStayMdDate(checkoutDateMd);
  previousDay.setDate(previousDay.getDate() - 1);
  const previousDayMd = `${previousDay.getMonth() + 1}/${previousDay.getDate()}`;
  return parseStayDateTime(previousDayMd, TICKER_START_TIME);
};

const getCheckoutTripDate = (stay: Accommodation) => {
  const [month, day] = getStayCheckoutDate(stay.date).split("/").map(Number);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${TRIP_YEAR}-${pad(month)}-${pad(day)}`;
};

/** Bangkok 기준 체크아웃 전날 23:00 ~ 체크아웃 시각 사이에만 숙소 전환 안내를 반환한다. */
export function getDuringTripStayTickerInfo(now = new Date()): DuringTripStayTickerInfo | null {
  for (let index = 0; index < ACCOMMODATIONS.length; index += 1) {
    const stay = ACCOMMODATIONS[index];
    const startAt = getStayTickerStartAt(stay);
    const checkOutAt = getStayCheckOutAt(stay);

    if (now < startAt || now >= checkOutAt) continue;

    const nextStay = ACCOMMODATIONS[index + 1] ?? null;
    return {
      tripDate: getCheckoutTripDate(stay),
      currentStay: stay,
      checkoutTime: stay.checkOut,
      nextStay,
      nextCheckInTime: nextStay?.checkIn ?? null,
    };
  }

  return null;
}

const readDismissedDates = (): Record<string, boolean> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(DURING_TRIP_STAY_TICKER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

export function isDuringTripStayTickerDismissed(tripDate: string) {
  return readDismissedDates()[tripDate] === true;
}

export function dismissDuringTripStayTicker(tripDate: string) {
  if (typeof window === "undefined") return;

  try {
    const next = { ...readDismissedDates(), [tripDate]: true };
    window.localStorage.setItem(DURING_TRIP_STAY_TICKER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage 에러 무시
  }
}
