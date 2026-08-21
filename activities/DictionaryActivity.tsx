import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Chip } from "@heroui/react";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import { RotateCwIcon, type RotateCwIconHandle } from "@/components/ui/rotate-cw";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SmartphoneIcon } from "@/components/ui/smartphone";
import { Volume2Icon, type Volume2IconHandle } from "@/components/ui/volume-2";
import {
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
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { matchKoreanSearch, PhraseItem, THAI_PHRASES } from "@/lib/phrases";
import {
  getSpeakerGenderLabel,
  readStoredSpeakerGender,
  resolvePhraseForSpeaker,
  SPEAKER_GENDER_META,
  storeSpeakerGender,
  type SpeakerGender,
} from "@/lib/phrase-speaker";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { GooeyInput } from "@/components/ui/gooey-input";
import {
  dialogIconButtonClass,
  dialogPrimaryButtonClass,
  dialogSecondaryButtonClass,
} from "@/components/ui/drawer-form";
import { WordRotate } from "@/components/ui/word-rotate";
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

const getShowLocallyThaiFontSize = (text: string) => {
  const len = text.length;
  if (len <= 10) return "text-[clamp(2.75rem,12vw,4.75rem)]";
  if (len <= 18) return "text-[clamp(2.25rem,10vw,3.75rem)]";
  return "text-[clamp(1.85rem,8.5vw,3rem)]";
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
      className="relative flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[7px]"
      style={{ backgroundColor: thumbnail.background }}
    >
      <Icon className="relative size-4 stroke-[2.1]" style={{ color: thumbnail.foreground }} />
    </div>
  );
}

const SPEAKER_NAME_WORDS = [SPEAKER_GENDER_META.male.label, SPEAKER_GENDER_META.female.label] as const;
const SPEAKER_SUBTITLE_WORDS = [
  `${getSpeakerGenderLabel("male")} 말하기`,
  `${getSpeakerGenderLabel("female")} 말하기`,
] as const;

