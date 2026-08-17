import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
import { AnimatedContent } from "../components/ui/animated-content";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Tabs } from "@heroui/react";
import { ChevronRight, Hotel } from "lucide-react";
import { MinimalCardExpand } from "../components/ui/minimal-card-expand";
import { ACCOMMODATIONS, type Accommodation } from "../lib/accommodations";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { NativeHapticSwitch } from "../components/ui/native-haptic-switch";
import { SlidingNumber } from "../components/core/sliding-number";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { FlightWidget } from "../components/flight/FlightWidget";
import { useQuery } from "@tanstack/react-query";
import { ChecklistBattleCard } from "../components/checklist/ChecklistBattleCard";
import { fetchChecklist, getChecklistBattleStats, type PreparationItem } from "../lib/checklist";
import { BeforeTripWeatherTicker, TravelWeatherWidget } from "../components/weather/TravelWeatherWidget";
import { CompactSegmentedTabsList } from "../components/ui/compact-segmented-tabs";

dayjs.extend(utc);
dayjs.extend(timezone);

const ROLL_STAGGER = 0.035;

type TravelClockProps = {
  city: string;
  zone: string;
  flagCode: string;
};

const ClockSeparator = () => (
  <span className="flex h-[1.12em] w-[3px] shrink-0 flex-col items-center justify-center gap-[3px]" aria-hidden="true">
    <span className="size-[2px] rounded-full bg-slate-400 dark:bg-slate-500" />
    <span className="size-[2px] rounded-full bg-slate-400 dark:bg-slate-500" />
  </span>
);

const TravelClock: React.FC<TravelClockProps> = ({ city, zone, flagCode }) => {
  const [now, setNow] = useState(() => dayjs().tz(zone));

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(dayjs().tz(zone)), 1_000);
    return () => window.clearInterval(timer);
  }, [zone]);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <Avatar className="size-4 shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <AvatarImage src={`https://flagcdn.com/w80/${flagCode.toLowerCase()}.png`} alt={`${city} 국기`} />
        <AvatarFallback>{flagCode}</AvatarFallback>
      </Avatar>
      <span className="flex shrink-0 flex-col leading-none">
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{city}</span>
        <span className="mt-0.5 text-[9px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {now.format("YYYY.MM.DD")}
        </span>
      </span>
      <div
        className="ml-auto shrink-0 text-right text-[13px] font-bold tracking-[-0.035em] text-slate-900 dark:text-white"
        style={{ fontFamily: "var(--font-geist-mono)", fontVariantNumeric: "tabular-nums" }}
      >
        <div className="flex h-4 items-center gap-[2px]" aria-hidden="true">
          <SlidingNumber value={now.hour()} padStart className="!gap-0" />
          <ClockSeparator />
          <SlidingNumber value={now.minute()} padStart className="!gap-0" />
          <ClockSeparator />
          <SlidingNumber value={now.second()} padStart className="!gap-0" />
        </div>
        <span className="sr-only">{city} 현재 시각 {now.format("HH시 mm분 ss초")}</span>
      </div>
    </div>
  );
};

const WorldClockCard: React.FC = () => (
  <section className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-2 py-1 shadow-[0_6px_18px_-18px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90" aria-label="한국과 태국의 현재 시각">
    <div className="flex gap-2 px-2 py-1.5">
      <TravelClock city="서울" zone="Asia/Seoul" flagCode="KR" />
      <div className="w-px self-stretch bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
      <TravelClock city="방콕" zone="Asia/Bangkok" flagCode="TH" />
    </div>
  </section>
);

const useAutomaticRoll = (itemCount: number) => {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    if (prefersReducedMotion || itemCount < 2) {
      controls.set("initial");
      return;
    }

    let cancelled = false;
    let timer: number | null = null;
    const wait = (duration: number) => new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, duration);
    });

    const play = async () => {
      await wait(2_000);
      while (!cancelled) {
        await controls.start("rolled");
        if (cancelled) return;
        await wait(3_800);
        controls.set("initial");
        setCurrentIndex((index) => (index + 1) % itemCount);
        await wait(80);
      }
    };

    void play();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [controls, itemCount, prefersReducedMotion]);

  return { controls, currentIndex };
};

