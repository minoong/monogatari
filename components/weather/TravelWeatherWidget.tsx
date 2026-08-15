"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Droplets, RefreshCw, Umbrella } from "lucide-react";
import { getWeatherPresentation, useWeather, type WeatherPresentation } from "@/lib/weather";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { CloudSunIcon } from "@/components/ui/cloud-sun";
import { CloudRainIcon } from "@/components/ui/cloud-rain";
import { CloudSnowIcon } from "@/components/ui/cloud-snow";
import { CloudLightningIcon } from "@/components/ui/cloud-lightning";

const weatherSurfaceStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px -24px rgba(15, 23, 42, 0.42)",
  color: "#0f172a",
};

type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };

const WeatherIcon = ({ icon, size = 24, className, ...props }: Pick<WeatherPresentation, "icon"> & { size?: number; className?: string }) => {
  const animationRef = useRef<AnimatedIconHandle>(null);
  const Icon = {
    sun: SunIcon,
    moon: MoonIcon,
    "cloud-sun": CloudSunIcon,
    "cloud-moon": MoonIcon,
    cloud: CloudSunIcon,
    fog: CloudRainIcon,
    drizzle: CloudRainIcon,
    rain: CloudRainIcon,
    snow: CloudSnowIcon,
    thunder: CloudLightningIcon,
  }[icon];

  useEffect(() => {
    animationRef.current?.startAnimation();
  }, [icon]);

  return <Icon ref={animationRef} size={size} className={className} {...props} />;
};

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date(value));

const formatForecastHour = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Bangkok",
  hour: "numeric",
  hour12: false,
}).formatToParts(new Date(value)).find((part) => part.type === "hour")?.value ?? "";

const formatForecastDay = (value: string, index: number) => ({
  weekday: index === 0 ? "오늘" : new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Bangkok", weekday: "short" }).format(new Date(value)),
  date: new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Bangkok", month: "numeric", day: "numeric" }).format(new Date(value)),
});

function WeatherSkeleton() {
  return (
    <section className="overflow-hidden rounded-[28px] p-5" style={weatherSurfaceStyle} aria-label="날씨 정보를 불러오는 중">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full" style={{ backgroundColor: "#cbd5e1" }} />
          <div className="h-5 w-16 animate-pulse rounded-full" style={{ backgroundColor: "#e2e8f0" }} />
        </div>
        <div className="size-12 animate-pulse rounded-full" style={{ backgroundColor: "#dbeafe" }} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="space-y-3">
          <div className="h-14 w-28 animate-pulse rounded-2xl" style={{ backgroundColor: "#dbeafe" }} />
          <div className="h-3 w-36 animate-pulse rounded-full" style={{ backgroundColor: "#e2e8f0" }} />
        </div>
        <div className="h-14 w-20 animate-pulse rounded-2xl" style={{ backgroundColor: "#f1f5f9" }} />
      </div>
      <div className="mt-6 border-t pt-4" style={{ borderColor: "#e2e8f0" }}>
        <div className="mb-3 h-3 w-20 animate-pulse rounded-full" style={{ backgroundColor: "#cbd5e1" }} />
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-24 min-w-[66px] animate-pulse rounded-2xl" style={{ backgroundColor: "#f1f5f9" }} />)}
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-20 min-w-[56px] animate-pulse rounded-2xl" style={{ backgroundColor: "#f8fafc" }} />)}
      </div>
    </section>
  );
}

