import { NextResponse } from "next/server";
import type { WeatherCity, WeatherCityId } from "@/lib/weather";

const CACHE_SECONDS = 15 * 60;
const THAILAND_UTC_OFFSET = "+07:00";

const TRAVEL_DESTINATIONS: Array<{ id: WeatherCityId; city: string; latitude: number; longitude: number }> = [
  { id: "bangkok", city: "방콕", latitude: 13.7563, longitude: 100.5018 },
  { id: "pattaya", city: "팟타야", latitude: 12.9236, longitude: 100.8825 },
  { id: "koh-sichang", city: "코시창", latitude: 13.161, longitude: 100.808 },
];

type OpenMeteoLocation = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    precipitation_probability?: Array<number | null>;
  };
};

type OpenMeteoCurrent = {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  is_day: 0 | 1;
};

function isValidCurrent(location: OpenMeteoLocation): location is OpenMeteoLocation & { current: OpenMeteoCurrent } {
  const current = location.current;
  return Boolean(
    current
      && typeof current.time === "string"
      && typeof current.temperature_2m === "number"
      && typeof current.apparent_temperature === "number"
      && typeof current.weather_code === "number"
      && (current.is_day === 0 || current.is_day === 1),
  );
}

function getNextSixHourPrecipitationProbability(location: OpenMeteoLocation, currentTime: string) {
  const times = location.hourly?.time ?? [];
  const probabilities = location.hourly?.precipitation_probability ?? [];
  const currentIndex = times.findIndex((time) => time >= currentTime);
  const startIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextSixHours = probabilities.slice(startIndex, startIndex + 6).filter((value): value is number => typeof value === "number");

  return Math.max(0, ...nextSixHours.map((value) => Math.round(value)));
}

function normalizeWeather(locations: unknown): WeatherCity[] | null {
  if (!Array.isArray(locations) || locations.length !== TRAVEL_DESTINATIONS.length) return null;

  const weather = locations.map((value, index) => {
    const location = value as OpenMeteoLocation;
    if (!isValidCurrent(location)) return null;

    const destination = TRAVEL_DESTINATIONS[index];
    return {
      id: destination.id,
      city: destination.city,
      temperature: Math.round(location.current.temperature_2m),
      apparentTemperature: Math.round(location.current.apparent_temperature),
      weatherCode: location.current.weather_code,
      isDay: location.current.is_day === 1,
      observedAt: new Date(`${location.current.time}${THAILAND_UTC_OFFSET}`).toISOString(),
      nextSixHourPrecipitationProbability: getNextSixHourPrecipitationProbability(location, location.current.time),
    } satisfies WeatherCity;
  });

  return weather.every((item): item is WeatherCity => item !== null) ? weather : null;
}

export async function GET() {
  const parameters = new URLSearchParams({
    latitude: TRAVEL_DESTINATIONS.map((destination) => destination.latitude).join(","),
    longitude: TRAVEL_DESTINATIONS.map((destination) => destination.longitude).join(","),
    current: "temperature_2m,apparent_temperature,weather_code,is_day",
    hourly: "precipitation_probability",
    forecast_days: "1",
    timezone: "Asia/Bangkok",
  });

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);

    const weather = normalizeWeather(await response.json());
    if (!weather) throw new Error("Weather provider response was incomplete");

    return NextResponse.json(
      { data: weather },
      { headers: { "Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}` } },
    );
  } catch (error) {
    console.error("Unable to fetch weather data", error);
    return NextResponse.json({ error: "날씨 정보를 일시적으로 불러올 수 없습니다." }, { status: 502 });
  }
}
