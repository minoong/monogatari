import React, { useState } from "react";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import NeumorphButton from "../components/ui/neumorph-button";
import { ChevronRight, Hotel } from "lucide-react";
import { MinimalCardExpand } from "../components/ui/minimal-card-expand";
import { ACCOMMODATIONS } from "../lib/accommodations";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { NativeHapticSwitch } from "../components/ui/native-haptic-switch";
import { SlidingNumber } from "../components/core/sliding-number";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

dayjs.extend(utc);
dayjs.extend(timezone);

const ROLL_STAGGER = 0.035;

type TravelClockProps = {
  city: string;
  zone: string;
  flagCode: string;
};

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
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{city}</span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-[-0.01em] text-slate-500 dark:text-slate-400">
          {now.format("YYYY.MM.DD")}
        </span>
      </span>
      <div
        className="ml-auto shrink-0 text-right text-sm font-semibold tracking-[-0.05em] text-slate-950 dark:text-white"
        style={{ fontFamily: "var(--font-geist-mono)", fontVariantNumeric: "tabular-nums slashed-zero" }}
        aria-label={`${city} 현재 시각 ${now.format("HH시 mm분 ss초")}`}
      >
        <div className="flex items-center gap-px">
          <SlidingNumber value={now.hour()} padStart />
          <span className="text-slate-300 dark:text-slate-600">:</span>
          <SlidingNumber value={now.minute()} padStart />
          <span className="text-slate-300 dark:text-slate-600">:</span>
          <SlidingNumber value={now.second()} padStart />
        </div>
      </div>
    </div>
  );
};

const WorldClockCard: React.FC = () => (
  <section className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-2 py-1 shadow-[0_6px_18px_-18px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90" aria-label="한국과 태국의 현재 시각">
    <div className="flex gap-2 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-900">
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

const ReservationStayCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
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
      autoCycle
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
          onOpen();
        }}
        onChange={() => undefined}
      />
    </div>
  </section>
  );
};

export const HomeActivity: React.FC = () => {
  const { push, replace } = useFlow();
  const [tripState, setTripState] = useState<"before" | "during" | "after">("before");

  return (
    <AppScreen appBar={{ title: "태국 여행 2026" }}>
      <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
        <WorldClockCard />
        {/* State Toggle for Mockup */}
        <div className="flex justify-center gap-2 p-4 bg-muted/30 border-b">
          <NeumorphButton intent={tripState === "before" ? "primary" : "secondary"} size="small" onClick={() => setTripState("before")}>여행 전</NeumorphButton>
          <NeumorphButton intent={tripState === "during" ? "primary" : "secondary"} size="small" onClick={() => setTripState("during")}>여행 중</NeumorphButton>
          <NeumorphButton intent={tripState === "after" ? "primary" : "secondary"} size="small" onClick={() => setTripState("after")}>여행 후</NeumorphButton>
        </div>

        <div className="flex flex-col gap-6 p-4 pb-28">
          {tripState === "before" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-2xl p-6 text-center">
                <h2 className="text-xl font-bold mb-1">방콕 출발까지</h2>
                <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">D-14</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => replace("ChecklistActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">📝</span>
                  <span className="font-semibold">준비물 리스트</span>
                </button>
                <button onClick={() => push("ExchangeActivity", {})} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">💱</span>
                  <span className="font-semibold">환율 계산기</span>
                </button>
              </div>

              <ReservationStayCard onOpen={() => push("AccommodationActivity", {})} />

              <button onClick={() => push("DiscoverActivity", {})} className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-2xl border border-orange-200 dark:border-orange-800 text-left active:scale-95 transition-transform">
                <h3 className="font-bold text-lg">태국 맛집 & 쇼핑 추천 🇹🇭</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">세븐일레븐 필수 간식부터 야시장 맛집까지</p>
              </button>
            </motion.div>
          )}

          {tripState === "during" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold">방콕 (실시간)</h2>
                    <p className="text-3xl font-extrabold mt-1">32°C <span className="text-xl font-normal">맑음</span></p>
                  </div>
                  <span className="text-5xl">☀️</span>
                </div>
                <p className="text-sm mt-3 bg-white/20 p-2 rounded-lg">오후 3시경 소나기(스콜) 예보가 있어요! 우산을 챙기세요 ☔️</p>
              </div>

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
              
              <button onClick={() => push("ExchangeActivity", {})} className="p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-200 dark:border-green-800 flex justify-between items-center active:scale-95 transition-transform">
                <div>
                  <h3 className="font-bold">빠른 환율 계산</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">100바트 ≈ 3,800원</p>
                </div>
                <span className="text-2xl">👉</span>
              </button>

              <ReservationStayCard onOpen={() => push("AccommodationActivity", {})} />
            </motion.div>
          )}

          {tripState === "after" && (
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
          )}
        </div>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
