import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Button, Chip } from "@heroui/react";
import {
  ArrowLeftRight,
  CircleHelp,
  Clock,
  Compass,
  HeartPulse,
  MapPin,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Utensils,
  Volume2,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { matchKoreanSearch, PhraseItem, THAI_PHRASES } from "@/lib/phrases";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { GooeyInput } from "@/components/ui/gooey-input";
import { ScrambleText } from "@/components/ui/scramble-text";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import { cn } from "@/lib/utils";

const RECENT_SEARCHES_KEY = "monogatari_recent_phrase_searches";
const MAX_RECENT_SEARCHES = 8;
const SEARCH_BAR_HEIGHT = 40;
const SEARCH_BAR_GAP = 12;

const CATEGORY_META = {
  기본: {
    icon: Sparkles,
    label: "필수기본",
    railClass: "bg-amber-50 text-amber-800 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/70",
    activeClass: "bg-amber-400 text-amber-950 shadow-amber-400/25",
    stripClass: "bg-amber-400",
    panelClass: "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/70 dark:bg-amber-950/25",
  },
  이동: {
    icon: MapPin,
    label: "이동",
    railClass: "bg-teal-50 text-teal-800 ring-teal-200/80 dark:bg-teal-950/40 dark:text-teal-200 dark:ring-teal-800/70",
    activeClass: "bg-teal-500 text-white shadow-teal-500/25",
    stripClass: "bg-teal-500",
    panelClass: "border-teal-200/80 bg-teal-50/80 dark:border-teal-900/70 dark:bg-teal-950/25",
  },
  식당: {
    icon: Utensils,
    label: "식당",
    railClass: "bg-orange-50 text-orange-800 ring-orange-200/80 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-800/70",
    activeClass: "bg-orange-500 text-white shadow-orange-500/25",
    stripClass: "bg-orange-500",
    panelClass: "border-orange-200/80 bg-orange-50/80 dark:border-orange-900/70 dark:bg-orange-950/25",
  },
  쇼핑: {
    icon: ShoppingBag,
    label: "쇼핑",
    railClass: "bg-rose-50 text-rose-800 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800/70",
    activeClass: "bg-rose-500 text-white shadow-rose-500/25",
    stripClass: "bg-rose-500",
    panelClass: "border-rose-200/80 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/25",
  },
  마사지: {
    icon: HeartPulse,
    label: "마사지",
    railClass: "bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/70",
    activeClass: "bg-emerald-500 text-white shadow-emerald-500/25",
    stripClass: "bg-emerald-500",
    panelClass: "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/70 dark:bg-emerald-950/25",
  },
  긴급: {
    icon: CircleHelp,
    label: "긴급",
    railClass: "bg-red-50 text-red-800 ring-red-200/80 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/70",
    activeClass: "bg-red-500 text-white shadow-red-500/25",
    stripClass: "bg-red-500",
    panelClass: "border-red-200/80 bg-red-50/80 dark:border-red-900/70 dark:bg-red-950/25",
  },
} as const satisfies Record<PhraseItem["category"], {
  icon: typeof Sparkles;
  label: string;
  railClass: string;
  activeClass: string;
  stripClass: string;
  panelClass: string;
}>;

const CATEGORY_FILTERS = ["전체", "기본", "이동", "식당", "쇼핑", "마사지", "긴급"] as const;

// 태국어 텍스트 시원하고 큼직한 가변 폰트 크기 계산 (항상 현지인이 잘 보이도록 대형 유지)
const getDynamicThaiFontSize = (text: string) => {
  const len = text.length;
  if (len <= 14) return "text-4xl sm:text-5xl font-semibold";
  return "text-3xl sm:text-4xl font-semibold";
};

function DictionaryPhraseDialog({
  item,
  index,
  meta,
  prefersReducedMotion,
  shouldScramble,
  onOpen,
  onPlayAudio,
}: {
  item: PhraseItem;
  index: number;
  meta: (typeof CATEGORY_META)[PhraseItem["category"]];
  prefersReducedMotion: boolean | null;
  shouldScramble: boolean;
  onOpen: () => void;
  onPlayAudio: (text: string, event?: React.MouseEvent | unknown) => void;
}) {
  const [isRotated, setIsRotated] = useState(true);
  const [shouldScrambleOnMount] = useState(shouldScramble);

  return (
    <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
      <article
        data-dictionary-entry
        className="group relative flex gap-3 border-b border-slate-200/80 px-5 py-4 last:border-b-0 dark:border-slate-800/80"
      >
        <span className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", meta.stripClass)} />
        <span className="pt-0.5 text-[11px] font-black tabular-nums text-slate-300 dark:text-slate-600">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1" onClickCapture={onOpen}>
          <MorphingDialogTrigger
            ariaLabel={`${item.ko} 현지인에게 크게 보여주기`}
            className="block w-full text-left outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <div className="flex min-w-0 items-center gap-2">
              <MorphingDialogTitle className="min-w-0">
                <ScrambleText
                  text={item.ko}
                  delay={620 + index * 95}
                  duration={440}
                  enabled={shouldScrambleOnMount}
                  className="block truncate text-sm font-black text-slate-800 dark:text-slate-100"
                />
              </MorphingDialogTitle>
              <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black", meta.railClass)}>{meta.label}</span>
            </div>
            <MorphingDialogDescription disableLayoutAnimation className="block">
              <ScrambleText
                text={item.th}
                delay={675 + index * 95}
                  duration={500}
                  enabled={shouldScrambleOnMount}
                className="mt-1 block font-thai text-2xl font-semibold leading-tight text-slate-950 dark:text-white"
              />
              <ScrambleText
                text={`🗣️ ${item.pron}`}
                delay={725 + index * 95}
                  duration={470}
                  enabled={shouldScrambleOnMount}
                className="mt-1 block text-xs font-bold text-orange-600 dark:text-orange-400"
              />
            </MorphingDialogDescription>
          </MorphingDialogTrigger>
        </div>
        <div className="flex shrink-0 flex-col gap-1 pt-0.5">
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            aria-label="발음 듣기"
            onPress={(event) => onPlayAudio(item.th, event)}
            className="size-8 rounded-xl text-orange-600 dark:text-orange-400"
          >
            <Volume2 className="size-4" />
          </Button>
        </div>
      </article>

      <MorphingDialogContainer>
        <MorphingDialogContent className="relative mx-4 flex h-[82dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_32px_90px_-28px_rgba(15,23,42,0.28)]">
          <motion.div
            className="flex items-center justify-between border-b border-slate-100 pb-3"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -14, scaleX: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.12, duration: prefersReducedMotion ? 0 : 0.24, ease: "easeOut" }}
            style={{ transformOrigin: "center top" }}
          >
            <div className="flex items-center gap-2">
              <div>
                <span className="block text-[10px] font-black tracking-[0.16em] text-slate-400">SHOW LOCALLY</span>
                <span className="text-sm font-extrabold text-slate-900">현지인에게 보여주기</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(12);
                  setIsRotated((prev) => !prev);
                }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <ArrowLeftRight className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>{isRotated ? "180° 회전됨" : "정방향"}</span>
              </button>
              <MorphingDialogClose ariaLabel="닫기" className="static flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700">
                <X className="size-4" />
              </MorphingDialogClose>
            </div>
          </motion.div>

          <div className="my-auto flex w-full flex-col items-center justify-center gap-6 py-6 text-center">
            <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-10 text-slate-900 shadow-sm">
              <div className={cn("absolute left-0 top-0 h-full w-1", meta.stripClass)} />
              <motion.h2
                className={cn("font-thai break-words text-center leading-relaxed tracking-wide text-slate-950", getDynamicThaiFontSize(item.th))}
                animate={{ rotate: isRotated ? 180 : 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeInOut" }}
              >
                {item.th}
              </motion.h2>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 px-2">
              <span className={cn("rounded-full px-2 py-1 text-[10px] font-black", meta.railClass)}>{meta.label}</span>
              <MorphingDialogTitle>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900">{item.ko}</p>
              </MorphingDialogTitle>
              <MorphingDialogDescription disableLayoutAnimation className="inline-flex items-center gap-1 rounded-full border border-orange-200/80 bg-orange-50 px-3.5 py-1 text-xs font-bold text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/60 dark:text-orange-300">
                <span>🗣️ 발음:</span>
                <span>{item.pron}</span>
              </MorphingDialogDescription>
            </div>
          </div>

          <motion.div
            className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scaleX: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleX: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.18, duration: prefersReducedMotion ? 0 : 0.24, ease: "easeOut" }}
            style={{ transformOrigin: "center bottom" }}
          >
            <button
              type="button"
              onClick={() => onPlayAudio(item.th)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff6f4e] to-[#ff9b42] font-extrabold text-white shadow-md shadow-orange-500/20 transition hover:from-[#f05f3e] hover:to-[#f28b34] active:scale-95"
            >
              <Volume2 className="size-5" />
              <span>태국어 발음 듣기</span>
            </button>
            <MorphingDialogClose ariaLabel="다이얼로그 닫기" className="static flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 font-bold text-slate-700 transition hover:bg-slate-200">
              닫기
            </MorphingDialogClose>
          </motion.div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export const DictionaryActivity: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [searchBarTop, setSearchBarTop] = useState<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [shouldScramble, setShouldScramble] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldScramble(false), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // 검색창의 기존 PWA iOS/AOS 가상 키보드 대응은 그대로 유지한다.
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      const mainTop = mainRef.current?.getBoundingClientRect().top ?? 0;
      const visibleBottom = vv.height + vv.offsetTop;
      const keyboardInset = Math.max(0, window.innerHeight - visibleBottom);
      const bottomGap = keyboardInset > 100 ? SEARCH_BAR_GAP : 16;

      setKeyboardHeight(keyboardInset > 100 ? keyboardInset : 0);
      setSearchBarTop(Math.max(0, Math.round(visibleBottom - mainTop - SEARCH_BAR_HEIGHT - bottomGap)));
    };

    const vv = window.visualViewport;
    const handlePageResume = () => {
      handleViewportChange();
      requestAnimationFrame(handleViewportChange);
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handlePageResume();
    };

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("pageshow", handlePageResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleViewportChange();

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("pageshow", handlePageResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const entries = gsap.utils.toArray<HTMLElement>("[data-dictionary-entry]").slice(0, 7);
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .fromTo(
          "[data-dictionary-intro='rail']",
          { autoAlpha: 0, y: 18, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.52 },
        )
        .fromTo(
          "[data-dictionary-intro='toolbar']",
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.36 },
          "-=0.25",
        )
        .fromTo(
          "[data-dictionary-intro='list']",
          { autoAlpha: 0, y: 14, scale: 0.99 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.48 },
          "-=0.18",
        )
        .fromTo(
          entries,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.055, clearProps: "transform,visibility" },
          "-=0.28",
        );

    });

    return () => media.revert();
  }, { scope: introRef });

  // 최근 검색어 추가 (초성/검색어로 필터 후 카드를 탭했을 때 저장)
  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // localStorage 에러 무시
      }
      return next;
    });
  };

  // 최근 검색어 삭제
  const removeRecentSearch = (queryToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback(10);
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // 무시
      }
      return next;
    });
  };

  // 필터링된 회화 데이터
  const filteredPhrases = useMemo(() => {
    return THAI_PHRASES.filter((phrase) => {
      const matchesCat =
        selectedCategory === "전체" || phrase.category === selectedCategory;
      const matchesSearch = matchKoreanSearch(phrase, searchQuery);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // 카드 탭 시 최근 검색어 저장 및 햅틱 피드백
  const handlePhraseOpen = () => {
    triggerHapticFeedback(15);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
  };

  // 태국어 음성 읽기 (TTS)
  const playAudio = (text: string, e?: React.MouseEvent | unknown) => {
    if (e && typeof e === "object" && "stopPropagation" in e) {
      (e as React.MouseEvent).stopPropagation();
    }
    triggerHapticFeedback(12);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find((v) => v.lang.includes("th"));
      if (thaiVoice) utterance.voice = thaiVoice;
      utterance.lang = "th-TH";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppScreen className="dictionary-screen" appBar={{ title: "회화 사전" }}>
      <main ref={mainRef} className="relative flex h-[calc(100svh-56px)] w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 pt-5 transition-[padding] duration-150 no-scrollbar"
          style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 80}px` : "96px" }}
        >
        <section ref={introRef} className="mx-auto flex w-full max-w-lg flex-col gap-4">

          <div
            data-dictionary-intro="rail"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar"
            aria-label="회화 카테고리"
          >
            {CATEGORY_FILTERS.map((category) => {
              const isSelected = selectedCategory === category;
              const meta = category === "전체" ? null : CATEGORY_META[category];
              const Icon = meta?.icon ?? Compass;

              return (
                <motion.button
                  key={category}
                  type="button"
                  layout
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  aria-pressed={isSelected}
                  onClick={() => {
                    triggerHapticFeedback(10);
                    setSelectedCategory(category);
                  }}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-[color,background-color,box-shadow]",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-[0_8px_18px_-12px_rgba(15,23,42,0.8)] dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{meta?.label ?? "전체"}</span>
                </motion.button>
              );
            })}
          </div>

          <div data-dictionary-intro="toolbar" className="flex items-center justify-between px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>전체 {filteredPhrases.length}개 표현</span>
            {(searchQuery || selectedCategory !== "전체") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full px-2 font-bold text-slate-600 dark:text-slate-300"
                onPress={() => {
                  triggerHapticFeedback(10);
                  setSearchQuery("");
                  setSelectedCategory("전체");
                }}
              >
                <RotateCcw className="size-3" />
                <span>초기화</span>
              </Button>
            )}
          </div>

          <div data-dictionary-intro="rail" className="rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-5 text-white shadow-lg shadow-violet-500/20">
            <span className="text-2xl">💬</span>
            <h1 className="mt-3 text-xl font-extrabold">태국 회화 사전</h1>
            <p className="mt-1 text-sm font-medium text-white/80">여행에서 바로 꺼내 쓰는 태국어 표현</p>
          </div>

          {recentSearches.length > 0 && (
            <div data-dictionary-intro className="flex flex-col gap-1.5 px-1">
              <p className="flex items-center gap-1.5 px-1 text-[11px] font-black tracking-wide text-slate-500 dark:text-slate-400">
                <Clock className="size-3.5 text-slate-950 dark:text-white" /> 최근 꺼내 본 말
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item) => (
                  <Chip
                    key={item}
                    size="sm"
                    variant="secondary"
                    className="cursor-pointer border border-slate-200 bg-white font-bold text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => {
                      triggerHapticFeedback(10);
                      setSearchQuery(item);
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <span>{item}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeRecentSearch(item, e)}
                        className="rounded-full p-0.5 hover:bg-orange-100 dark:hover:bg-slate-700"
                      >
                        <X className="size-3 text-slate-400" />
                      </span>
                    </span>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div data-dictionary-intro="list" className="-mx-5 overflow-hidden border-y border-slate-200 bg-white shadow-[0_14px_30px_-28px_rgba(15,23,42,0.55)] dark:border-slate-800 dark:bg-slate-900">
            {filteredPhrases.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">🔎</span>
                <p className="mt-3 text-sm font-black text-slate-800 dark:text-slate-100">찾는 표현이 없어요</p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">다른 단어 또는 초성으로 다시 찾아보세요.</p>
              </div>
            ) : (
              filteredPhrases.map((item, index) => (
                <DictionaryPhraseDialog
                  key={item.id}
                  index={index}
                  item={item}
                  meta={CATEGORY_META[item.category]}
                  onOpen={handlePhraseOpen}
                  onPlayAudio={playAudio}
                  prefersReducedMotion={prefersReducedMotion}
                  shouldScramble={shouldScramble}
                />
              ))
            )}
          </div>
        </section>
        </div>
        <div
          aria-label="회화 사전 검색"
          className="absolute inset-x-0 z-40 mx-auto flex max-w-lg items-center justify-center px-5 transition-[top] duration-100 ease-out"
          style={{ top: searchBarTop === null ? undefined : `${searchBarTop}px`, bottom: searchBarTop === null ? "16px" : undefined }}
          data-slot="dictionary-filter-toolbar"
          role="search"
        >
          <GooeyInput
            className="w-full"
            focusProxy
            fullWidthOnExpand
            onOpenChange={setSearchOpen}
            onValueChange={setSearchQuery}
            open={searchOpen}
            placeholder=""
            value={searchQuery}
          />
        </div>
      </main>
    </AppScreen>
  );
};
