"use client";

import { useEffect, useRef, useState } from "react";
import { Droplets, RefreshCw, Umbrella } from "lucide-react";
import { getWeatherPresentation, useWeather, type WeatherPresentation } from "@/lib/weather";
import { SunIcon } from "@/components/ui/sun";
import { MoonIcon } from "@/components/ui/moon";
import { CloudSunIcon } from "@/components/ui/cloud-sun";
import { CloudRainIcon } from "@/components/ui/cloud-rain";
import { CloudSnowIcon } from "@/components/ui/cloud-snow";
import { CloudLightningIcon } from "@/components/ui/cloud-lightning";

const weatherSurfaceStyle = {
  background: "linear-gradient(145deg, #3195e9 0%, #1768ce 54%, #0a3d98 100%)",
  boxShadow: "0 18px 38px -22px rgba(7, 48, 128, 0.8)",
  color: "#f8fbff",
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
}).format(new Date(value));

function WeatherSkeleton() {
  return (
    <section className="overflow-hidden rounded-[28px] p-5" style={weatherSurfaceStyle} aria-label="날씨 정보를 불러오는 중">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.32)" }} />
          <div className="h-5 w-16 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.22)" }} />
        </div>
        <div className="size-12 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.18)" }} />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="space-y-3">
          <div className="h-14 w-28 animate-pulse rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          <div className="h-3 w-36 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.22)" }} />
        </div>
        <div className="h-14 w-20 animate-pulse rounded-2xl" style={{ backgroundColor: "rgba(5,34,101,0.22)" }} />
      </div>
      <div className="mt-6 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
        <div className="mb-3 h-3 w-20 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-24 min-w-[66px] animate-pulse rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.16)" }} />)}
        </div>
      </div>
    </section>
  );
}

export function TravelWeatherWidget() {
  const { data: cities, isPending, isError, isFetching, refetch } = useWeather();
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

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
      <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-cyan-200/15 blur-2xl" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-white/70">THAILAND WEATHER</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{selectedCity.city}</h2>
            <p className="mt-1 text-xs font-medium text-white/75">태국 기준 {formatUpdatedAt(selectedCity.observedAt)} 업데이트</p>
          </div>
          {isFetching ? <RefreshCw size={16} className="animate-spin text-white/80" aria-label="날씨 갱신 중" /> : <WeatherIcon icon={weather.icon} size={48} aria-label={weather.label} />}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-6xl font-light leading-none tracking-[-0.08em]">{selectedCity.temperature}°</p>
            <p className="mt-2 text-sm font-semibold text-white/90">{weather.label} · 체감 {selectedCity.apparentTemperature}°</p>
          </div>
          <div className={`rounded-2xl border px-3 py-2 text-right backdrop-blur-md ${needsUmbrella ? "border-white/30 bg-white/20" : "border-white/15 bg-slate-950/10"}`}>
            <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-white/90"><Droplets size={13} aria-hidden="true" />6시간 내 비</p>
            <p className="mt-0.5 text-lg font-bold">{selectedCity.nextSixHourPrecipitationProbability}%</p>
          </div>
        </div>

        {needsUmbrella && <p className="mt-4 flex items-center gap-1.5 rounded-2xl bg-slate-950/15 px-3 py-2 text-xs font-semibold text-white/95"><Umbrella size={14} aria-hidden="true" />우산을 챙기세요. 비 예보가 있어요.</p>}

        <div className="mt-5 border-t border-white/20 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold">시간대별 예보</p>
            <p className="text-[10px] font-medium text-white/70">다음 6시간</p>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {selectedCity.hourlyForecast.map((forecast) => {
              const forecastWeather = getWeatherPresentation(forecast.weatherCode, forecast.isDay);
              return (
                <div key={forecast.time} className="min-w-[66px] snap-start rounded-2xl bg-white/12 px-2 py-2.5 text-center backdrop-blur-sm">
                  <p className="text-[10px] font-semibold text-white/75">{formatForecastHour(forecast.time)}시</p>
                  <WeatherIcon icon={forecastWeather.icon} size={20} className="mx-auto mt-1" aria-label={forecastWeather.label} />
                  <p className="mt-1 text-sm font-bold">{forecast.temperature}°</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-cyan-100">{forecast.precipitationProbability}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative mt-4 -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" aria-label="도시 선택">
        {cities.map((city) => {
          const cityWeather = getWeatherPresentation(city.weatherCode, city.isDay);
          const isSelected = city.id === selectedCity.id;
          return (
            <button key={city.id} type="button" onClick={() => setSelectedCityId(city.id)} aria-pressed={isSelected} className={`min-w-[106px] snap-start rounded-2xl border px-3 py-2.5 text-left backdrop-blur-md transition duration-200 active:scale-[0.97] ${isSelected ? "border-white/70 bg-white/25 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.7)]" : "border-white/15 bg-slate-950/10"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">{city.city}</span>
                <WeatherIcon icon={cityWeather.icon} size={18} aria-label={cityWeather.label} />
              </div>
              <p className="mt-1 text-lg font-semibold tracking-[-0.05em]">{city.temperature}°</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
