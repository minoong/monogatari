import { getChoseong } from "es-hangul";

export interface PhraseItem {
  id: number;
  category: "기본" | "이동" | "식당" | "쇼핑" | "긴급";
  importance: "최고" | "높음" | "보통";
  ko: string;
  th: string;
  pron: string;
}

export const THAI_PHRASES: PhraseItem[] = [
  // 🥇 [가중치 최고] 필수 기본 표현 (1~6번)
  {
    id: 1,
    category: "기본",
    importance: "최고",
    ko: "안녕하세요 / 안녕 / 좋은 아침·저녁",
    th: "สวัสดี",
    pron: "사왓디 크럽 / 사왓디 카",
  },
  {
    id: 2,
    category: "기본",
    importance: "최고",
    ko: "감사합니다 / 고맙습니다",
    th: "ขอบคุณ",
    pron: "컵쿤 크럽 / 컵쿤 카",
  },
  {
    id: 3,
    category: "기본",
    importance: "최고",
    ko: "죄송합니다 / 실례합니다 / 잠시만요",
    th: "ขอโทษ",
    pron: "코톳 크럽 / 코톳 카",
  },
  {
    id: 4,
    category: "기본",
    importance: "최고",
    ko: "괜찮습니다 / 문제없어요 / 천만에요",
    th: "ไม่เป็นไร",
    pron: "마이 펜 라이",
  },
  {
    id: 5,
    category: "기본",
    importance: "최고",
    ko: "네 / 맞아요",
    th: "ใช่",
    pron: "차이 (또는 존칭어 '크럽/카'만 단독 사용)",
  },
  {
    id: 6,
    category: "기본",
    importance: "최고",
    ko: "아니요 / 아닙니다",
    th: "ไม่ใช่",
    pron: "마이 차이",
  },

  // 🥈 [가중치 높음] 이동 및 위치 찾기 (7~12번)
  {
    id: 7,
    category: "이동",
    importance: "높음",
    ko: "화장실은 어디인가요? / 화장실 어디에 있나요?",
    th: "ห้องน้ำอยู่ที่ไหน",
    pron: "헝남 유 티나이 크럽/카?",
  },
  {
    id: 8,
    category: "이동",
    importance: "높음",
    ko: "~에 있나요? / 어디에 있나요?",
    th: "อยู่ที่ไหน",
    pron: "(~위치~) 유 티나이 크럽/카?",
  },
  {
    id: 9,
    category: "이동",
    importance: "높음",
    ko: "어디로 가야 하나요? / ~로 가주세요",
    th: "ไป~",
    pron: "파이 (~장소~) 크럽/카",
  },
  {
    id: 10,
    category: "이동",
    importance: "높음",
    ko: "여기서 세워주세요 / 내려주세요",
    th: "จอดที่นี่",
    pron: "쩜 티니 크럽/카",
  },
  {
    id: 11,
    category: "이동",
    importance: "높음",
    ko: "(택시) 미터기 켜주세요",
    th: "เปิดมิเตอร์ด้วย",
    pron: "쁘엇 미터 두아이 크럽/카",
  },
  {
    id: 12,
    category: "이동",
    importance: "높음",
    ko: "얼마나 걸리나요?",
    th: "ใช้เวลานานเท่าไหร่",
    pron: "차이 웨라 난 타오라이 크럽/카?",
  },

  // 🥉 [가중치 높음] 식당 및 음료 주문 (13~21번)
  {
    id: 13,
    category: "식당",
    importance: "높음",
    ko: "고수 많이 주세요",
    th: "ใส่ผักชีเยอะๆ",
    pron: "싸이 팍치 여여 크럽/카",
  },
  {
    id: 14,
    category: "식당",
    importance: "높음",
    ko: "고수 빼주세요 / 고수 넣지 마세요",
    th: "ไม่ใส่ผักชี",
    pron: "마이 싸이 팍치 크럽/카",
  },
  {
    id: 15,
    category: "식당",
    importance: "높음",
    ko: "이거 주세요 / 이걸로 할게요",
    th: "เอาอันนี้",
    pron: "아오 안니 크럽/카",
  },
  {
    id: 16,
    category: "식당",
    importance: "높음",
    ko: "메뉴판 주세요 / 메뉴판 보여주세요",
    th: "ขอเมนู",
    pron: "코 메누 크럽/카",
  },
  {
    id: 17,
    category: "식당",
    importance: "높음",
    ko: "계산해 주세요 / 정산해 주세요",
    th: "เก็บเงินด้วย / เช็คบิล",
    pron: "껩땀 크럽/카 (또는 체크빌 크럽/카)",
  },
  {
    id: 18,
    category: "식당",
    importance: "높음",
    ko: "안 매운 것으로 해주세요 / 맵지 않게 해주세요",
    th: "ไม่เผ็ด",
    pron: "마이 펫 크럽/카",
  },
  {
    id: 19,
    category: "식당",
    importance: "높음",
    ko: "물 / 얼음 주세요",
    th: "ขอน้ำเปล่า / น้ำแข็ง",
    pron: "코 남쁠라오(물) / 코 남캥(얼음) 크럽/카",
  },
  {
    id: 20,
    category: "식당",
    importance: "높음",
    ko: "맛있어요 / 진짜 맛있네요",
    th: "อร่อยมาก",
    pron: "아로이 막 크럽/카",
  },
  {
    id: 21,
    category: "식당",
    importance: "높음",
    ko: "포장해 주세요 / 싸주세요",
    th: "ใส่ถุง",
    pron: "싸이 퉁 크럽/카",
  },

  // 🛒 쇼핑 및 가격 흥정 (22~25번)
  {
    id: 22,
    category: "쇼핑",
    importance: "보통",
    ko: "얼마예요? / 가격이 어떻게 되나요?",
    th: "เท่าไหร่",
    pron: "타오라이 크럽/카?",
  },
  {
    id: 23,
    category: "쇼핑",
    importance: "보통",
    ko: "가격 깎아주세요 / 싸게 해주세요 / 할인해 주세요",
    th: "ลดหน่อยได้ไหม",
    pron: "롯 노이 다이 마이 크럽/카?",
  },
  {
    id: 24,
    category: "쇼핑",
    importance: "보통",
    ko: "너무 비싸요",
    th: "แพงมาก",
    pron: "패앙 막 크럽/카",
  },
  {
    id: 25,
    category: "쇼핑",
    importance: "보통",
    ko: "안 사요 / 필요 없어요 / 괜찮아요",
    th: "ไม่เอา",
    pron: "마이 아오 크럽/카",
  },

  // 🆘 기타 긴급 및 소통 (26~30번)
  {
    id: 26,
    category: "긴급",
    importance: "보통",
    ko: "도와주세요! / 좀 도와주실 수 있나요?",
    th: "ช่วยด้วย",
    pron: "쭈아이 두아이 크럽/카",
  },
  {
    id: 27,
    category: "긴급",
    importance: "보통",
    ko: "영어 할 수 있나요?",
    th: "พูดภาษาอังกฤษได้ไหม",
    pron: "풋 파사 앙끄릿 다이 마이 크럽/카?",
  },
  {
    id: 28,
    category: "긴급",
    importance: "보통",
    ko: "이해하지 못했어요 / 잘 모르겠어요",
    th: "ไม่เข้าใจ",
    pron: "마이 카오짜이 크럽/카",
  },
  {
    id: 29,
    category: "긴급",
    importance: "보통",
    ko: "사진 좀 찍어주실 수 있나요?",
    th: "ถ่ายรูปให้หน่อยได้ไหม",
    pron: "타이룹 하이 노이 다이 마이 크럽/카?",
  },
  {
    id: 30,
    category: "긴급",
    importance: "보통",
    ko: "추천해 주실 수 있나요? (음식/상점 등)",
    th: "แนะนำหน่อย",
    pron: "내남 노이 크럽/카?",
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

  // 2. 태국어 원문 검사
  if (item.th.toLowerCase().includes(query.toLowerCase())) {
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
