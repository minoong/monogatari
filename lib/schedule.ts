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

export const getBangkokTime = (now = new Date()) => {
  const parts = getBangkokNowParts(now);
  return `${parts.hour}:${parts.minute}`;
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
