import React, { useMemo, useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import {
  ArrowLeftRight,
  Clock,
  RotateCcw,
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

  // 카드 탭 시: 현지인 크게 보여주기 모달 오픈 + 최근 검색어 자동 저장
  const handleCardClick = (phrase: PhraseItem) => {
    triggerHapticFeedback(15);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    setIsRotated(false);
    setShowcasePhrase(phrase);
  };

  // 태국어 음성 읽기 (TTS)
  const playAudio = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
        <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-5">
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
              placeholder="회화 초성(예: ㄱㅅ) 또는 단어 검색..."
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
                  <span
                    key={item}
                    onClick={() => {
                      triggerHapticFeedback(10);
                      setSearchQuery(item);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentSearch(item, e)}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <X className="size-3 text-slate-400" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="-mx-5 flex items-center gap-1.5 overflow-x-auto px-5 no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(10);
                    setSelectedCategory(cat);
                  }}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-xs dark:border-blue-500 dark:bg-blue-500"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  )}
                >
                  {cat === "기본" ? "🥇 필수기본" : cat === "이동" ? "🥈 이동" : cat === "식당" ? "🥉 식당" : cat}
                </button>
              );
            })}
          </div>

          {/* Speech Recognition Button */}


          {/* Status Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">
              조회 결과 <strong className="text-slate-900 dark:text-white">{filteredPhrases.length}</strong>건
            </span>
            {(searchQuery || selectedCategory !== "전체") && (
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(10);
                  setSearchQuery("");
                  setSelectedCategory("전체");
                }}
                className="flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                <RotateCcw className="size-3" />
                초기화
              </button>
            )}
          </div>

          {/* Phrases List */}
          <div className="flex flex-col gap-3">
            {filteredPhrases.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
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
                  className="group relative flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-blue-400 active:scale-[0.99] dark:border-slate-800/90 dark:bg-slate-900 dark:hover:border-blue-500"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.ko}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => playAudio(item.th, e)}
                      aria-label="발음 듣기"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600 transition hover:bg-blue-100 active:scale-90 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    >
                      <Volume2 className="size-4.5" />
                    </button>
                  </div>

                  {/* Thai Text */}
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {item.th}
                  </p>

                  {/* Pronunciation */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      🗣️ {item.pron}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-500">
                      📱 크게 보여주기 ↗
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* 현지인 보여주기 전면 모달 (Full-Screen Showcase Modal) */}
        {/* ======================================================== */}
        {showcasePhrase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className={cn(
                "relative flex h-[85dvh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 p-6 text-white shadow-2xl transition-transform duration-300",
                isRotated && "rotate-180"
              )}
            >
              {/* Header Actions */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md">
                  🇹🇭 현지인용 대형 화면
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(12);
                      setIsRotated((prev) => !prev);
                    }}
                    className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 active:scale-95"
                  >
                    <ArrowLeftRight className="size-3.5" />
                    180° 뒤집기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(10);
                      setShowcasePhrase(null);
                    }}
                    aria-label="닫기"
                    className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-90"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Main Big Thai Text */}
              <div className="my-auto flex flex-col items-center justify-center text-center">
                <h2 className="text-4xl font-black leading-tight text-yellow-300 drop-shadow-md sm:text-5xl">
                  {showcasePhrase.th}
                </h2>
                <p className="mt-6 text-xl font-bold text-white/90">
                  {showcasePhrase.ko}
                </p>
                <p className="mt-2 text-sm text-blue-200 font-semibold">
                  발음: {showcasePhrase.pron}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => playAudio(showcasePhrase.th)}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 font-extrabold text-white shadow-lg transition hover:bg-blue-500 active:scale-95"
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
                  className="flex h-12 px-6 items-center justify-center rounded-2xl bg-white/10 font-bold text-white transition hover:bg-white/20 active:scale-95"
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
