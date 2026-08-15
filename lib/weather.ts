import { useQuery } from "@tanstack/react-query";

export const WEATHER_QUERY_KEY = ["weather"] as const;
export const WEATHER_REFRESH_INTERVAL = 15 * 60 * 1000;

export type WeatherCityId = "bangkok" | "pattaya" | "koh-sichang";

export interface WeatherCity {
  id: WeatherCityId;
  city: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  observedAt: string;
  nextSixHourPrecipitationProbability: number;
}

export interface WeatherResponse {
  data: WeatherCity[];
}

export interface WeatherPresentation {
  label: string;
  icon: string;
}

const WEATHER_PRESENTATIONS: Record<number, Omit<WeatherPresentation, "icon">> = {
  0: { label: "맑음" },
  1: { label: "대체로 맑음" },
  2: { label: "구름 조금" },
  3: { label: "흐림" },
  45: { label: "안개" },
  48: { label: "짙은 안개" },
  51: { label: "이슬비" },
  53: { label: "이슬비" },
  55: { label: "강한 이슬비" },
  56: { label: "어는 이슬비" },
  57: { label: "강한 어는 이슬비" },
  61: { label: "비" },
  63: { label: "비" },
  65: { label: "강한 비" },
  66: { label: "어는 비" },
  67: { label: "강한 어는 비" },
  71: { label: "눈" },
  73: { label: "눈" },
  75: { label: "강한 눈" },
  77: { label: "싸락눈" },
  80: { label: "소나기" },
  81: { label: "소나기" },
  82: { label: "강한 소나기" },
  85: { label: "눈 소나기" },
  86: { label: "강한 눈 소나기" },
  95: { label: "뇌우" },
  96: { label: "우박 동반 뇌우" },
  99: { label: "강한 우박 동반 뇌우" },
};

export function getWeatherPresentation(weatherCode: number, isDay: boolean): WeatherPresentation {
  const label = WEATHER_PRESENTATIONS[weatherCode]?.label ?? "날씨 정보 없음";

  if (weatherCode === 0) return { label: isDay ? label : "맑은 밤", icon: isDay ? "☀️" : "🌙" };
  if (weatherCode === 1 || weatherCode === 2) return { label, icon: isDay ? "🌤️" : "☁️" };
  if (weatherCode === 3) return { label, icon: "☁️" };
  if (weatherCode === 45 || weatherCode === 48) return { label, icon: "🌫️" };
  if (weatherCode >= 51 && weatherCode <= 57) return { label, icon: "🌦️" };
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return { label, icon: "🌧️" };
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return { label, icon: "🌨️" };
  if (weatherCode >= 95) return { label, icon: "⛈️" };
  return { label, icon: "🌥️" };
}

export async function fetchWeather(): Promise<WeatherCity[]> {
  const response = await fetch("/api/weather");
  if (!response.ok) throw new Error("날씨 정보를 불러오지 못했습니다.");

  const json = await response.json() as WeatherResponse;
  return json.data;
}

export function useWeather() {
  return useQuery({
    queryKey: WEATHER_QUERY_KEY,
    queryFn: fetchWeather,
    staleTime: WEATHER_REFRESH_INTERVAL,
    refetchInterval: WEATHER_REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
  });
}
