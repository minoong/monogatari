export const WISH_TYPES = ["shopping", "snack", "restaurant"] as const;

export type WishType = (typeof WISH_TYPES)[number];

export interface WishItem {
  id: string;
  type: WishType;
  title: string;
  category: string | null;
  target_price_thb: number | null;
  memo: string | null;
  vendor: string | null;
  image_path: string | null;
  image_url: string | null;
  map_query: string | null;
  created_at: string;
  updated_at: string;
}

export const WISH_TYPE_META: Record<WishType, {
  title: string;
  description: string;
  icon: string;
  accent: string;
  emptyMessage: string;
}> = {
  shopping: {
    title: "쇼핑 리스트",
    description: "태국에서 꼭 사고 싶은 물건",
    icon: "🛍️",
    accent: "from-violet-500 to-purple-600",
    emptyMessage: "사고 싶은 물건을 첫 번째로 담아 보세요.",
  },
  snack: {
    title: "간식 정보",
    description: "여행 중 먹어 볼 간식과 디저트",
    icon: "🥭",
    accent: "from-amber-400 to-orange-500",
    emptyMessage: "먹어 보고 싶은 간식을 담아 보세요.",
  },
  restaurant: {
    title: "맛집",
    description: "이번 여행에서 들르고 싶은 식당",
    icon: "🍜",
    accent: "from-rose-500 to-orange-500",
    emptyMessage: "가 보고 싶은 맛집을 첫 번째로 담아 보세요.",
  },
};

export const isWishType = (value: unknown): value is WishType =>
  typeof value === "string" && WISH_TYPES.includes(value as WishType);

export const formatThaiBaht = (value: number | null) =>
  value === null ? null : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(value);

export const buildGoogleMapsDirectionsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
