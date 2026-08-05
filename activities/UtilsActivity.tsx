import React from "react";
import Image from "next/image";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useFlow } from "@stackflow/react";
import { ArrowRight } from "lucide-react";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";

const utilityCards = [
  {
    activity: "ExchangeActivity" as const,
    title: "실수하지 마! 환율 계산기",
    description: "태국 바트 바가지 쓰지 않도록 원화랑 달러로 똑바로 확인해!",
    meta: "바가지 방지 · ฿100 ≈ ₩3,850",
    imageSrc: "/card-exchange-ruka.jpg",
    accent: "from-[#00256C] to-blue-600",
  },
  {
    activity: "DictionaryActivity" as const,
    title: "당황 금지! 현지 태국어 사전",
    description: "말 안 통한다고 버벅이지 말고, 발음 듣거나 현지인한테 크게 보여줘!",
    meta: "버벅임 방지 · 검색 · 발음 · 크게 보기",
    imageSrc: "/card-dictionary-echidna.png",
    accent: "from-violet-600 to-purple-600",
  },
] as const;

export const UtilsActivity: React.FC = () => {
  const { push } = useFlow();

  return (
    <AppScreen appBar={{ title: "유틸 도구... 실수하지 마!" }}>
      <div className="flex min-h-full w-full flex-col overflow-y-auto bg-slate-50 px-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] pt-5 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
          <header>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#00256C] dark:text-cyan-400">방콕에서 바가지 쓰거나 당황하지 말라고!</p>
          </header>

          <div className="flex flex-col gap-4">
            {utilityCards.map((card) => {
              return (
                <button
                  key={card.activity}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback();
                    push(card.activity, {});
                  }}
                  className="group w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200/80 transition-transform active:scale-[0.985] dark:bg-slate-900 dark:ring-slate-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex size-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 shadow-md dark:border-slate-800">
                      <Image
                        src={card.imageSrc}
                        alt={card.title}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base font-bold text-[#00256C] dark:text-cyan-300">{card.title}</h2>
                          <p className="mt-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">{card.meta}</p>
                        </div>
                        <ArrowRight aria-hidden="true" className="size-5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-3 text-sm leading-6 font-medium text-slate-700 dark:text-slate-200">{card.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav active="utils" />
    </AppScreen>
  );
};