function SpeakerGenderToggle({
  value,
  onChange,
}: {
  value: SpeakerGender;
  onChange: (gender: SpeakerGender) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const slotOffset = 30;
  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 460, damping: 32 };
  const activeWordIndex = value === "male" ? 0 : 1;
  const wordMotionProps = prefersReducedMotion
    ? {
        initial: false as const,
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
        transition: { duration: 0.24, ease: "easeOut" as const },
      };

  return (
    <div className="flex items-center gap-3 px-1">
      <div className="relative h-9 w-[66px] shrink-0" role="group" aria-label="말하기 성별">
        {(["male", "female"] as const).map((gender) => {
          const meta = SPEAKER_GENDER_META[gender];
          const selected = value === gender;

          return (
            <motion.button
              key={gender}
              type="button"
              aria-pressed={selected}
              aria-label={`${meta.label} 말하기`}
              onClick={() => onChange(gender)}
              className="absolute left-0 top-0 rounded-full outline-none"
              style={{ zIndex: selected ? 2 : 1 }}
              animate={{
                x: selected ? 0 : slotOffset,
                scale: selected ? 1 : 0.86,
                opacity: selected ? 1 : 0.42,
              }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
              transition={spring}
            >
              <Avatar
                className={cn(
                  "!size-9",
                  selected && "shadow-[0_4px_12px_rgba(15,23,42,0.14)] ring-2 ring-white dark:ring-slate-950",
                )}
                color={meta.avatarColor}
                size="sm"
              >
                <AvatarImage alt="" src={meta.image} />
                <AvatarFallback>{meta.label.slice(0, 1)}</AvatarFallback>
              </Avatar>
            </motion.button>
          );
        })}
      </div>

      <div aria-live="polite" className="min-w-0 flex-1">
        <WordRotate
          activeIndex={activeWordIndex}
          words={[...SPEAKER_NAME_WORDS]}
          containerClassName="py-0"
          className="text-[15px] font-semibold leading-5 tracking-[-0.01em] text-slate-900 dark:text-white"
          motionProps={wordMotionProps}
        />
        <WordRotate
          activeIndex={activeWordIndex}
          words={[...SPEAKER_SUBTITLE_WORDS]}
          containerClassName="py-0"
          className="text-[12px] leading-4 text-[#8e8e93] dark:text-[#98989d]"
          motionProps={wordMotionProps}
        />
      </div>
    </div>
  );
}

function DictionaryPhraseDetail({
  item,
  meta,
  onOpen,
  onPlayAudio,
  prefersReducedMotion,
  speakerGender,
}: {
  item: PhraseItem;
  meta: (typeof CATEGORY_META)[PhraseItem["category"]];
  onOpen: () => void;
  onPlayAudio: (text: string) => void;
  prefersReducedMotion: boolean | null;
  speakerGender: SpeakerGender;
}) {
  const [isRotated, setIsRotated] = useState(true);
  const rotateIconRef = useRef<RotateCwIconHandle>(null);
  const volumeIconRef = useRef<Volume2IconHandle>(null);
  const resolved = resolvePhraseForSpeaker(item, speakerGender);

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const toggleRotation = () => {
    triggerHapticFeedback(12);
    rotateIconRef.current?.startAnimation();
    setIsRotated((prev) => !prev);
  };

  const handlePlayAudio = () => {
    triggerHapticFeedback(12);
    volumeIconRef.current?.startAnimation();
    onPlayAudio(resolved.th);
  };

  return (
    <>
      <MorphingDialogClose
        ariaLabel="다이얼로그 닫기"
        className="right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-[#76768029] text-[#3c3c43] backdrop-blur-sm dark:bg-[#7878805c] dark:text-[#ebebf5]"
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5 pt-4 text-slate-900 dark:text-white">
        <div className="flex items-start gap-3">
          <SmartphoneIcon animateOnMount className="mt-0.5 shrink-0 text-[#007aff] dark:text-[#0a84ff]" size={22} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold leading-[22px] tracking-[-0.01em]">현지인에게 보여주기</h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-[#3c3c4399] dark:text-[#ebebf599]">
              {isRotated ? "상대방 쪽으로 돌려 태국어를 보여주세요." : "정방향으로 확인 중이에요."}
            </p>
          </div>
          <Button
            isIconOnly
            aria-pressed={isRotated}
            aria-label={isRotated ? "정방향으로 보기" : "180도 회전"}
            className={cn("mr-8 mt-0.5 shrink-0", dialogIconButtonClass)}
            onPress={toggleRotation}
            variant="ghost"
          >
            <RotateCwIcon ref={rotateIconRef} size={18} />
          </Button>
        </div>

        <section className="mt-4 flex min-h-[min(44vh,360px)] flex-1 flex-col items-center justify-center rounded-[20px] bg-[#f2f2f7] px-5 py-8 text-center dark:bg-[#2c2c2e]">
          <motion.h2
            className={cn(
              "font-thai max-w-full break-words font-semibold leading-[1.08] tracking-wide text-slate-950 dark:text-white",
              getShowLocallyThaiFontSize(resolved.th),
            )}
            animate={{ rotate: isRotated ? 180 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {resolved.th}
          </motion.h2>
          <p className="mt-4 max-w-full break-words text-[17px] font-medium leading-[24px] tracking-[0.01em] text-[#3c3c43] dark:text-[#ebebf5]">
            {resolved.pron}
          </p>
        </section>

        <MorphingDialogDescription disableLayoutAnimation className="mt-5 space-y-1 px-1 text-center">
          <MorphingDialogTitle>
            <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.01em] text-slate-900 dark:text-white">{item.ko}</p>
          </MorphingDialogTitle>
          <p className="text-[13px] leading-[18px] text-[#3c3c4399] dark:text-[#ebebf599]">{meta.label}</p>
        </MorphingDialogDescription>

        <div className="mt-6 flex gap-2">
          <Button
            fullWidth
            className={dialogPrimaryButtonClass}
            onPress={handlePlayAudio}
            type="button"
          >
            <Volume2Icon ref={volumeIconRef} className="text-white" size={20} />
            <span>발음 듣기</span>
          </Button>
          <MorphingDialogClose
            ariaLabel="다이얼로그 닫기"
            className={cn("static shrink-0 px-5", dialogSecondaryButtonClass)}
          >
            닫기
          </MorphingDialogClose>
        </div>
      </div>
    </>
  );
}

function DictionaryPhraseRow({
  item,
  meta,
  onOpen,
  onPlayAudio,
  prefersReducedMotion,
  showDivider,
  speakerGender,
}: {
  item: PhraseItem;
  meta: (typeof CATEGORY_META)[PhraseItem["category"]];
  onOpen: () => void;
  onPlayAudio: (text: string, event?: React.MouseEvent | unknown) => void;
  prefersReducedMotion: boolean | null;
  showDivider: boolean;
  speakerGender: SpeakerGender;
}) {
  const resolved = resolvePhraseForSpeaker(item, speakerGender);

  return (
    <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.42 }}>
      <div data-dictionary-entry role="listitem">
        <MorphingDialogTrigger
          ariaLabel={`${item.ko} 현지인에게 보여주기`}
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left outline-none transition-colors active:bg-black/[0.04] focus-visible:bg-black/[0.03] dark:active:bg-white/[0.06] dark:focus-visible:bg-white/[0.04]"
        >
          <PhraseThumbnail id={item.id} />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
              <p className="min-w-0 text-[16px] font-medium leading-[22px] tracking-[-0.01em] text-[#3c3c43] dark:text-[#ebebf5]">
                {item.ko}
              </p>
              <span className="mt-0.5 shrink-0 text-[11px] font-medium text-[#8e8e93] dark:text-[#98989d]">{meta.label}</span>
            </div>

            <MorphingDialogTitle className="min-w-0">
              <p className="font-thai text-[17px] font-semibold leading-[22px] tracking-[-0.02em] text-slate-900 dark:text-white">
                {resolved.th}
              </p>
              <p className="mt-1 text-[15px] font-medium leading-[20px] text-[#636366] dark:text-[#d1d1d6]">
                {resolved.pron}
              </p>
            </MorphingDialogTitle>
          </div>
        </MorphingDialogTrigger>

        {showDivider ? (
          <div
            aria-hidden="true"
            className="ml-[58px] border-b border-[#c6c6c8]/70 dark:border-white/10"
          />
        ) : null}
      </div>

      <MorphingDialogContainer>
        <MorphingDialogContent className="relative mx-4 flex max-h-[88dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-[14px] bg-white shadow-2xl dark:bg-[#1c1c1e]">
          <DictionaryPhraseDetail
            item={item}
            meta={meta}
            onOpen={onOpen}
            onPlayAudio={onPlayAudio}
            prefersReducedMotion={prefersReducedMotion}
            speakerGender={speakerGender}
          />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export const DictionaryActivity: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [speakerGender, setSpeakerGender] = useState<SpeakerGender>(() => readStoredSpeakerGender());
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

  const handleSpeakerGenderChange = (gender: SpeakerGender) => {
    if (gender === speakerGender) return;
    triggerHapticFeedback(10);
    setSpeakerGender(gender);
    storeSpeakerGender(gender);
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
    <AppScreen className="dictionary-screen captured-scroll-screen" appBar={{ title: "태국어 사전... 당황하지 말라고!" }}>
      <main ref={mainRef} className="relative flex h-[calc(100svh-56px)] w-full flex-col overflow-hidden bg-white dark:bg-slate-950">
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

          <SpeakerGenderToggle value={speakerGender} onChange={handleSpeakerGenderChange} />

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

          <div
            className="overflow-hidden"
            role="list"
          >
            {filteredPhrases.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#f2f2f7] text-xl dark:bg-[#2c2c2e]">🔎</span>
                <p className="mt-3 text-[17px] font-semibold text-slate-900 dark:text-white">찾는 표현이 없어요</p>
                <p className="mt-1 text-[15px] text-[#3c3c4399] dark:text-[#ebebf599]">다른 단어 또는 초성으로 다시 찾아보세요.</p>
              </div>
            ) : (
              filteredPhrases.map((item, index) => (
                <DictionaryPhraseRow
                  key={item.id}
                  item={item}
                  meta={CATEGORY_META[item.category]}
                  onOpen={handlePhraseOpen}
                  onPlayAudio={playAudio}
                  prefersReducedMotion={prefersReducedMotion}
                  showDivider={index < filteredPhrases.length - 1}
                  speakerGender={speakerGender}
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
