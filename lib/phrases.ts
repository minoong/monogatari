import { getChoseong } from "es-hangul";
import { JAPANESE_PHRASES } from "./phrases-ja";
import type { TripConfig } from "./trips";

export type PhraseCategory = "기본" | "이동" | "식당" | "쇼핑" | "마사지" | "온천" | "긴급";

export interface PhraseItem {
  id: number;
  category: PhraseCategory;
  importance: "최고" | "높음" | "보통";
  ko: string;
  /** 현지어 원문(태국어, 일본어 등) */
  text: string;
  /** 한글 독음 */
  pron: string;
}

export const THAI_PHRASES: PhraseItem[] = [
  // 🥇 [가중치 최고] 필수 기본 표현 (1~6번)
  {
    id: 1,
    category: "기본",
    importance: "최고",
    ko: "안녕하세요 / 안녕 / 좋은 아침·저녁",
    text: "สวัสดี",
    pron: "사왓디 크럽 / 사왓디 카",
  },
  {
    id: 2,
    category: "기본",
    importance: "최고",
    ko: "감사합니다 / 고맙습니다",
    text: "ขอบคุณ",
    pron: "컵쿤 크럽 / 컵쿤 카",
  },
  {
    id: 3,
    category: "기본",
    importance: "최고",
    ko: "죄송합니다 / 실례합니다 / 잠시만요",
    text: "ขอโทษ",
    pron: "코톳 크럽 / 코톳 카",
  },
  {
    id: 4,
    category: "기본",
    importance: "최고",
    ko: "괜찮습니다 / 문제없어요 / 천만에요",
    text: "ไม่เป็นไร",
    pron: "마이 펜 라이",
  },
  {
    id: 5,
    category: "기본",
    importance: "최고",
    ko: "네 / 맞아요",
    text: "ใช่",
    pron: "차이 (또는 존칭어 '크럽/카'만 단독 사용)",
  },
  {
    id: 6,
    category: "기본",
    importance: "최고",
    ko: "아니요 / 아닙니다",
    text: "ไม่ใช่",
    pron: "마이 차이",
  },

  // 🥈 [가중치 높음] 이동 및 위치 찾기 (7~12번)
  {
    id: 7,
    category: "이동",
    importance: "높음",
    ko: "화장실은 어디인가요? / 화장실 어디에 있나요?",
    text: "ห้องน้ำอยู่ที่ไหน",
    pron: "헝남 유 티나이 크럽/카?",
  },
  {
    id: 8,
    category: "이동",
    importance: "높음",
    ko: "~에 있나요? / 어디에 있나요?",
    text: "อยู่ที่ไหน",
    pron: "(~위치~) 유 티나이 크럽/카?",
  },
  {
    id: 9,
    category: "이동",
    importance: "높음",
    ko: "어디로 가야 하나요? / ~로 가주세요",
    text: "ไป~",
    pron: "파이 (~장소~) 크럽/카",
  },
  {
    id: 10,
    category: "이동",
    importance: "높음",
    ko: "여기서 세워주세요 / 내려주세요",
    text: "จอดที่นี่",
    pron: "쩟 티니 크럽/카",
  },
  {
    id: 11,
    category: "이동",
    importance: "높음",
    ko: "(택시) 미터기 켜주세요",
    text: "เปิดมิเตอร์ด้วย",
    pron: "쁘엇 미터 두아이 크럽/카",
  },
  {
    id: 12,
    category: "이동",
    importance: "높음",
    ko: "얼마나 걸리나요?",
    text: "ใช้เวลานานเท่าไหร่",
    pron: "차이 웨라 난 타오라이 크럽/카?",
  },

  // 🥉 [가중치 높음] 식당 및 음료 주문 (13~21번)
  {
    id: 13,
    category: "식당",
    importance: "높음",
    ko: "고수 많이 주세요",
    text: "ใส่ผักชีเยอะๆ",
    pron: "싸이 팍치 여여 크럽/카",
  },
  {
    id: 14,
    category: "식당",
    importance: "높음",
    ko: "고수 빼주세요 / 고수 넣지 마세요",
    text: "ไม่ใส่ผักชี",
    pron: "마이 싸이 팍치 크럽/카",
  },
  {
    id: 15,
    category: "식당",
    importance: "높음",
    ko: "이거 주세요 / 이걸로 할게요",
    text: "เอาอันนี้",
    pron: "아오 안니 크럽/카",
  },
  {
    id: 16,
    category: "식당",
    importance: "높음",
    ko: "메뉴판 주세요 / 메뉴판 보여주세요",
    text: "ขอเมนู",
    pron: "코 메누 크럽/카",
  },
  {
    id: 17,
    category: "식당",
    importance: "높음",
    ko: "계산해 주세요 / 정산해 주세요",
    text: "เก็บเงินด้วย / เช็คบิล",
    pron: "껩땀 크럽/카 (또는 체크빌 크럽/카)",
  },
  {
    id: 18,
    category: "식당",
    importance: "높음",
    ko: "안 매운 것으로 해주세요 / 맵지 않게 해주세요",
    text: "ไม่เผ็ด",
    pron: "마이 펫 크럽/카",
  },
  {
    id: 19,
    category: "식당",
    importance: "높음",
    ko: "물 / 얼음 주세요",
    text: "ขอน้ำเปล่า / น้ำแข็ง",
    pron: "코 남쁠라오(물) / 코 남캥(얼음) 크럽/카",
  },
  {
    id: 20,
    category: "식당",
    importance: "높음",
    ko: "맛있어요 / 진짜 맛있네요",
    text: "อร่อยมาก",
    pron: "아로이 막 크럽/카",
  },
  {
    id: 21,
    category: "식당",
    importance: "높음",
    ko: "포장해 주세요 / 싸주세요",
    text: "ใส่ถุง",
    pron: "싸이 퉁 크럽/카",
  },

  // 🛒 쇼핑 및 가격 흥정 (22~25번)
  {
    id: 22,
    category: "쇼핑",
    importance: "보통",
    ko: "얼마예요? / 가격이 어떻게 되나요?",
    text: "เท่าไหร่",
    pron: "타오라이 크럽/카?",
  },
  {
    id: 23,
    category: "쇼핑",
    importance: "보통",
    ko: "가격 깎아주세요 / 싸게 해주세요 / 할인해 주세요",
    text: "ลดหน่อยได้ไหม",
    pron: "롯 노이 다이 마이 크럽/카?",
  },
  {
    id: 24,
    category: "쇼핑",
    importance: "보통",
    ko: "너무 비싸요",
    text: "แพงมาก",
    pron: "패앙 막 크럽/카",
  },
  {
    id: 25,
    category: "쇼핑",
    importance: "보통",
    ko: "안 사요 / 필요 없어요 / 괜찮아요",
    text: "ไม่เอา",
    pron: "마이 아오 크럽/카",
  },

  // 🆘 기타 긴급 및 소통 (26~30번)
  {
    id: 26,
    category: "긴급",
    importance: "보통",
    ko: "도와주세요! / 좀 도와주실 수 있나요?",
    text: "ช่วยด้วย",
    pron: "쭈아이 두아이 크럽/카",
  },
  {
    id: 27,
    category: "긴급",
    importance: "보통",
    ko: "영어 할 수 있나요?",
    text: "พูดภาษาอังกฤษได้ไหม",
    pron: "풋 파사 앙끄릿 다이 마이 크럽/카?",
  },
  {
    id: 28,
    category: "긴급",
    importance: "보통",
    ko: "이해하지 못했어요 / 잘 모르겠어요",
    text: "ไม่เข้าใจ",
    pron: "마이 카오짜이 크럽/카",
  },
  {
    id: 29,
    category: "긴급",
    importance: "보통",
    ko: "사진 좀 찍어주실 수 있나요?",
    text: "ถ่ายรูปให้หน่อยได้ไหม",
    pron: "타이룹 하이 노이 다이 마이 크럽/카?",
  },
  {
    id: 30,
    category: "식당",
    importance: "보통",
    ko: "추천해 주세요 / 추천해줘",
    text: "แนะนำหน่อย",
    pron: "내남 노이 크럽/카?",
  },
  {
    id: 31,
    category: "식당",
    importance: "보통",
    ko: "얼음 주세요",
    text: "น้ำแข็ง",
    pron: "남깽 크럽/카",
  },
  {
    id: 32,
    category: "식당",
    importance: "보통",
    ko: "콜라 제로 주세요",
    text: "โค้กซีโร่",
    pron: "콕 씨 로 크럽/카",
  },
  {
    id: 33,
    category: "식당",
    importance: "높음",
    ko: "배고파요!",
    text: "หิวมาก",
    pron: "히우 막",
  },
  {
    id: 34,
    category: "식당",
    importance: "보통",
    ko: "배불러요!",
    text: "อิ่มจัง",
    pron: "임 짱",
  },
  {
    id: 35,
    category: "이동",
    importance: "높음",
    ko: "빨리 가 주세요",
    text: "เร็วๆ",
    pron: "래우 래우 크럽/카",
  },
  {
    id: 36,
    category: "이동",
    importance: "보통",
    ko: "천천히 가 주세요",
    text: "ช้าๆ",
    pron: "차 차 크럽/카",
  },
  {
    id: 37,
    category: "이동",
    importance: "높음",
    ko: "계속 가 주세요 / 직진해 주세요",
    text: "ตรงไป",
    pron: "뜨롱 빠이 크럽/카",
  },
  {
    id: 38,
    category: "마사지",
    importance: "높음",
    ko: "아파요",
    text: "เจ็บ",
    pron: "쩹",
  },
  {
    id: 39,
    category: "마사지",
    importance: "보통",
    ko: "세게 해주세요",
    text: "หนักๆ",
    pron: "낙 낙 크럽/카",
  },
  {
    id: 40,
    category: "마사지",
    importance: "보통",
    ko: "약하게 해주세요",
    text: "เบาๆ",
    pron: "바오 바오 크럽/카",
  },
  {
    id: 41,
    category: "마사지",
    importance: "보통",
    ko: "좋아요 / 편안해요",
    text: "สบาย",
    pron: "사바이",
  },
  {
    id: 42,
    category: "마사지",
    importance: "보통",
    ko: "간지러워요",
    text: "จั๊กกะจี้",
    pron: "짝까찌",
  },
  {
    id: 43,
    category: "기본",
    importance: "보통",
    ko: "추워요",
    text: "หนาว",
    pron: "나오",
  },
  {
    id: 44,
    category: "기본",
    importance: "보통",
    ko: "더워요",
    text: "ร้อน",
    pron: "론",
  },
  {
    id: 45,
    category: "쇼핑",
    importance: "높음",
    ko: "돈 없어요.",
    text: "ไม่มีเงิน",
    pron: "마이 미 응언",
  },
  {
    id: 46,
    category: "쇼핑",
    importance: "높음",
    ko: "돈이 부족해요.",
    text: "เงินไม่พอ",
    pron: "응언 마이 포",
  },
  {
    id: 47,
    category: "쇼핑",
    importance: "높음",
    ko: "가격 깍아주세요.",
    text: "ลดราคาให้หน่อยได้ไหม",
    pron: "롯 라카 하이 너이 다이 마이 크럽/카?",
  },
];

