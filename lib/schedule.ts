export const TRIP_DATES = ["2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"] as const;

export type TripDate = string;

export const TRIP_START_DATE: TripDate = TRIP_DATES[0];
export const TRIP_END_DATE: TripDate = TRIP_DATES[TRIP_DATES.length - 1];

export type ScheduleImageKind = "cover" | "trip";

export interface ScheduleImage {
  id: string;
  path: string;
  url: string;
  sort_order: number;
}

export interface ScheduleItem {
  id: string;
  schedule_date: TripDate;
  start_time: string;
  title: string;
  subtitle: string | null;
  google_maps_url: string | null;
  trip_memo: string | null;
  created_at: string;
  updated_at: string;
  images: ScheduleImage[];
  tripImages: ScheduleImage[];
}

export const isTripDate = (value: unknown): value is TripDate =>
  typeof value === "string" && TRIP_DATES.some((date) => date === value);

export const isScheduleDate = (value: unknown): value is TripDate =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());

export const isTimeValue = (value: unknown): value is string =>
  typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

export const normalizeExternalUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const isGoogleMapsUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === "maps.app.goo.gl" || (hostname === "goo.gl" && parsed.pathname.startsWith("/maps")) || (/^(?:[^.]+\.)?google\.[a-z.]+$/.test(hostname) && parsed.pathname.startsWith("/maps"));
  } catch {
    return false;
  }
};

export const formatTripDate = (date: TripDate) => {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
};

export const formatLongTripDate = (date: TripDate) => {
  const local = new Date(`${date}T12:00:00+07:00`);
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(local);
};

export type ScheduleDateGroup = {
  date: TripDate;
  items: ScheduleItem[];
};

export const groupScheduleByDate = (items: ScheduleItem[]): ScheduleDateGroup[] => {
  const dates = Array.from(new Set(items.map((item) => item.schedule_date))).sort();
  return dates.map((date) => ({
    date,
    items: items
      .filter((item) => item.schedule_date === date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.created_at.localeCompare(b.created_at)),
  }));
};

export const getTripDayLabel = (date: TripDate) => {
  const index = TRIP_DATES.findIndex((tripDate) => tripDate === date);
  return index >= 0 ? `Day ${index + 1}` : formatTripDate(date);
};

const getBangkokNowParts = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});

export const getBangkokTripDate = (now = new Date()) => {
  const parts = getBangkokNowParts(now);
  return `${parts.year}-${parts.month}-${parts.day}` as TripDate;
};

/** 개발 미리보기 시각 (Bangkok). null이면 실제 시각. URL `?scheduleAt=`으로도 지정 가능. */
export const SCHEDULE_PREVIEW_AT: string | null = null;

export const getScheduleNow = (): Date => {
  if (typeof window !== "undefined") {
    const queryAt = new URLSearchParams(window.location.search).get("scheduleAt");
    if (queryAt) return new Date(queryAt);
  }
  if (SCHEDULE_PREVIEW_AT) return new Date(SCHEDULE_PREVIEW_AT);
  return new Date();
};

export const getBangkokTime = (now = new Date()) => {
  const parts = getBangkokNowParts(now);
  return `${parts.hour}:${parts.minute}`;
};

export const timeToMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export type ScheduleSegmentProgress = {
  activeItemId: string | null;
  /** 현재 구간 안에서의 진행률 (0~1) */
  segmentProgress: number;
  /** 이미 지나간 일정 id */
  pastItemIds: string[];
  /** 첫 일정 시작 전, 해당 일정 닷에서 대기 중 */
  waitingAtItemId?: string;
};

const sortDayItems = (items: ScheduleItem[], date: TripDate) =>
  items
    .filter((item) => item.schedule_date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.created_at.localeCompare(b.created_at));

export const getScheduleItemsForDate = (items: ScheduleItem[], date: TripDate) => sortDayItems(items, date);

const waitAtFirstSchedule = (dayItems: ScheduleItem[]): ScheduleSegmentProgress => ({
  activeItemId: null,
  segmentProgress: 0,
  pastItemIds: [],
  waitingAtItemId: dayItems[0].id,
});

export const hasScheduleTimelineProgress = (progress: ScheduleSegmentProgress) =>
  Boolean(progress.activeItemId || progress.waitingAtItemId || progress.pastItemIds.length > 0);

