export const WISH_TYPES = ["shopping", "restaurant", "menu", "snack"] as const;

export type WishType = (typeof WISH_TYPES)[number];

export interface WishItem {
  id: string;
  type: WishType;
  title: string;
  categories: string[];
  target_price_thb: number | null;
  memo: string | null;
  vendor: string | null;
  images: WishImage[];
  locations: string[];
  links: string[];
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishImage {
  id: string;
  path: string;
  url: string;
  sort_order: number;
}

export const WISH_TYPE_META: Record<WishType, {
  title: string;
  activityTitle: string;
  description: string;
  icon: string;
  accent: string;
  emptyMessage: string;
}> = {
  shopping: {
    title: "쇼핑 리스트",
    activityTitle: "쇼핑, 아무거나 담지 마!",
    description: "정말 갖고 싶은 것만 골라. 충동구매하고 후회하면 가만 안 둬.",
    icon: "🛍️",
    accent: "from-violet-500 to-purple-600",
    emptyMessage: "살 게 없다니 말이 돼? 필요한 것부터 하나씩 제대로 담아.",
  },
  restaurant: {
    title: "맛집",
    activityTitle: "맛집, 제대로 골라!",
    description: "아무 데나 들어갈 생각은 하지 마. 맛있는 곳만 확실히 골라 둬.",
    icon: "🍜",
    accent: "from-rose-500 to-orange-500",
    emptyMessage: "배고파진 뒤에 찾지 말고, 가고 싶은 식당부터 얼른 등록해.",
  },
  menu: {
    title: "메뉴",
    activityTitle: "먹을 메뉴, 빼먹지 마!",
    description: "가서 고민하지 말고 먹고 싶은 건 미리 정해. 내가 두 번 말하게 하지 마.",
    icon: "🍽️",
    accent: "from-orange-500 to-amber-500",
    emptyMessage: "먹고 싶은 게 하나도 없다고? 솔직하게 첫 메뉴부터 적어 봐.",
  },
  snack: {
    title: "간식/디저트",
    activityTitle: "간식도 빼먹으면 안 돼!",
    description: "디저트는 별도니까 참지 마. 먹고 싶은 건 눈치 보지 말고 담아.",
    icon: "🥭",
    accent: "from-amber-400 to-orange-500",
    emptyMessage: "간식 칸이 비어 있잖아. 달콤한 것부터 하나 골라 봐.",
  },
};

export const isWishType = (value: unknown): value is WishType =>
  typeof value === "string" && WISH_TYPES.includes(value as WishType);

export const WISH_COMPLETION_LABEL: Record<WishType, string> = {
  shopping: "샀어요",
  restaurant: "갔어요",
  menu: "먹었어요",
  snack: "먹었어요",
};

export const WISH_RING_COLORS: Record<WishType, string> = {
  shopping: "#8b5cf6",
  restaurant: "#f43f5e",
  menu: "#f97316",
  snack: "#fbbf24",
};

export type WishProgress = {
  completed: number;
  total: number;
  progress: number;
};

export const getWishProgress = (wishes: WishItem[], type?: WishType): WishProgress => {
  const filtered = type ? wishes.filter((wish) => wish.type === type) : wishes;
  const total = filtered.length;
  const completed = filtered.filter((wish) => wish.is_completed).length;
  return {
    completed,
    total,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

export type WishCompletionFilter = "all" | "completed" | "pending";

export const isWishCompletionFilter = (value: unknown): value is WishCompletionFilter =>
  value === "all" || value === "completed" || value === "pending";

export const WISH_CATEGORY_SUGGESTIONS: Record<WishType, string[]> = {
  shopping: ["기념품", "약국", "패션", "생활용품", "뷰티"],
  restaurant: ["태국 음식", "국수", "길거리 음식", "카페", "해산물"],
  menu: ["태국 음식", "국수", "길거리 음식", "해산물", "음료"],
  snack: ["과일", "디저트", "음료", "편의점", "식재료"],
};

export const formatThaiBaht = (value: number | null) =>
  value === null ? null : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value);

export const normalizeExternalUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const isGoogleMapsUrl = (value: string) => {
  try {
    const { hostname, pathname } = new URL(value);
    return (
      hostname === "maps.app.goo.gl"
      || (/(^|\.)google\.[a-z.]+$/i.test(hostname) && pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
};
