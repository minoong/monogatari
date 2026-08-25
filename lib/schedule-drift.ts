import type { DriftWallItem } from "@/components/DriftWall";
import type { ScheduleItem } from "@/lib/schedule";

const MIN_DRIFT_TILES = 10;

export const getScheduleDriftItems = (schedule: ScheduleItem[]): DriftWallItem[] => {
  const fromSchedule = schedule.flatMap((item) =>
    item.images.map((image) => ({
      image: image.url,
      title: item.title,
    })),
  );

  if (fromSchedule.length === 0 || fromSchedule.length >= MIN_DRIFT_TILES) return fromSchedule;

  const filled: DriftWallItem[] = [...fromSchedule];
  while (filled.length < MIN_DRIFT_TILES) {
    filled.push(...fromSchedule);
  }
  return filled;
};
