import type { ScheduleItem } from "@/lib/schedule";

export const PREP_PARALLAX_COLUMN_COUNT = 4;

export type TripPhotoItem = {
  id: string;
  url: string;
  title: string;
};

export const getScheduleTripPhotos = (schedule: ScheduleItem[]): TripPhotoItem[] =>
  schedule.flatMap((item) =>
    item.tripImages.map((image) => ({
      id: image.id,
      url: image.url,
      title: item.title,
    })),
  );

/** 4열 masonry에 사진을 순서대로 라운드로빈 배치한다. 반복 없음. */
export const distributePhotosToColumns = <T,>(
  items: T[],
  columnCount = PREP_PARALLAX_COLUMN_COUNT,
): T[][] => {
  if (items.length === 0) {
    return Array.from({ length: columnCount }, () => []);
  }

  const columns = Array.from({ length: columnCount }, () => [] as T[]);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });

  return columns;
};
