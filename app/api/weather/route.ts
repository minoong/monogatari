import { NextResponse } from "next/server";
import type { DailyWeatherForecast, HourlyWeatherForecast, WeatherCity, WeatherCityId } from "@/lib/weather";

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
    wind_speed_10m?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
    weather_code?: Array<number | null>;
    precipitation_probability?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
    is_day?: Array<number | null>;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: Array<number | null>;
    temperature_2m_min?: Array<number | null>;
    weather_code?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
    wind_speed_10m_max?: Array<number | null>;
    sunrise?: string[];
    sunset?: string[];
  };
};

type OpenMeteoCurrent = {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
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
      && typeof current.wind_speed_10m === "number"
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

function getHourlyForecast(location: OpenMeteoLocation, currentTime: string): HourlyWeatherForecast[] {
  const hourly = location.hourly;
  const times = hourly?.time ?? [];
  const startIndex = Math.max(0, times.findIndex((time) => time >= currentTime));

  return times.slice(startIndex, startIndex + 6).flatMap((time, offset) => {
    const index = startIndex + offset;
    const temperature = hourly?.temperature_2m?.[index];
    const weatherCode = hourly?.weather_code?.[index];
    const precipitationProbability = hourly?.precipitation_probability?.[index];
    const windSpeed = hourly?.wind_speed_10m?.[index];
    const isDay = hourly?.is_day?.[index];
    if (typeof temperature !== "number" || typeof weatherCode !== "number" || typeof precipitationProbability !== "number" || typeof windSpeed !== "number" || (isDay !== 0 && isDay !== 1)) return [];

    return [{
      time: new Date(`${time}${THAILAND_UTC_OFFSET}`).toISOString(),
      temperature: Math.round(temperature),
      weatherCode,
      precipitationProbability: Math.round(precipitationProbability),
      windSpeed: Math.round(windSpeed),
      isDay: isDay === 1,
    }];
  });
}

function getDailyForecast(location: OpenMeteoLocation): DailyWeatherForecast[] {
  const daily = location.daily;
  const dates = daily?.time ?? [];

  return dates.slice(0, 7).flatMap((date, index) => {
    const temperatureMax = daily?.temperature_2m_max?.[index];
    const temperatureMin = daily?.temperature_2m_min?.[index];
    const weatherCode = daily?.weather_code?.[index];
    const precipitationProbability = daily?.precipitation_probability_max?.[index];
    const windSpeedMax = daily?.wind_speed_10m_max?.[index];
    const sunrise = daily?.sunrise?.[index];
    const sunset = daily?.sunset?.[index];
    if (typeof temperatureMax !== "number" || typeof temperatureMin !== "number" || typeof weatherCode !== "number" || typeof precipitationProbability !== "number" || typeof windSpeedMax !== "number" || typeof sunrise !== "string" || typeof sunset !== "string") return [];

    return [{
      date: new Date(`${date}T00:00:00${THAILAND_UTC_OFFSET}`).toISOString(),
      temperatureMax: Math.round(temperatureMax),
      temperatureMin: Math.round(temperatureMin),
      weatherCode,
      precipitationProbability: Math.round(precipitationProbability),
      windSpeedMax: Math.round(windSpeedMax),
      sunrise: new Date(`${sunrise}${THAILAND_UTC_OFFSET}`).toISOString(),
      sunset: new Date(`${sunset}${THAILAND_UTC_OFFSET}`).toISOString(),
    }];
  });
}

function normalizeWeather(locations: unknown): WeatherCity[] | null {
  if (!Array.isArray(locations) || locations.length !== TRAVEL_DESTINATIONS.length) return null;

  const weather = locations.map((value, index) => {
    const location = value as OpenMeteoLocation;
    if (!isValidCurrent(location)) return null;

    const destination = TRAVEL_DESTINATIONS[index];
    const dailyForecast = getDailyForecast(location);
    const today = dailyForecast[0];
    if (!today) return null;

    return {
      id: destination.id,
      city: destination.city,
      temperature: Math.round(location.current.temperature_2m),
      apparentTemperature: Math.round(location.current.apparent_temperature),
      weatherCode: location.current.weather_code,
      isDay: location.current.is_day === 1,
      windSpeed: Math.round(location.current.wind_speed_10m),
      observedAt: new Date(`${location.current.time}${THAILAND_UTC_OFFSET}`).toISOString(),
      sunrise: today.sunrise,
      sunset: today.sunset,
      nextSixHourPrecipitationProbability: getNextSixHourPrecipitationProbability(location, location.current.time),
      hourlyForecast: getHourlyForecast(location, location.current.time),
      dailyForecast,
    } satisfies WeatherCity;
  });

  return weather.every((item): item is WeatherCity => item !== null) ? weather : null;
}

export async function GET() {
  const parameters = new URLSearchParams({
    latitude: TRAVEL_DESTINATIONS.map((destination) => destination.latitude).join(","),
    longitude: TRAVEL_DESTINATIONS.map((destination) => destination.longitude).join(","),
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    hourly: "temperature_2m,weather_code,precipitation_probability,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset",
    forecast_days: "7",
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
