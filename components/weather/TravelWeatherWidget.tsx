"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Droplets, RefreshCw, Umbrella } from "lucide-react";
import { Button, Skeleton, Tabs } from "@heroui/react";
import { getWeatherPresentation, useWeather, type WeatherCity, type WeatherPresentation } from "@/lib/weather";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { CloudSunIcon } from "@/components/ui/cloud-sun";
import { CloudRainIcon } from "@/components/ui/cloud-rain";
import { CloudRainWindIcon } from "@/components/ui/cloud-rain-wind";
import { CloudSnowIcon } from "@/components/ui/cloud-snow";
import { CloudLightningIcon } from "@/components/ui/cloud-lightning";
import { WindIcon } from "@/components/ui/wind";
import { SunMoonIcon } from "@/components/ui/sun-moon";
import { SunsetIcon } from "@/components/ui/sunset";
import { CompactSegmentedTabsList } from "@/components/ui/compact-segmented-tabs";

const weatherSurfaceStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 14px 30px -24px rgba(15, 23, 42, 0.42)",
  color: "#0f172a",
};

type AnimatedIconHandle = { startAnimation: () => void; stopAnimation: () => void };
const WEATHER_ICON_REPLAY_INTERVAL = 3_200;

const WeatherIcon = ({ icon, size = 24, className, autoPlay = false, ...props }: Pick<WeatherPresentation, "icon"> & { size?: number; className?: string; autoPlay?: boolean }) => {
  const animationRef = useRef<AnimatedIconHandle>(null);
  const Icon = {
    sun: SunIcon,
    moon: MoonIcon,
    "sun-moon": SunMoonIcon,
    "cloud-sun": CloudSunIcon,
    "cloud-moon": MoonIcon,
    cloud: CloudSunIcon,
    fog: CloudRainIcon,
    drizzle: CloudRainIcon,
    rain: CloudRainIcon,
    "rain-wind": CloudRainWindIcon,
    wind: WindIcon,
    snow: CloudSnowIcon,
    thunder: CloudLightningIcon,
  }[icon];

  useEffect(() => {
    if (!autoPlay) return;

    let frameId = 0;
    const playAnimation = () => {
      animationRef.current?.stopAnimation();
      frameId = window.requestAnimationFrame(() => animationRef.current?.startAnimation());
    };

    playAnimation();
    const intervalId = window.setInterval(playAnimation, WEATHER_ICON_REPLAY_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
      window.cancelAnimationFrame(frameId);
    };
  }, [autoPlay, icon]);

  return <Icon ref={autoPlay ? animationRef : undefined} size={size} className={className} {...props} />;
};

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date(value));

