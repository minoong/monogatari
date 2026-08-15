"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Droplets, RefreshCw, Umbrella } from "lucide-react";
import { getWeatherPresentation, useWeather, type WeatherCity, type WeatherPresentation } from "@/lib/weather";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { CloudSunIcon } from "@/components/ui/cloud-sun";
import { CloudRainIcon } from "@/components/ui/cloud-rain";
import { CloudSnowIcon } from "@/components/ui/cloud-snow";
import { CloudLightningIcon } from "@/components/ui/cloud-lightning";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";

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

const cityPanelVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 10 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -10 }),
};

function WeatherDetails({ city, isRefreshing }: { city: WeatherCity; isRefreshing: boolean }) {
  const weather = getWeatherPresentation(city.weatherCode, city.isDay);
  const needsUmbrella = city.nextSixHourPrecipitationProbability >= 40;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-400">THAILAND WEATHER</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{city.city}</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">태국 기준 {formatUpdatedAt(city.observedAt)} 업데이트</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center">
          {isRefreshing ? <RefreshCw size={16} className="animate-spin text-sky-500" aria-label="날씨 갱신 중" /> : <WeatherIcon icon={weather.icon} size={48} className="text-sky-500" aria-label={weather.label} />}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-6xl font-light leading-none tracking-[-0.08em]">{city.temperature}°</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">{weather.label} · 체감 {city.apparentTemperature}°</p>
        </div>
        <div className="rounded-2xl border px-3 py-2 text-right" style={{ backgroundColor: needsUmbrella ? "#eff6ff" : "#f8fafc", borderColor: needsUmbrella ? "#bae6fd" : "#e2e8f0" }}>
          <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-500"><Droplets size={13} aria-hidden="true" />6시간 내 비</p>
          <p className="mt-0.5 text-lg font-bold">{city.nextSixHourPrecipitationProbability}%</p>
        </div>
      </div>

      {needsUmbrella && <p className="mt-4 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold text-sky-700" style={{ backgroundColor: "#f0f9ff" }}><Umbrella size={14} aria-hidden="true" />우산을 챙기세요. 비 예보가 있어요.</p>}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold">시간대별 예보</p>
          <p className="text-[10px] font-medium text-slate-400">다음 6시간</p>
        </div>
        <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {city.hourlyForecast.map((forecast) => {
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

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="rounded-2xl border p-3" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-bold">7일 예보</p>
            <p className="text-[10px] font-medium text-slate-400">최고 · 최저</p>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {city.dailyForecast.map((forecast, index) => {
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
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="overflow-hidden rounded-[28px] p-4" style={weatherSurfaceStyle} aria-label="날씨 정보를 불러오는 중">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full" style={{ backgroundColor: "#cbd5e1" }} />
          <div className="h-5 w-16 animate-pulse rounded-full" style={{ backgroundColor: "#e2e8f0" }} />
        </div>
        <div className="size-12 animate-pulse rounded-full" style={{ backgroundColor: "#dbeafe" }} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-3">
          <div className="h-14 w-28 animate-pulse rounded-2xl" style={{ backgroundColor: "#dbeafe" }} />
          <div className="h-3 w-36 animate-pulse rounded-full" style={{ backgroundColor: "#e2e8f0" }} />
        </div>
        <div className="h-14 w-20 animate-pulse rounded-2xl" style={{ backgroundColor: "#f1f5f9" }} />
      </div>
      <div className="mt-4 border-t pt-4" style={{ borderColor: "#e2e8f0" }}>
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
  const [transitionDirection, setTransitionDirection] = useState(1);
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

  const selectedCityIndex = Math.max(0, cities.findIndex((city) => city.id === selectedCityId));
  const selectedCity = cities[selectedCityIndex];

  const selectCity = (cityId: string, index: number) => {
    if (index !== selectedCityIndex) setTransitionDirection(index > selectedCityIndex ? 1 : -1);
    setSelectedCityId(cityId);
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] p-4" style={weatherSurfaceStyle} aria-label="여행지 실시간 날씨">
      <div className="relative">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="여행지 선택">
          {cities.map((city, index) => {
            const isSelected = index === selectedCityIndex;
            return (
              <motion.button
                key={city.id}
                type="button"
                onClick={() => selectCity(city.id, index)}
                role="tab"
                aria-selected={isSelected}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={`relative min-w-0 rounded-xl px-2 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${isSelected ? "text-slate-900" : "text-slate-400"}`}
              >
                {isSelected && <motion.span layoutId="selected-weather-city" className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]" transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }} />}
                <span className="relative flex items-center justify-center gap-1 whitespace-nowrap">
                  <span className="truncate text-[11px] font-semibold">{city.city}</span>
                  <span className="text-xs font-bold tracking-[-0.04em]">{city.temperature}°</span>
                </span>
              </motion.button>
            );
          })}
        </div>
        <TransitionPanel
          className="mt-4"
          activeIndex={selectedCityIndex}
          custom={transitionDirection}
          variants={prefersReducedMotion ? undefined : cityPanelVariants}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
        >
          {cities.map((city) => <WeatherDetails key={city.id} city={city} isRefreshing={isFetching && city.id === selectedCity.id} />)}
        </TransitionPanel>
      </div>
    </section>
  );
}
