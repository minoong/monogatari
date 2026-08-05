import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Chip } from "@heroui/react";
import {
  ArrowLeftRight,
  BadgePercent,
  BookOpen,
  Camera,
  Check,
  CircleHelp,
  CircleStop,
  Clock,
  Flame,
  GlassWater,
  Gauge,
  Hand,
  HeartPulse,
  Heart,
  Languages,
  Leaf,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Utensils,
  Volume2,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { matchKoreanSearch, PhraseItem, THAI_PHRASES } from "@/lib/phrases";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { GooeyInput } from "@/components/ui/gooey-input";
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

const PHRASE_THUMBNAILS: Record<number, { icon: LucideIcon; background: string; foreground: string }> = {
  1: { icon: Hand, background: "#fff3d7", foreground: "#d78b08" },
  2: { icon: Heart, background: "#ffe8e8", foreground: "#df5a62" },
  3: { icon: MessageCircle, background: "#efe8ff", foreground: "#805ad5" },
  4: { icon: Check, background: "#e1f8ec", foreground: "#25985e" },
  5: { icon: Check, background: "#e4f3ff", foreground: "#2879c8" },
  6: { icon: X, background: "#ffe8e8", foreground: "#d64c4c" },
  7: { icon: CircleHelp, background: "#e3f5ff", foreground: "#2586be" },
  8: { icon: MapPin, background: "#e1f8f3", foreground: "#169b89" },
  9: { icon: Navigation, background: "#e1f8f3", foreground: "#169b89" },
  10: { icon: CircleStop, background: "#fff1dd", foreground: "#df7920" },
  11: { icon: Gauge, background: "#e8f1ff", foreground: "#3b72bd" },
  12: { icon: Clock, background: "#e8f1ff", foreground: "#3b72bd" },
  13: { icon: Leaf, background: "#e4f8e9", foreground: "#2c9b63" },
  14: { icon: Leaf, background: "#fff0e1", foreground: "#df7420" },
  15: { icon: Utensils, background: "#fff0df", foreground: "#e06d20" },
  16: { icon: BookOpen, background: "#fff0df", foreground: "#e06d20" },
  17: { icon: Receipt, background: "#fff0df", foreground: "#e06d20" },
  18: { icon: Flame, background: "#ffe8e4", foreground: "#dd5735" },
  19: { icon: GlassWater, background: "#e3f5ff", foreground: "#2384bf" },
  20: { icon: Star, background: "#fff4d8", foreground: "#dd9508" },
  21: { icon: Package, background: "#fff0df", foreground: "#e06d20" },
  22: { icon: Tag, background: "#ffe8ef", foreground: "#d85a81" },
  23: { icon: BadgePercent, background: "#ffe8ef", foreground: "#d85a81" },
  24: { icon: TrendingUp, background: "#ffe8ef", foreground: "#d85a81" },
  25: { icon: ShoppingBag, background: "#f0edf3", foreground: "#73677c" },
  26: { icon: LifeBuoy, background: "#ffe7e7", foreground: "#d95151" },
  27: { icon: Languages, background: "#e9edff", foreground: "#526cbe" },
  28: { icon: CircleHelp, background: "#e9edff", foreground: "#526cbe" },
  29: { icon: Camera, background: "#e9edff", foreground: "#526cbe" },
  30: { icon: Sparkles, background: "#fff4d8", foreground: "#dd9508" },
  45: { icon: Wallet, background: "#f0edf3", foreground: "#73677c" },
  46: { icon: TrendingUp, background: "#fff0df", foreground: "#df7420" },
  47: { icon: BadgePercent, background: "#ffe8ef", foreground: "#d85a81" },
};

function PhraseThumbnail({ id }: { id: number }) {
  const thumbnail = PHRASE_THUMBNAILS[id] ?? PHRASE_THUMBNAILS[1];
  const Icon = thumbnail.icon;

  return (
    <div
      aria-hidden="true"
      className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
      style={{ backgroundColor: thumbnail.background }}
    >
      <span className="absolute -right-3 -top-3 size-9 rounded-full bg-white/35" />
      <span className="absolute -bottom-2 -left-2 size-6 rounded-full bg-white/25" />
      <Icon className="relative size-7 stroke-[2.25]" style={{ color: thumbnail.foreground }} />
    </div>
  );
}

function DictionaryPhraseDialog({
  item,
  meta,
  prefersReducedMotion,
  onOpen,
  onPlayAudio,
}: {
  item: PhraseItem;
  meta: (typeof CATEGORY_META)[PhraseItem["category"]];
  prefersReducedMotion: boolean | null;
  onOpen: () => void;
  onPlayAudio: (text: string, event?: React.MouseEvent | unknown) => void;
}) {
  const [isRotated, setIsRotated] = useState(true);

  return (
    <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
      <article
        data-dictionary-entry
        className="group relative flex min-h-20 items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-slate-100/60 active:bg-slate-200/60 dark:hover:bg-white/5 dark:active:bg-white/10"
        role="listitem"
      >
        <PhraseThumbnail id={item.id} />
        <div className="min-w-0 flex-1" onClickCapture={onOpen}>
          <MorphingDialogTrigger
            ariaLabel={`${item.ko} 현지인에게 크게 보여주기`}
            className="block w-full text-left outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <MorphingDialogTitle className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{item.ko}</span>
              </MorphingDialogTitle>
              <span className="shrink-0 text-[11px] font-semibold text-slate-400">{meta.label}</span>
            </div>
            <MorphingDialogDescription disableLayoutAnimation className="block">
              <span className="mt-1 block truncate font-thai text-base font-semibold leading-tight text-slate-700 dark:text-slate-200">{item.th}</span>
              <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">🗣️ {item.pron}</span>
            </MorphingDialogDescription>
          </MorphingDialogTrigger>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            aria-label="발음 듣기"
            onPress={(event) => onPlayAudio(item.th, event)}
            className="size-8 rounded-xl text-slate-500 dark:text-slate-400"
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
  const prefersReducedMotion = useReducedMotion();

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
    <AppScreen className="dictionary-screen" appBar={{ title: "태국어 사전... 당황하지 말라고!" }}>
      <main ref={mainRef} className="relative flex h-[calc(100svh-56px)] w-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 pt-5 transition-[padding] duration-150 no-scrollbar"
          style={{ paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 80}px` : "96px" }}
        >
        <section className="mx-auto flex w-full max-w-lg flex-col gap-4">

          <div
            className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar"
            aria-label="회화 카테고리"
          >
            {CATEGORY_FILTERS.map((category) => {
              const isSelected = selectedCategory === category;
              const meta = category === "전체" ? null : CATEGORY_META[category];

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelected) return;
                    triggerHapticFeedback(10);
                    setSelectedCategory(category);
                  }}
                  className={cn(
                    "touch-manipulation shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors duration-150",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
                  )}
                >
                  <span>{meta?.label ?? "전체"}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <span>{searchQuery || selectedCategory !== "전체" ? "검색/필터 결과" : "전체"}</span>
              <span className="font-extrabold tabular-nums text-slate-900 dark:text-white">{filteredPhrases.length}개</span>
              {(searchQuery || selectedCategory !== "전체") && (
                <span className="text-[11px] text-slate-400">(총 {THAI_PHRASES.length}개)</span>
              )}
            </div>
            {(searchQuery || selectedCategory !== "전체") && (
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => {
                  triggerHapticFeedback(10);
                  setSearchQuery("");
                  setSelectedCategory("전체");
                }}
              >
                <RotateCcw className="size-3" />
                <span>필터 초기화</span>
              </button>
            )}
          </div>



          {recentSearches.length > 0 && (
            <div className="flex flex-col gap-1.5 px-1">
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

          <div className="-mx-5 divide-y divide-slate-200/80 dark:divide-slate-800/80" role="list">
            {filteredPhrases.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">🔎</span>
                <p className="mt-3 text-sm font-black text-slate-800 dark:text-slate-100">찾는 표현이 없어요</p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">다른 단어 또는 초성으로 다시 찾아보세요.</p>
              </div>
            ) : (
              filteredPhrases.map((item) => (
                <DictionaryPhraseDialog
                  key={item.id}
                  item={item}
                  meta={CATEGORY_META[item.category]}
                  onOpen={handlePhraseOpen}
                  onPlayAudio={playAudio}
                  prefersReducedMotion={prefersReducedMotion}
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
