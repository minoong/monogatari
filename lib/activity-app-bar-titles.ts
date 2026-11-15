import type { TripCopy } from "@/lib/trips";
import { isWishType, WISH_TYPE_META } from "@/lib/wishes";

/** 여행과 무관한 고정 제목. 홈과 사전 제목은 여행별 문구(TripCopy)를 쓴다. */
export const ACTIVITY_APP_BAR_TITLES = {
  ExchangeActivity: "환율 계산기... 바가지 쓰지 마!",
  ScheduleActivity: "일정, 제대로 따라와!",
  ChecklistActivity: "빠뜨린 거 없나 잘 체크해!",
  DiscoverActivity: "원하는 건 확실히 골라!",
  AccommodationActivity: "숙소 자세히 보기",
  UtilsActivity: "유틸 도구... 실수하지 마!",
  FlightActivity: "항공권 상세",
  ExpenseActivity: "가현짱, 렌탈 영수증 발행!",
} as const;

export function resolveActivityAppBarTitle(
  activityName: string,
  params: Record<string, unknown>,
  copy: TripCopy,
): string {
  if (activityName === "HomeActivity") return copy.homeTitle;
  if (activityName === "DictionaryActivity") return copy.dictionaryTitle;

  if (activityName === "WishListActivity") {
    const type =
      typeof params.type === "string" && isWishType(params.type) ? params.type : "shopping";
    return WISH_TYPE_META[type].activityTitle;
  }

  return ACTIVITY_APP_BAR_TITLES[activityName as keyof typeof ACTIVITY_APP_BAR_TITLES] ?? "";
}
