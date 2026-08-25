import { formatLongTripDate, groupScheduleByDate, type ScheduleItem, type TripDate } from "@/lib/schedule";

export type TripMemoEntry = {
  id: string;
  title: string;
  start_time: string;
  trip_memo: string;
};

export type TripMemoDayGroup = {
  date: TripDate;
  headline: string;
  weekday: string;
  entries: TripMemoEntry[];
};

export type TripMemoTimelineEntry = TripMemoEntry & {
  date: TripDate;
  headline: string;
  weekday: string;
};

const splitTripDateLabel = (date: TripDate) => {
  const label = formatLongTripDate(date);
  const match = label.match(/^(.+?)\s*\((.+)\)$/);
  return {
    headline: match?.[1]?.trim() ?? label,
    weekday: match?.[2]?.trim() ?? "",
  };
};

export const getTripMemoSectionLabel = (group: TripMemoDayGroup) => {
  const day = group.date.split("-")[2]?.replace(/^0+/, "") ?? group.headline;
  return group.weekday ? `${day}/ ${group.weekday}` : group.headline;
};

export const flattenTripMemoGroups = (groups: TripMemoDayGroup[]): TripMemoTimelineEntry[] =>
  groups.flatMap((group) =>
    group.entries.map((entry) => ({
      ...entry,
      date: group.date,
      headline: group.headline,
      weekday: group.weekday,
    })),
  );

export const getScheduleTripMemoGroups = (schedule: ScheduleItem[]): TripMemoDayGroup[] =>
  groupScheduleByDate(
    schedule.filter((item) => Boolean(item.trip_memo?.trim())),
  ).map((group) => {
    const { headline, weekday } = splitTripDateLabel(group.date);
    return {
      date: group.date,
      headline,
      weekday,
      entries: group.items.map((item) => ({
        id: item.id,
        title: item.title,
        start_time: item.start_time,
        trip_memo: item.trip_memo!.trim(),
      })),
    };
  });