type AutomaticRoll = ReturnType<typeof useAutomaticRoll>;

const AutoTextRoll: React.FC<{ labels: readonly string[] } & AutomaticRoll> = ({ labels, controls, currentIndex }) => {
  const currentLabel = labels[currentIndex] ?? "숙소 자세히 보기";
  const nextLabel = labels[(currentIndex + 1) % labels.length] ?? currentLabel;

  return (
    <motion.span
      aria-hidden="true"
      initial="initial"
      animate={controls}
      className="relative block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-center leading-none"
    >
      <span className="block">
        {currentLabel.split("").map((letter, index) => {
          const delay = ROLL_STAGGER * Math.abs(index - (currentLabel.length - 1) / 2);
          return (
            <motion.span
              key={index}
              variants={{ initial: { y: 0 }, rolled: { y: "100%" } }}
              transition={{ ease: "easeInOut", duration: 0.38, delay }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          );
        })}
      </span>
      <span className="absolute inset-0 block">
        {nextLabel.split("").map((letter, index) => {
          const delay = ROLL_STAGGER * Math.abs(index - (nextLabel.length - 1) / 2);
          return (
            <motion.span
              key={index}
              variants={{ initial: { y: "-100%" }, rolled: { y: 0 } }}
              transition={{ ease: "easeInOut", duration: 0.38, delay }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
};

const AutoImageRoll: React.FC<{ imageUrls: readonly (string | null)[] } & AutomaticRoll> = ({ imageUrls, controls, currentIndex }) => {
  const currentImageUrl = imageUrls[currentIndex] ?? null;
  const nextImageUrl = imageUrls[(currentIndex + 1) % imageUrls.length] ?? currentImageUrl;
  const imageStyle = (imageUrl: string | null) => imageUrl
    ? { backgroundImage: `linear-gradient(90deg, rgba(20, 30, 66, 0.6), rgba(20, 30, 66, 0.32)), url(${imageUrl})` }
    : undefined;

  return (
    <motion.span
      aria-hidden="true"
      initial="initial"
      animate={controls}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.span
        variants={{ initial: { y: 0 }, rolled: { y: "-100%" } }}
        transition={{ ease: "easeInOut", duration: 0.72 }}
        className="absolute inset-0 bg-cover bg-center"
        style={imageStyle(currentImageUrl)}
      />
      <motion.span
        variants={{ initial: { y: "100%" }, rolled: { y: 0 } }}
        transition={{ ease: "easeInOut", duration: 0.72 }}
        className="absolute inset-0 bg-cover bg-center"
        style={imageStyle(nextImageUrl)}
      />
    </motion.span>
  );
};

type StaySelection = "all" | Accommodation["id"];

const ReservationStayCard: React.FC<{ onOpen: (stayId: StaySelection) => void }> = ({ onOpen }) => {
  const automaticRoll = useAutomaticRoll(ACCOMMODATIONS.length + 1);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><Hotel size={17} /></span>
          <div>
            <p className="text-sm font-bold text-gray-900">HP!</p>
            <p className="text-[11px] text-gray-400">8/29–9/1 · 3곳</p>
          </div>
        </div>
        <DotLottieReact
          src="/reservation-heart.lottie"
          autoplay
          loop
          aria-hidden="true"
          className="size-11 shrink-0"
        />
      </div>

      <MinimalCardExpand
        className="h-[300px]"
        onExpandedClick={(id) => onOpen(id === "stay-summary" ? "all" : id as Accommodation["id"])}
        items={[
          {
            id: ACCOMMODATIONS[0].id,
            title: ACCOMMODATIONS[0].city,
            value: `${ACCOMMODATIONS[0].date} · ${ACCOMMODATIONS[0].checkIn}`,
            colorClassName: "bg-slate-800",
            imageUrl: ACCOMMODATIONS[0].imageUrl,
            expandedActions: {
              primary: <span className="max-w-44 truncate text-sm font-semibold">{ACCOMMODATIONS[0].name}</span>,
              secondary: <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold">체크아웃 {ACCOMMODATIONS[0].checkOut}</span>,
            },
          },
          {
            id: ACCOMMODATIONS[1].id,
            title: ACCOMMODATIONS[1].city,
            value: `${ACCOMMODATIONS[1].date} · ${ACCOMMODATIONS[1].checkIn}`,
            colorClassName: "bg-slate-800",
            imageUrl: ACCOMMODATIONS[1].imageUrl,
            expandedActions: {
              primary: <span className="max-w-44 truncate text-sm font-semibold">{ACCOMMODATIONS[1].name}</span>,
              secondary: <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold">체크아웃 {ACCOMMODATIONS[1].checkOut}</span>,
            },
          },
          {
            id: ACCOMMODATIONS[2].id,
            title: ACCOMMODATIONS[2].city,
            value: `${ACCOMMODATIONS[2].date} · ${ACCOMMODATIONS[2].checkIn}`,
            colorClassName: "bg-slate-800",
            imageUrl: ACCOMMODATIONS[2].imageUrl,
            expandedActions: {
              primary: <span className="max-w-44 truncate text-sm font-semibold">{ACCOMMODATIONS[2].name}</span>,
              secondary: <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold">체크아웃 {ACCOMMODATIONS[2].checkOut}</span>,
            },
          },
          {
            id: "stay-summary",
            title: "숙소 전체",
            value: "3곳 예약 완료",
            icon: <Hotel size={24} aria-hidden="true" />,
            colorClassName: "bg-indigo-600",
            imageUrl: "/accommodation-overview.jpg",
            expandedActions: {
              primary: <span className="text-sm font-semibold">8월 29일 – 9월 1일</span>,
              secondary: <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold">3박 4일</span>,
            },
          },
        ]}
      />

      <div className="group relative mt-3">
        <div aria-hidden="true" className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-sm font-bold text-white transition-transform duration-150 ease-out group-active:scale-[0.98]">
          <AutoImageRoll imageUrls={["/accommodation-overview.jpg", ...ACCOMMODATIONS.map((stay) => stay.imageUrl)]} {...automaticRoll} />
          <span className="relative z-10 flex w-64 max-w-[calc(100%-1rem)] items-center gap-1 drop-shadow-sm">
            <AutoTextRoll labels={["HP! 위치 찾기!", ...ACCOMMODATIONS.map((stay) => stay.name)]} {...automaticRoll} />
            <ChevronRight size={17} className="shrink-0" />
          </span>
        </div>
        <NativeHapticSwitch
          ariaLabel="HP! 위치 찾기"
          checked={false}
          onClick={() => {
            triggerHapticFeedback(15);
            onOpen("all");
          }}
          onChange={() => undefined}
        />
      </div>
    </section>
  );
};

const BangkokDepartureCard: React.FC = () => {
  const DEPARTURE_TIME = "2026-08-29 09:45:00";
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs().tz("Asia/Seoul");
      const target = dayjs.tz(DEPARTURE_TIME, "Asia/Seoul");
      const diffSec = Math.max(0, target.diff(now, "second"));

      const days = Math.floor(diffSec / (24 * 3600));
      const hours = Math.floor((diffSec % (24 * 3600)) / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ fontFamily: "var(--font-korean-air)" }} className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F8FAFC] text-slate-900 shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      {/* Side Ticket Cutouts */}
      <div className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 z-10" aria-hidden="true" />
      <div className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 z-10" aria-hidden="true" />

      {/* Ticket Header Bar - Korean Air Deep Blue */}
      <AnimatedContent distance={20} direction="vertical" duration={0.6} delay={0.05} className="w-full">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-[#00256C] px-4 py-2.5 text-white sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300 sm:text-[11px] sm:tracking-widest">
              BOARDING PASS
            </span>
            <span className="shrink-0 text-[10px] font-mono text-blue-200/70 tabular-nums">KE657</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-bold sm:gap-1.5 sm:text-xs">
            <span>인천 ICN</span>
            <span className="text-cyan-400" aria-hidden="true">✈️</span>
            <span>방콕 BKK</span>
          </div>
        </div>
      </AnimatedContent>

      <div className="p-5 flex flex-col gap-4">
        {/* Departure Time & Flight Info */}
        <AnimatedContent distance={25} direction="vertical" duration={0.6} delay={0.15}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200/60 pb-3 dark:border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">출발일시</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">2026.08.29 (토) 09:45</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">항공편</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">대한항공 A330-300</p>
            </div>
          </div>
        </AnimatedContent>

        {/* Center Main D-Day Hero */}
        <AnimatedContent distance={30} direction="vertical" duration={0.7} delay={0.25}>
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#00256C] dark:text-cyan-400 mb-1">
              WRRRRRRRRRYYYYYYYYYYYYYYYYY!!!!!
            </span>
            <div
              className="font-black text-6xl tracking-tighter text-[#00256C] dark:text-cyan-400"
              style={{ fontFamily: "var(--font-korean-air)" }}
            >
              <NumberFlow value={timeLeft.days} prefix="D-" />
            </div>

            {/* Realtime Rolling Clock */}
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-slate-200/60 px-4 py-1.5 font-mono text-sm font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <NumberFlow value={timeLeft.hours} format={{ minimumIntegerDigits: 2 }} />
              <span className="text-blue-600 dark:text-cyan-400 font-extrabold animate-pulse">:</span>
              <NumberFlow value={timeLeft.minutes} format={{ minimumIntegerDigits: 2 }} />
              <span className="text-blue-600 dark:text-cyan-400 font-extrabold animate-pulse">:</span>
              <NumberFlow value={timeLeft.seconds} format={{ minimumIntegerDigits: 2 }} />
              <span className="ml-1 text-[10px] font-sans font-bold text-[#00256C] dark:text-cyan-400">밖에 안 남았습니다만!?</span>
            </div>
          </div>
        </AnimatedContent>

        {/* Ticket Perforated Dashed Line */}
        <AnimatedContent distance={15} direction="vertical" duration={0.5} delay={0.35}>
          <div className="relative my-1">
            <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-700" aria-hidden="true" />
          </div>
        </AnimatedContent>

        {/* Bottom Ticket Barcode & Passenger Section */}
        <AnimatedContent distance={25} direction="vertical" duration={0.6} delay={0.45}>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">승객</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">내 가현짱. ❤️ 내 멍멍이.</p>
            </div>

            {/* Ticket Barcode Graphic */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex h-6 items-center gap-[1.5px]" aria-hidden="true">
                <div className="h-full w-[2px] bg-slate-800 dark:bg-slate-200" />
                <div className="h-full w-[1px] bg-transparent" />
                <div className="h-full w-[2px] bg-slate-800 dark:bg-slate-200" />
                <div className="h-full w-[2px] bg-transparent" />
                {[1, 0, 3, 1, 0, 5, 2, 7, 0, 8, 3, 1].map((digit, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className="h-full bg-slate-800 dark:bg-slate-200"
                      style={{ width: `${Math.max(1.5, ((digit % 4) + 1) * 1.5)}px` }}
                    />
                    <div
                      className="h-full bg-transparent"
                      style={{ width: `${((idx % 3) + 1) * 1.2}px` }}
                    />
                  </React.Fragment>
                ))}
                <div className="h-full w-[2px] bg-slate-800 dark:bg-slate-200" />
                <div className="h-full w-[1px] bg-transparent" />
                <div className="h-full w-[2px] bg-slate-800 dark:bg-slate-200" />
              </div>
              <span className="font-mono text-[9.5px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.18em]">
                1031 · 0527 · 0831
              </span>
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
};

export const HomeActivity: React.FC = () => {
  const { push, replace } = useFlow();
  const [tripState, setTripState] = useState<"before" | "during" | "after">("before");
  const {
    data: checklistItems = [],
    isLoading: isChecklistLoading,
    isError: isChecklistError,
    refetch: refetchChecklist,
  } = useQuery<PreparationItem[]>({
    queryKey: ["checklist"],
    queryFn: fetchChecklist,
  });
  const checklistBattleStats = getChecklistBattleStats(checklistItems);

  return (
    <AppScreen appBar={{ title: "태국 여행 2026" }}>
      <div className="flex flex-col min-h-full w-full pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] overflow-y-auto">
        <WorldClockCard />
        <Tabs
          className="w-full"
          onSelectionChange={(key) => setTripState(String(key) as typeof tripState)}
          selectedKey={tripState}
        >
          <CompactSegmentedTabsList
            ariaLabel="여행 단계"
            className="px-4 pb-3 pt-2"
            listClassName="mx-auto max-w-sm"
            items={[
              { id: "before", label: "여행 전" },
              { id: "during", label: "여행 중" },
              { id: "after", label: "여행 후" },
            ]}
          />

          <div className="flex flex-col gap-6 p-4">
            <Tabs.Panel className="!p-0" id="before">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <BeforeTripWeatherTicker />

              <BangkokDepartureCard />

              <ChecklistBattleCard
                stats={checklistBattleStats}
                isLoading={isChecklistLoading}
                isError={isChecklistError}
                onOpen={() => replace("ChecklistActivity", {}, { animate: false })}
                onRetry={() => void refetchChecklist()}
              />

              <FlightWidget onOpen={(passengerId) => push("FlightActivity", { passengerId })} />

              <ReservationStayCard onOpen={(stayId) => push("AccommodationActivity", { stayId })} />
            </motion.div>
            </Tabs.Panel>

            <Tabs.Panel className="!p-0" id="during">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <TravelWeatherWidget />

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => replace("ScheduleActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">📅</span>
                  <span className="font-semibold">오늘의 일정</span>
                </button>
                <button onClick={() => replace("DictionaryActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">🗣️</span>
                  <span className="font-semibold">태국어 회화</span>
                </button>
              </div>

              <button onClick={() => push("ExpenseActivity", {})} className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left shadow-sm transition-transform active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">여행 가계부</h3>
                  <p className="mt-0.5 text-sm text-slate-500">지출 등록 · 통계 · 자동 정산</p>
                </div>
                <span className="text-2xl" aria-hidden="true">🧾</span>
              </button>

              <button onClick={() => push("ExchangeActivity", {})} className="p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-200 dark:border-green-800 flex justify-between items-center active:scale-95 transition-transform">
                <div>
                  <h3 className="font-bold">빠른 환율 계산</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">100바트 ≈ 3,800원</p>
                </div>
                <span className="text-2xl">👉</span>
              </button>

              <FlightWidget onOpen={(passengerId) => push("FlightActivity", { passengerId })} />

              <ReservationStayCard onOpen={(stayId) => push("AccommodationActivity", { stayId })} />
            </motion.div>
            </Tabs.Panel>

            <Tabs.Panel className="!p-0" id="after">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-2xl p-6 text-center">
                <span className="text-4xl">✈️</span>
                <h2 className="text-xl font-bold mt-2">여행 끝! 일상으로</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">3박 4일의 방콕 여행 어떠셨나요?</p>
              </div>

              <button onClick={() => push("DiscoverActivity", {})} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex justify-between items-center active:scale-95 transition-transform">
                <div>
                  <h3 className="font-bold">내 쇼핑 리스트 복기</h3>
                  <p className="text-sm text-gray-500">다 못 산 아이템이 있는지 확인해보세요</p>
                </div>
                <span className="text-2xl">🛍️</span>
              </button>
            </motion.div>
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