/**
 * 한글 초성 검색 및 띄어쓰기 무시 검색 매칭 헬퍼
 */
export function matchKoreanSearch(item: PhraseItem, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;

  // 공백 제거 버전
  const cleanQuery = query.replace(/\s+/g, "").toLowerCase();
  const cleanKo = item.ko.replace(/\s+/g, "").toLowerCase();
  const cleanPron = item.pron.replace(/\s+/g, "").toLowerCase();

  // 1. 공백 제거 후 텍스트 부분 일치 검사 (한국어, 발음)
  if (cleanKo.includes(cleanQuery) || cleanPron.includes(cleanQuery)) {
    return true;
  }

  // 2. 현지어 원문 검사
  if (item.text.toLowerCase().includes(query.toLowerCase())) {
    return true;
  }

  // 3. es-hangul getChoseong 초성 검색 검사
  try {
    const koChoseong = getChoseong(cleanKo, { keepNonHangul: true }).toLowerCase();
    const pronChoseong = getChoseong(cleanPron, { keepNonHangul: true }).toLowerCase();
    if (koChoseong.includes(cleanQuery) || pronChoseong.includes(cleanQuery)) {
      return true;
    }
  } catch {
    // 초성 추출 에러 시 무시
  }

  return false;
}

const PHRASE_CATEGORIES: Record<TripConfig["language"]["code"], readonly ("전체" | PhraseCategory)[]> = {
  th: ["전체", "기본", "이동", "식당", "쇼핑", "마사지", "긴급"],
  ja: ["전체", "기본", "이동", "식당", "쇼핑", "온천", "긴급"],
};

/** 여행지 언어의 회화 목록. */
export const getPhrases = (trip: Pick<TripConfig, "language">): PhraseItem[] =>
  trip.language.code === "ja" ? JAPANESE_PHRASES : THAI_PHRASES;

/** 회화 화면의 카테고리 필터. 여행지 언어마다 구성이 다르다(마사지 / 온천). */
export const getPhraseCategories = (trip: Pick<TripConfig, "language">) => PHRASE_CATEGORIES[trip.language.code];