export function TravelWeatherWidget() {
  const { data: cities, isPending, isError, isFetching, refetch } = useWeather();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  if (isPending) return <WeatherSkeleton />;

  if (isError || !cities?.length) {
    return (
      <section className="rounded-[28px] p-5 text-center" style={weatherSurfaceStyle} aria-live="polite">
        <p className="text-sm font-bold">날씨 정보를 불러오지 못했어요.</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold text-white backdrop-blur active:scale-95">
          <RefreshCw size={14} aria-hidden="true" />
          다시 시도
        </button>
      </section>
    );
  }

  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? cities[0];
  const weather = getWeatherPresentation(selectedCity.weatherCode, selectedCity.isDay);
  const needsUmbrella = selectedCity.nextSixHourPrecipitationProbability >= 40;

  return (
    <section className="relative overflow-hidden rounded-[28px] p-5" style={weatherSurfaceStyle} aria-label="여행지 실시간 날씨">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">THAILAND WEATHER</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{selectedCity.city}</h2>
            <p className="mt-1 text-xs font-medium text-slate-400">태국 기준 {formatUpdatedAt(selectedCity.observedAt)} 업데이트</p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center">
            {isFetching ? <RefreshCw size={16} className="animate-spin text-sky-500" aria-label="날씨 갱신 중" /> : <WeatherIcon icon={weather.icon} size={48} className="text-sky-500" aria-label={weather.label} />}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 border-b border-slate-200" role="tablist" aria-label="여행지 선택">
          {cities.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <motion.button
                key={city.id}
                type="button"
                onClick={() => setSelectedCityId(city.id)}
                role="tab"
                aria-selected={isSelected}
                whileTap={prefersReducedMotion ? undefined : { opacity: 0.72 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={`relative min-w-0 px-2 pb-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${isSelected ? "text-slate-900" : "text-slate-400"}`}
              >
                <span className="block truncate text-xs font-semibold">{city.city}</span>
                <span className="mt-1 block text-sm font-medium tracking-[-0.04em]">{city.temperature}°</span>
                {isSelected && <motion.span layoutId="selected-weather-city" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-sky-500" transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }} />}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-6xl font-light leading-none tracking-[-0.08em]">{selectedCity.temperature}°</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">{weather.label} · 체감 {selectedCity.apparentTemperature}°</p>
          </div>
          <div className="rounded-2xl border px-3 py-2 text-right" style={{ backgroundColor: needsUmbrella ? "#eff6ff" : "#f8fafc", borderColor: needsUmbrella ? "#bae6fd" : "#e2e8f0" }}>
            <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-500"><Droplets size={13} aria-hidden="true" />6시간 내 비</p>
            <p className="mt-0.5 text-lg font-bold">{selectedCity.nextSixHourPrecipitationProbability}%</p>
          </div>
        </div>

        {needsUmbrella && <p className="mt-4 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold text-sky-700" style={{ backgroundColor: "#f0f9ff" }}><Umbrella size={14} aria-hidden="true" />우산을 챙기세요. 비 예보가 있어요.</p>}

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold">시간대별 예보</p>
            <p className="text-[10px] font-medium text-slate-400">다음 6시간</p>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {selectedCity.hourlyForecast.map((forecast) => {
              const forecastWeather = getWeatherPresentation(forecast.weatherCode, forecast.isDay);
              return (
                <div key={forecast.time} className="min-w-[66px] snap-start rounded-2xl px-2 py-2.5 text-center" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-[10px] font-semibold text-slate-400">{formatForecastHour(forecast.time)}시</p>
                  <div className="mt-1 flex h-5 items-center justify-center"><WeatherIcon icon={forecastWeather.icon} size={20} className="text-sky-500" aria-label={forecastWeather.label} /></div>
                  <p className="mt-1 text-sm font-bold">{forecast.temperature}°</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-sky-500">{forecast.precipitationProbability}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative mt-5 border-t border-slate-100 pt-4">
        <div className="rounded-2xl border p-3" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-bold">7일 예보</p>
          <p className="text-[10px] font-medium text-slate-400">최고 · 최저</p>
        </div>
        <div className="-mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {selectedCity.dailyForecast.map((forecast, index) => {
            const forecastWeather = getWeatherPresentation(forecast.weatherCode, true);
            const day = formatForecastDay(forecast.date, index);
            return (
              <div key={forecast.date} className="min-w-[58px] flex-1 snap-start rounded-xl px-1 py-2 text-center" style={{ backgroundColor: index === 0 ? "#eff6ff" : "#ffffff" }}>
                <p className="text-[10px] font-bold text-slate-700">{day.weekday}</p>
                <p className="mt-0.5 text-[9px] font-medium text-slate-400">{day.date}</p>
                <div className="my-1.5 flex h-[19px] items-center justify-center"><WeatherIcon icon={forecastWeather.icon} size={19} className="text-sky-500" aria-label={forecastWeather.label} /></div>
                <p className="text-[11px] font-bold">{forecast.temperatureMax}°</p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">{forecast.temperatureMin}°</p>
                {forecast.precipitationProbability >= 40 && <p className="mt-1 text-[9px] font-bold text-sky-500">{forecast.precipitationProbability}%</p>}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
