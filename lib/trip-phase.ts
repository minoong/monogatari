import { FLIGHT_SEGMENTS } from "@/lib/flights";

export type TripPhase = "before" | "during" | "after";

const outboundDeparture = new Date("2026-08-29T09:45:00+09:00");
const returnDeparture = new Date("2026-09-01T21:40:00+07:00");

export const TRIP_RETURN_FLIGHT = FLIGHT_SEGMENTS.find((segment) => segment.id === "return");

export function getTripPhase(now = new Date()): TripPhase {
  if (now < outboundDeparture) return "before";
  if (now < returnDeparture) return "during";
  return "after";
}
