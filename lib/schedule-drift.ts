import type { DriftWallItem } from "@/components/DriftWall";
import type { ScheduleItem } from "@/lib/schedule";

const FALLBACK_SCHEDULE_DRIFT_ITEMS: DriftWallItem[] = [
  { image: "/images/post-trip-scroll.jpg", title: "방콕" },
  { image: "/intro/couple-hands.jpg", title: "함께" },
  { image: "/cinematic/cafe-table.png", title: "카페" },
  { image: "/cinematic/g-tower.png", title: "타워" },
  { image: "/card-exchange-ruka.jpg", title: "추억" },
  { image: "/cinematic/miku.png", title: "미쿠" },
  { image: "/card-utils-rental.jpg", title: "여행" },
  { image: "/cinematic/to-be-continued.png", title: "다음" },
];

export const getScheduleDriftItems = (schedule: ScheduleItem[]): DriftWallItem[] => {
  const fromSchedule = schedule.flatMap((item) =>
    item.images.map((image) => ({
      image: image.url,
      title: item.title,
    })),
  );

  if (fromSchedule.length >= 6) return fromSchedule;

  const merged: DriftWallItem[] = [...fromSchedule];
  for (const item of FALLBACK_SCHEDULE_DRIFT_ITEMS) {
    if (merged.length >= 12) break;
    merged.push(item);
  }

  return merged;
};
