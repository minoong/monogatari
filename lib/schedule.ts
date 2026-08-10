export const TRIP_DATES = ["2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"] as const;

export type TripDate = string;

export const TRIP_START_DATE: TripDate = TRIP_DATES[0];
export const TRIP_END_DATE: TripDate = TRIP_DATES[TRIP_DATES.length - 1];

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
  created_at: string;
  updated_at: string;
  images: ScheduleImage[];
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
