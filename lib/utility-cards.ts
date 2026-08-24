export const UTILITY_CARDS = [
  {
    activity: "ExpenseActivity" as const,
    title: "가현짱, 렌탈 영수증 발행!",
    description: "오마에!! 렌탈 비용은 영수증으로 발행!! 평점은 🌟🌟🌟🌟🌟 주지 않으면 업계에 지장이 생긴다구요!!!",
    meta: "지출 · 통계 · 자동 정산",
    imageSrc: "/card-utils-rental.jpg",
    baseDelay: 0.08,
  },
  {
    activity: "ExchangeActivity" as const,
    title: "실수하지 마! 환율 계산기",
    description: "태국 바트 바가지 쓰지 않도록 원화랑 달러로 똑바로 확인해!",
    meta: "바가지 방지",
    imageSrc: "/card-exchange-ruka.jpg",
    baseDelay: 0.28,
  },
  {
    activity: "DictionaryActivity" as const,
    title: "당황 금지! 현지 태국어 사전",
    description: "말 안 통한다고 버벅이지 말고, 발음 듣거나 현지인한테 크게 보여줘!",
    meta: "버벅임 방지 · 검색 · 발음",
    imageSrc: "/card-dictionary-echidna.png",
    baseDelay: 0.48,
  },
] as const;

export type UtilityActivity = (typeof UTILITY_CARDS)[number]["activity"];
