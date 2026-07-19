import React from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Ban, BellRing, Check, ExternalLink, MapPin, CalendarDays, Clock3, Star, Wifi, Waves, Dumbbell, Luggage, Coffee, CircleParking, Flame, KeyRound, Snowflake, Sparkles, TreePine, Utensils, Plane, Shirt, Umbrella, Wine, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "../components/BottomNav";
import { ACCOMMODATIONS, type Accommodation } from "../lib/accommodations";

const amenityIconMap: Record<string, LucideIcon> = {
  "무료 Wi‑Fi": Wifi,
  "익스프레스 체크인": KeyRound,
  "짐 보관": Luggage,
  "에어컨": Snowflake,
  "야외 수영장": Waves,
  "피트니스": Dumbbell,
  "사우나": Flame,
  "무료 주차": CircleParking,
  "레스토랑": Utensils,
  "해변": Umbrella,
  "전망 수영장": Waves,
  "24시간 프런트": Clock3,
  "바": Wine,
  "공항 셔틀": Plane,
  "조식": Coffee,
  "세탁 서비스": Shirt,
  "룸서비스": BellRing,
  "일일 청소": Sparkles,
  "금연 객실": Ban,
  "조식 뷔페": Coffee,
  "스노클링": Waves,
  "등산로": MapPin,
  "정원": TreePine,
  "셔틀 서비스": Plane,
  "컨시어지": BellRing,
};
type StayFilter = "all" | Accommodation["id"];

const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

interface StayAccordionProps {
  activeFilter: StayFilter;
  onFilterChange: (filter: StayFilter) => void;
}

interface StayAccordionItem {
  id: StayFilter;
  title: string;
  label: string;
  imageUrl: string;
  description: string;
}

const STAY_ACCORDION_ITEMS: StayAccordionItem[] = [
  {
    id: "all",
    title: "전체",
    label: "ALL",
    imageUrl: ACCOMMODATIONS[0].imageUrl,
    description: "방콕 · 팟타야 · 코시창 · 예약한 숙소 3곳",
  },
  ...ACCOMMODATIONS.map((stay) => ({
    id: stay.id,
    title: stay.city,
    label: stay.date,
    imageUrl: stay.imageUrl,
    description: `${stay.name} · 체크인 ${stay.checkIn} · 체크아웃 ${stay.checkOut}`,
  })),
];

