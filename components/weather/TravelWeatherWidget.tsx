"use client";

import { useState } from "react";
import { Droplets, RefreshCw, Umbrella } from "lucide-react";
import { getWeatherPresentation, useWeather } from "@/lib/weather";

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
    <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#2787de] via-[#175fc1] to-[#0d3a8e] p-5 shadow-[0_18px_38px_-22px_rgba(7,48,128,0.8)]" aria-label="날씨 정보를 불러오는 중">
      <div className="mb-5 h-4 w-28 animate-pulse rounded bg-white/20" />
      <div className="h-24 animate-pulse rounded-3xl bg-white/15" />
      <div className="mt-4 flex gap-2 overflow-hidden">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 min-w-[70px] animate-pulse rounded-2xl bg-white/10" />)}
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
      <section className="rounded-[28px] bg-gradient-to-br from-[#2787de] via-[#175fc1] to-[#0d3a8e] p-5 text-center text-white shadow-[0_18px_38px_-22px_rgba(7,48,128,0.8)]" aria-live="polite">
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
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3195e9] via-[#1768ce] to-[#0a3d98] p-5 text-white shadow-[0_18px_38px_-22px_rgba(7,48,128,0.8)]" aria-label="여행지 실시간 날씨">
      <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-48 rounded-full bg-cyan-200/15 blur-2xl" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-white/70">THAILAND WEATHER</p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{selectedCity.city}</h2>
            <p className="mt-1 text-xs font-medium text-white/75">태국 기준 {formatUpdatedAt(selectedCity.observedAt)} 업데이트</p>
          </div>
          {isFetching ? <RefreshCw size={16} className="animate-spin text-white/80" aria-label="날씨 갱신 중" /> : <span className="text-5xl leading-none" aria-hidden="true">{weather.icon}</span>}
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
                  <span className="mt-1 block text-xl" aria-label={forecastWeather.label}>{forecastWeather.icon}</span>
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
                <span className="text-lg leading-none" aria-hidden="true">{cityWeather.icon}</span>
              </div>
              <p className="mt-1 text-lg font-semibold tracking-[-0.05em]">{city.temperature}°</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
