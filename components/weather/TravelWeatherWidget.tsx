"use client";

import { RefreshCw, Umbrella } from "lucide-react";
import { getWeatherPresentation, useWeather } from "@/lib/weather";

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date(value));

function WeatherSkeleton() {
  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" aria-label="날씨 정보를 불러오는 중">
      <div className="mb-3 h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2].map((item) => <div key={item} className="h-36 min-w-[152px] animate-pulse rounded-2xl bg-white/80 dark:bg-slate-800/70" />)}
      </div>
    </section>
  );
}

export function TravelWeatherWidget() {
  const { data: cities, isPending, isError, isFetching, refetch } = useWeather();

  if (isPending) return <WeatherSkeleton />;

  if (isError || !cities?.length) {
    return (
      <section className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-live="polite">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">날씨 정보를 불러오지 못했어요.</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white active:scale-95 dark:bg-white dark:text-slate-900">
          <RefreshCw size={14} aria-hidden="true" />
          다시 시도
        </button>
      </section>
    );
  }

  const updatedAt = cities[0]?.observedAt;

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" aria-label="여행지 실시간 날씨">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">여행지 날씨</h2>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">현재 날씨와 6시간 비 예보</p>
        </div>
        {isFetching && <RefreshCw size={15} className="animate-spin text-sky-600" aria-label="날씨 갱신 중" />}
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
        {cities.map((city) => {
          const weather = getWeatherPresentation(city.weatherCode, city.isDay);
          const needsUmbrella = city.nextSixHourPrecipitationProbability >= 40;
          return (
            <article key={city.id} className="min-w-[156px] flex-1 snap-start rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-[0_4px_14px_-10px_rgba(14,116,144,0.7)] dark:border-slate-800 dark:bg-slate-900/90" aria-label={`${city.city}: ${weather.label}, ${city.temperature}도, 6시간 내 비 확률 ${city.nextSixHourPrecipitationProbability}%`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{city.city}</p>
                <span className="text-3xl leading-none" aria-hidden="true">{weather.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-black tracking-[-0.07em] text-slate-950 dark:text-white">{city.temperature}°</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{weather.label} · 체감 {city.apparentTemperature}°</p>
              <p className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${needsUmbrella ? "text-sky-700 dark:text-sky-300" : "text-slate-500 dark:text-slate-400"}`}>
                {needsUmbrella && <Umbrella size={13} aria-hidden="true" />}
                6시간 내 비 {city.nextSixHourPrecipitationProbability}%
              </p>
              {needsUmbrella && <p className="mt-1 text-[10px] font-semibold text-sky-600 dark:text-sky-300">우산을 챙기세요</p>}
            </article>
          );
        })}
      </div>

      {updatedAt && <p className="mt-1 px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">태국 기준 {formatUpdatedAt(updatedAt)} 업데이트</p>}
    </section>
  );
}
