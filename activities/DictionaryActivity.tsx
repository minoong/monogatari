import React, { useMemo, useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Chip } from "@heroui/react";
import {
  ArrowLeftRight,
  Clock,
  Maximize2,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { matchKoreanSearch, PhraseItem, THAI_PHRASES } from "@/lib/phrases";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { GooeyInput } from "@/components/ui/gooey-input";
import { cn } from "@/lib/utils";

const RECENT_SEARCHES_KEY = "monogatari_recent_phrase_searches";
const MAX_RECENT_SEARCHES = 8;

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
  const [showcasePhrase, setShowcasePhrase] = useState<PhraseItem | null>(null);
  const [isRotated, setIsRotated] = useState(false);

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

  // 카드 탭 시: 현지인 크게 보여주기 모달 오픈 (기본 180도 뒤집힌 본문) + 최근 검색어 자동 저장
  const handleCardClick = (phrase: PhraseItem) => {
    triggerHapticFeedback(15);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    setIsRotated(true);
    setShowcasePhrase(phrase);
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

  const categories = ["전체", "기본", "이동", "식당", "쇼핑", "긴급"];

  return (
    <AppScreen appBar={{ title: "회화 사전" }}>
      <main className="min-h-full w-full bg-slate-50 pb-28 dark:bg-slate-950">
        <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-4">
          {/* Fixed Bottom Search Bar (GooeyInput - 쇼핑 리스트와 동일) */}
          <div
            aria-label="회화 사전 검색"
            className="fixed bottom-4 inset-x-0 z-40 mx-auto flex max-w-lg items-center justify-center px-5"
            data-slot="dictionary-filter-toolbar"
            role="search"
          >
            <GooeyInput
              className="w-full shadow-lg"
              fullWidthOnExpand
              onOpenChange={setSearchOpen}
              onValueChange={setSearchQuery}
              open={searchOpen}
              placeholder=""
              value={searchQuery}
            />
          </div>

          {/* Recent Searches (PWA LocalStorage) */}
          {recentSearches.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="size-3" /> 최근 검색어
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((item) => (
                  <Chip
                    key={item}
                    size="sm"
                    variant="secondary"
                    className="cursor-pointer font-bold text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
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
                        className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700"
                      >
                        <X className="size-3 text-slate-400" />
                      </span>
                    </span>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Chips (HeroUI Chip 기반 스크롤 필터) */}
          <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const label =
                cat === "기본"
                  ? "🥇 필수기본"
                  : cat === "이동"
                  ? "🥈 이동"
                  : cat === "식당"
                  ? "🥉 식당"
                  : cat;
              return (
                <Chip
                  key={cat}
                  size="md"
                  variant={isSelected ? "primary" : "tertiary"}
                  className={cn(
                    "cursor-pointer font-bold transition-all active:scale-95",
                    !isSelected && "bg-white text-slate-600 shadow-2xs dark:bg-slate-900 dark:text-slate-300"
                  )}
                  onClick={() => {
                    triggerHapticFeedback(10);
                    setSelectedCategory(cat);
                  }}
                >
                  {label}
                </Chip>
              );
            })}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">
              조회 결과 <strong className="text-slate-900 dark:text-white">{filteredPhrases.length}</strong>건
            </span>
            {(searchQuery || selectedCategory !== "전체") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 font-bold text-blue-600 dark:text-blue-400"
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

          {/* Phrases List (좌우 여백 없는 엣지 투 엣지 컴팩트 리스트) */}
          <div className="-mx-5 flex flex-col divide-y divide-slate-100 border-y border-slate-200/80 bg-white dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-900">
            {filteredPhrases.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center">
                <p className="text-2xl">🔎</p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  일치하는 회화 표현이 없어요
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  검색어를 다시 확인하거나 초성으로 입력해 보세요!
                </p>
              </div>
            ) : (
              filteredPhrases.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="group relative cursor-pointer px-5 py-2.5 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/50 dark:active:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 pr-2">
                      <Chip
                        size="sm"
                        variant="soft"
                        color="accent"
                        className="font-extrabold text-[10px] h-5 px-1.5"
                      >
                        {item.category}
                      </Chip>
                      <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {item.ko}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="secondary"
                        aria-label="발음 듣기"
                        onPress={(e) => playAudio(item.th, e)}
                        className="size-7.5 rounded-lg text-blue-600 dark:text-blue-400"
                      >
                        <Volume2 className="size-3.5" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="secondary"
                        aria-label="현지인에게 크게 보여주기"
                        onPress={() => handleCardClick(item)}
                        className="size-7.5 rounded-lg text-blue-600 dark:text-blue-400"
                      >
                        <Maximize2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Thai Text */}
                  <p className="mt-1 font-thai text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                    {item.th}
                  </p>

                  {/* Pronunciation */}
                  <p className="mt-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    🗣️ {item.pron}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 현지인 보여주기 전면 모달 (Full-Screen Showcase Modal) */}
        {/* ======================================================== */}
        {showcasePhrase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative flex h-[82dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 p-6 text-white shadow-2xl">
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
                  <Sparkles className="size-3.5" />
                  <span>🇹🇭 현지인 보여주기용</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(12);
                      setIsRotated((prev) => !prev);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95"
                  >
                    <ArrowLeftRight className="size-3.5 text-blue-400" />
                    <span>태국어 {isRotated ? "정방향" : "180° 뒤집기"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(10);
                      setShowcasePhrase(null);
                    }}
                    aria-label="닫기"
                    className="flex size-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-90"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Main Showcase Body */}
              <div className="my-auto flex w-full flex-col items-center justify-center gap-6 text-center">
                {/* 태국어 대형 텍스트 전용 흰색 카드 (좌우 여백 없이 꽉 채움) */}
                <div className="-mx-6 w-[calc(100%+3rem)] border-y border-slate-200 bg-white px-5 py-9 text-slate-950 shadow-2xl">
                  <h2
                    className={cn(
                      "font-thai text-4xl sm:text-5xl font-semibold leading-relaxed tracking-wide text-slate-950 transition-transform duration-300 break-words",
                      isRotated && "rotate-180"
                    )}
                  >
                    {showcasePhrase.th}
                  </h2>
                </div>

                {/* 하단 한국어 의미 & 한글 발음 (사용자용 정방향 고정) */}
                <div className="flex flex-col items-center justify-center gap-2 px-2">
                  <p className="text-2xl font-black tracking-tight text-white">
                    {showcasePhrase.ko}
                  </p>
                  <p className="inline-flex items-center gap-1 rounded-full border border-blue-800/60 bg-blue-950/70 px-3.5 py-1 text-xs font-extrabold text-blue-300">
                    <span>🗣️ 발음:</span>
                    <span>{showcasePhrase.pron}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => playAudio(showcasePhrase.th)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 font-extrabold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95"
                >
                  <Volume2 className="size-5" />
                  <span>태국어 발음 듣기</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(10);
                    setShowcasePhrase(null);
                  }}
                  className="flex h-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-6 font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppScreen>
  );
};