const StayAccordion: React.FC<StayAccordionProps> = ({ activeFilter, onFilterChange }) => {
  const [openId, setOpenId] = React.useState<StayFilter>("all");
  const { width } = useWindowSize();
  const accordionHeight = width && width >= 1024 ? 260 : 216;

  const selectStay = (item: StayAccordionItem) => {
    setOpenId(item.id);
    onFilterChange(item.id);
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-[#1C1C1E] dark:ring-white/10">
      <div
        className="flex flex-row overflow-hidden"
        style={{ height: accordionHeight }}
      >
        {STAY_ACCORDION_ITEMS.map((item) => {
          const isOpen = item.id === openId;
          const isFiltered = item.id === activeFilter;

          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => selectStay(item)}
                aria-pressed={isFiltered}
                className={`group relative z-10 flex w-14 shrink-0 flex-col justify-end gap-3 border-r border-gray-100 p-3 text-left transition-colors dark:border-white/10 lg:w-16 ${
                  isOpen
                    ? "bg-indigo-50 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-100"
                    : "bg-white text-gray-800 hover:bg-gray-50 dark:bg-[#1C1C1E] dark:text-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">{item.label}</span>
                <span className="text-sm font-semibold [writing-mode:vertical-rl]">{item.title}</span>
                <span className="pointer-events-none absolute bottom-1/2 right-0 size-3 translate-x-1/2 translate-y-1/2 rotate-45 border-r border-t border-gray-100 bg-inherit dark:border-white/10" />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key={item.id}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    exit={{ width: "0%" }}
                    transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.75 }}
                    className="relative flex h-full min-h-0 min-w-0 shrink items-end overflow-hidden bg-slate-950"
                    style={{ backgroundImage: `linear-gradient(180deg, transparent 32%, rgba(0,0,0,.7)), url(${item.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 18 }}
                      transition={{ delay: 0.12, duration: 0.2 }}
                      className="w-full bg-black/35 px-4 py-3 text-white backdrop-blur-sm"
                    >
                      <p className="text-sm font-bold">{item.title === "전체" ? "예약한 숙소" : item.title}</p>
                      <p className="mt-0.5 text-xs text-white/80">{item.description}</p>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export const AccommodationActivity: React.FC = () => {
  const [activeFilter, setActiveFilter] = React.useState<StayFilter>("all");
  const visibleStays = activeFilter === "all"
    ? ACCOMMODATIONS
    : ACCOMMODATIONS.filter((stay) => stay.id === activeFilter);

  return (
    <AppScreen appBar={{ title: "숙소 자세히 보기" }}>
      <div className="min-h-full bg-gray-50 px-4 pb-24 pt-4 dark:bg-black">
        <StayAccordion activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <div className="mt-5 flex flex-col gap-5">
          {visibleStays.map((stay) => (
            <article key={stay.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-[#1C1C1E] dark:ring-white/10">
              <div
                role="img"
                aria-label={`${stay.name} 대표 이미지`}
                className="relative h-48 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(0,0,0,.58)), url(${stay.imageUrl})` }}
              >
                <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {stay.date} · {stay.city}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">{stay.name}</p>
                    <p className="truncate text-xs text-white/80">{stay.englishName}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-sm font-bold backdrop-blur-sm"><Star size={14} fill="currentColor" /> {stay.score}</span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-2 dark:bg-white/[0.06]">
                  <div className="rounded-xl bg-white px-3 py-2.5 dark:bg-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400"><CalendarDays size={13} /> 체크인</span>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">{stay.dateLabel} · {stay.checkIn}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2.5 dark:bg-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400"><Clock3 size={13} /> 체크아웃</span>
                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">다음 날 · {stay.checkOut}</p>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10">
                  <iframe
                    title={`${stay.name} Google 지도`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(stay.mapQuery)}&output=embed`}
                    loading="lazy"
                    className="h-44 w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="px-3 py-2.5">
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400"><MapPin className="mr-1 inline text-indigo-500" size={13} />{stay.address}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.mapQuery)}`} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 transition-transform active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100">
                    Google 지도 <ExternalLink size={14} />
                  </a>
                  <a href={stay.agodaUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#5392f9] text-xs font-bold text-white transition-transform active:scale-[0.98]">
                    Agoda 예약 정보 <ExternalLink size={14} />
                  </a>
                </div>

                <section className="mt-5">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">편의시설 · 서비스</h2>
                  <div className="mt-3 columns-2 gap-x-5 sm:columns-3 lg:columns-4">
                    {stay.facilityGroups.map((group) => (
                      <section key={group.title} className="mb-5 break-inside-avoid">
                        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">{group.title}</h3>
                        <ul className="mt-2 space-y-2">
                          {group.items.map((item) => {
                            const Icon = amenityIconMap[item] ?? Check;
                            return (
                              <li key={item} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <Icon size={14} strokeWidth={1.7} className="shrink-0 text-gray-400 dark:text-gray-500" />
                                <span>{item}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>
                </section>

                <section className="mt-3 rounded-2xl border border-gray-100 p-3 dark:border-white/10">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"><Coffee size={14} /></span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-wide text-gray-400 dark:text-gray-500">식사 · 레스토랑</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">{stay.dining.primary}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                        {stay.dining.details.map((detail) => <span key={detail} className="text-xs text-gray-500 dark:text-gray-400">{detail}</span>)}
                      </div>
                    </div>
                  </div>
                </section>

                {stay.notice ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">{stay.notice}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