/** Bangkok 기준 해당 날짜에서 현재 시간이 속한 일정 구간과 구간 내 진행률을 반환한다. */
export const getScheduleSegmentProgress = (
  items: ScheduleItem[],
  date: TripDate,
  now = getScheduleNow(),
): ScheduleSegmentProgress => {
  const tripDate = getBangkokTripDate(now);
  const dayItems = sortDayItems(items, date);
  if (dayItems.length === 0) return { activeItemId: null, segmentProgress: 0, pastItemIds: [] };

  if (date < tripDate) {
    return {
      activeItemId: null,
      segmentProgress: 1,
      pastItemIds: dayItems.map((item) => item.id),
    };
  }

  if (date > tripDate) {
    if (date === TRIP_START_DATE) {
      return waitAtFirstSchedule(dayItems);
    }
    return { activeItemId: null, segmentProgress: 0, pastItemIds: [] };
  }

  const currentTime = getBangkokTime(now);
  const currentMinutes = timeToMinutes(currentTime);
  const active = dayItems.filter((item) => item.start_time <= currentTime).at(-1);
  if (!active) {
    return waitAtFirstSchedule(dayItems);
  }

  const activeIndex = dayItems.findIndex((item) => item.id === active.id);
  const lastItem = dayItems.at(-1)!;

  if (active.id === lastItem.id && currentMinutes > timeToMinutes(lastItem.start_time)) {
    return {
      activeItemId: null,
      segmentProgress: 1,
      pastItemIds: dayItems.map((item) => item.id),
    };
  }

  const pastItemIds = activeIndex > 0 ? dayItems.slice(0, activeIndex).map((item) => item.id) : [];
  const next = dayItems[activeIndex + 1];
  const startMinutes = timeToMinutes(active.start_time);
  const endMinutes = next ? timeToMinutes(next.start_time) : 24 * 60;

  if (endMinutes <= startMinutes) {
    return { activeItemId: active.id, segmentProgress: 1, pastItemIds };
  }

  const segmentProgress = (currentMinutes - startMinutes) / (endMinutes - startMinutes);
  return {
    activeItemId: active.id,
    segmentProgress: Math.max(0, Math.min(1, segmentProgress)),
    pastItemIds,
  };
};

export const getFirstScheduleOnDate = (items: ScheduleItem[], date: TripDate) =>
  items
    .filter((item) => item.schedule_date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.created_at.localeCompare(b.created_at))[0] ?? null;

export const getUpcomingSchedulePreview = (items: ScheduleItem[], now = new Date()) => {
  const parts = getBangkokNowParts(now);
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const currentTime = `${parts.hour}:${parts.minute}`;

  const todayItems = items
    .filter((item) => item.schedule_date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.created_at.localeCompare(b.created_at));

  const upcoming = todayItems.find((item) => item.start_time >= currentTime);
  if (upcoming) {
    return `${upcoming.start_time} · ${upcoming.title}`;
  }

  const latest = todayItems.filter((item) => item.start_time <= currentTime).at(-1);
  if (latest) {
    return `${latest.start_time} · ${latest.title}`;
  }

  return null;
};

export type TodayScheduleFocus = {
  date: TripDate;
  dateLabel: string;
  current: ScheduleItem | null;
  next: ScheduleItem | null;
  /** 오늘 일정이 끝난 뒤 내일 첫 일정을 다음으로 보여줄 때 */
  nextIsTomorrow?: boolean;
};

const getNextTripDate = (date: TripDate): TripDate | null => {
  const index = TRIP_DATES.findIndex((tripDate) => tripDate === date);
  if (index < 0 || index >= TRIP_DATES.length - 1) return null;
  return TRIP_DATES[index + 1];
};

/** Bangkok 기준 오늘 일정에서 진행 중·다음 일정을 반환한다. */
export const getTodayScheduleFocus = (items: ScheduleItem[], now = new Date()): TodayScheduleFocus | null => {
  const date = getBangkokTripDate(now);
  const currentTime = getBangkokTime(now);
  const todayItems = items
    .filter((item) => item.schedule_date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time) || a.created_at.localeCompare(b.created_at));

  if (todayItems.length === 0) return null;

  const current = todayItems.filter((item) => item.start_time <= currentTime).at(-1) ?? null;
  let next = todayItems.find((item) => item.start_time > currentTime) ?? null;
  let nextIsTomorrow = false;

  if (!next) {
    const nextDate = getNextTripDate(date);
    if (nextDate) {
      const tomorrowFirst = getFirstScheduleOnDate(items, nextDate);
      if (tomorrowFirst) {
        next = tomorrowFirst;
        nextIsTomorrow = true;
      }
    }
  }

  return {
    date,
    dateLabel: formatTripDate(date),
    current,
    next,
    nextIsTomorrow: nextIsTomorrow || undefined,
  };
};
