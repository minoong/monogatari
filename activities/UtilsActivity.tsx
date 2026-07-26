import React from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useFlow } from "@stackflow/react";
import { ArrowRight, Calculator, Languages } from "lucide-react";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";

const utilityCards = [
  {
    activity: "ExchangeActivity" as const,
    title: "환율 계산기",
    description: "태국 바트 금액을 원화와 달러로 빠르게 확인해요.",
    meta: "฿100 ≈ ₩3,850",
    icon: Calculator,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    activity: "DictionaryActivity" as const,
    title: "현지 필수 태국어 사전",
    description: "필수 표현을 찾고 발음을 듣거나 현지인에게 보여주세요.",
    meta: "검색 · 발음 · 크게 보기",
    icon: Languages,
    color: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
  },
] as const;

export const UtilsActivity: React.FC = () => {
  const { push } = useFlow();

  return (
    <AppScreen appBar={{ title: "유틸" }}>
      <div className="flex flex-1 h-full flex-col overflow-y-auto bg-slate-50 px-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] pt-5 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
          <header>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">여행 중 바로 꺼내 쓰는 도구</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              필요한 기능을 선택하세요
            </h1>
          </header>

          <div className="grid gap-3">
            {utilityCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.activity}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback();
                    push(card.activity, {});
                  }}
                  className="group flex min-h-40 w-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm outline-none transition-colors hover:border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${card.color}`}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <ArrowRight
                      size={20}
                      aria-hidden="true"
                      className="mt-1 text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">{card.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                    <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">{card.meta}</p>
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