const formatCompactDate = (value: string) => {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Bangkok",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(value));
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${month}/${day}`;
};

const formatSunTime = (value: string) => new Intl.DateTimeFormat("ko-KR", {
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

function WeatherDetails({ city, isRefreshing, isDailyExpanded, onDailyExpandedChange }: { city: WeatherCity; isRefreshing: boolean; isDailyExpanded: boolean; onDailyExpandedChange: (expanded: boolean) => void }) {
  const weather = getWeatherPresentation(city.weatherCode, city.isDay, { windSpeed: city.windSpeed, time: city.observedAt, sunrise: city.sunrise, sunset: city.sunset });
  const needsUmbrella = city.nextSixHourPrecipitationProbability >= 40;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold tracking-[-0.03em] text-slate-900">{city.city}</h2>
            <span className="text-[9px] font-medium text-slate-400">{formatUpdatedAt(city.observedAt)} 업데이트</span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-[42px] font-light leading-none tracking-[-0.08em] text-slate-900">{city.temperature}°</p>
            <p className="pb-1 text-xs font-semibold text-slate-500">{weather.label}</p>
          </div>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center">
          {isRefreshing ? <RefreshCw size={15} className="animate-spin text-sky-500" aria-label="날씨 갱신 중" /> : <WeatherIcon icon={weather.icon} size={42} className="text-sky-500" autoPlay aria-label={weather.label} />}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
        <span className="whitespace-nowrap">체감 {city.apparentTemperature}°</span>
        <span className="flex items-center gap-1 whitespace-nowrap"><Droplets size={12} className="text-sky-500" aria-hidden="true" />6시간 비 {city.nextSixHourPrecipitationProbability}%</span>
        <span className="flex items-center gap-1 whitespace-nowrap"><SunIcon size={13} className="text-amber-500" aria-hidden="true" />{formatSunTime(city.sunrise)}</span>
        <span className="flex items-center gap-1 whitespace-nowrap"><SunsetIcon size={13} className="text-orange-500" aria-hidden="true" />{formatSunTime(city.sunset)}</span>
      </div>

      <div className="mt-1.5 min-h-4">
        {needsUmbrella && <p className="flex items-center gap-1 text-[10px] font-semibold text-sky-600"><Umbrella size={12} aria-hidden="true" />우산을 챙기세요. 비 예보가 있어요.</p>}
      </div>

      <div className="mt-2.5 border-t border-slate-100 pt-2.5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-bold">시간대별 예보</p>
          <p className="text-[10px] font-medium text-slate-400">다음 6시간</p>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {city.hourlyForecast.map((forecast) => {
            const forecastWeather = getWeatherPresentation(forecast.weatherCode, forecast.isDay, { windSpeed: forecast.windSpeed, time: forecast.time, sunrise: city.sunrise, sunset: city.sunset });
            return (
              <div key={forecast.time} className="min-w-0 rounded-lg px-1 py-1 text-center">
                <p className="text-[10px] font-semibold text-slate-400">{formatForecastHour(forecast.time)}시</p>
                <div className="mt-1 flex h-5 items-center justify-center"><WeatherIcon icon={forecastWeather.icon} size={20} className="text-sky-500" aria-label={forecastWeather.label} /></div>
                <p className="mt-1 text-sm font-bold">{forecast.temperature}°</p>
                <p className="mt-0.5 text-[10px] font-semibold text-sky-500">{forecast.precipitationProbability}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5 border-t border-slate-100 pt-2.5">
        <motion.div initial={false} animate={{ height: isDailyExpanded ? "auto" : 48 }} transition={{ duration: 0.18, ease: "easeInOut" }} className="relative overflow-hidden rounded-lg">
          <div className={`p-1.5 transition-[filter,opacity] duration-150 ${isDailyExpanded ? "pb-10" : "pointer-events-none select-none blur-[1.5px] opacity-35"}`} aria-hidden={!isDailyExpanded}>
            <div className="mb-1 flex items-center justify-between px-1">
              <p className="text-xs font-bold">7일 예보</p>
              <p className="text-[10px] font-medium text-slate-400">최고 · 최저</p>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {city.dailyForecast.map((forecast, index) => {
              const forecastWeather = getWeatherPresentation(forecast.weatherCode, true, { windSpeed: forecast.windSpeedMax });
              const day = formatForecastDay(forecast.date, index);
              return (
                <div key={forecast.date} className="min-w-0 rounded-md px-0.5 py-1 text-center">
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
          {!isDailyExpanded && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-white/70 to-white" aria-hidden="true" />}
          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 36 }} className="absolute inset-x-0 bottom-1 z-10 mx-auto w-fit">
            <Button size="sm" variant="tertiary" onPress={() => onDailyExpandedChange(!isDailyExpanded)} className="!h-7 !min-h-7 rounded-full !px-2 !text-[9px] font-bold shadow-sm" aria-expanded={isDailyExpanded}>
              {isDailyExpanded ? "접기" : "7일 예보 더보기"}<ChevronDown size={11} className={isDailyExpanded ? "!size-3 rotate-180" : "!size-3"} aria-hidden="true" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="overflow-hidden rounded-3xl p-3" style={weatherSurfaceStyle} aria-busy="true" aria-label="날씨 정보를 불러오는 중">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="h-7 rounded-lg" />)}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-10 rounded-full" />
            <Skeleton className="h-2.5 w-20 rounded-full" />
          </div>
          <div className="mt-1 flex items-end gap-2">
            <Skeleton className="h-[42px] w-20 rounded-xl" />
            <Skeleton className="mb-1 h-3 w-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="size-11 rounded-full" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {[9, 16, 12, 12].map((width, item) => <Skeleton key={item} className={`h-3 rounded-full ${width === 16 ? "w-16" : width === 9 ? "w-9" : "w-12"}`} />)}
      </div>
      <div className="mt-1.5 min-h-4">
        <Skeleton className="h-3 w-44 rounded-full" />
      </div>

      <div className="mt-2.5 border-t border-slate-100 pt-2.5">
        <div className="mb-1 flex items-center justify-between">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-2.5 w-12 rounded-full" />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex h-[70px] min-w-0 flex-col items-center justify-between py-1">
              <Skeleton className="h-2.5 w-6 rounded-full" />
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-7 rounded-full" />
              <Skeleton className="h-2.5 w-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 border-t border-slate-100 pt-2.5">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </section>
  );
}

export function BeforeTripWeatherTicker() {
  const { data: cities, isPending, isError, refetch } = useWeather();
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!cities || cities.length < 2 || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % cities.length);
    }, 3_600);

    return () => window.clearInterval(intervalId);
  }, [cities, prefersReducedMotion]);

  if (isPending) {
    return (
      <section className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]" aria-busy="true" aria-label="여행지 날씨를 불러오는 중">
        <Skeleton className="h-4 flex-1 rounded-full" />
      </section>
    );
  }

  if (isError || !cities?.length) {
    return (
      <section className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]" aria-live="polite">
        <p className="text-[11px] font-semibold text-slate-500">날씨를 불러오지 못했어요.</p>
        <Button size="sm" variant="tertiary" className="!h-7 !min-h-7 !px-2 !text-[10px]" onPress={() => void refetch()}>재시도</Button>
      </section>
    );
  }

  const city = cities[currentIndex % cities.length];
  const weather = getWeatherPresentation(city.weatherCode, city.isDay, { windSpeed: city.windSpeed, time: city.observedAt, sunrise: city.sunrise, sunset: city.sunset });

  return (
    <section className="flex h-12 items-center gap-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]" aria-label="여행지 현재 날씨">
      <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-400">{formatCompactDate(cities[0].observedAt)}</span>
      <div className="relative h-7 min-w-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={city.id}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex min-w-0 items-center gap-1.5"
          >
            <WeatherIcon icon={weather.icon} size={17} className="shrink-0 text-sky-500" autoPlay aria-hidden="true" />
            <span className="shrink-0 text-xs font-bold text-slate-800">{city.city}</span>
            <span className="shrink-0 text-sm font-bold tracking-[-0.04em] text-slate-950">{city.temperature}°</span>
            <span className="min-w-0 truncate text-[10px] font-semibold text-slate-400">{weather.label}</span>
            <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-sky-500"><Droplets size={10} aria-hidden="true" />{city.nextSixHourPrecipitationProbability}%</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function TravelWeatherWidget() {
  const { data: cities, isPending, isError, isFetching, refetch } = useWeather();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isDailyExpanded, setIsDailyExpanded] = useState(false);

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

  return (
    <section className="relative overflow-hidden rounded-3xl p-3" style={weatherSurfaceStyle} aria-label="여행지 실시간 날씨">
      <div className="relative">
        <Tabs selectedKey={selectedCity.id} onSelectionChange={(key) => setSelectedCityId(String(key))} className="w-full">
          <CompactSegmentedTabsList
            ariaLabel="여행지 선택"
            items={cities.map((city) => {
            const cityWeather = getWeatherPresentation(city.weatherCode, city.isDay, { windSpeed: city.windSpeed, time: city.observedAt, sunrise: city.sunrise, sunset: city.sunset });
              return {
                id: city.id,
                label: (
                  <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap">
                  <WeatherIcon icon={cityWeather.icon} size={15} className="shrink-0 text-slate-400 group-data-[selected=true]:text-sky-500" aria-label={cityWeather.label} />
                  <span className="truncate text-[11px] font-semibold">{city.city}</span>
                  <span className="text-xs font-bold tracking-[-0.04em]">{city.temperature}°</span>
                  </span>
                ),
              };
            })}
          />
        </Tabs>
        <div className="mt-3">
          <WeatherDetails city={selectedCity} isRefreshing={isFetching} isDailyExpanded={isDailyExpanded} onDailyExpandedChange={setIsDailyExpanded} />
        </div>
      </div>
    </section>
  );
}
