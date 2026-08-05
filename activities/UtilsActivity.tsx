import React from "react";
import Image from "next/image";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useFlow } from "@stackflow/react";
import { ArrowRight } from "lucide-react";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";
import { AnimatedContent } from "@/components/ui/animated-content";

const utilityCards = [
  {
    activity: "ExchangeActivity" as const,
    title: "실수하지 마! 환율 계산기",
    description: "태국 바트 바가지 쓰지 않도록 원화랑 달러로 똑바로 확인해!",
    meta: "바가지 방지 · ฿100 ≈ ₩3,850",
    imageSrc: "/card-exchange-ruka.jpg",
    delay: 0.12,
  },
  {
    activity: "DictionaryActivity" as const,
    title: "당황 금지! 현지 태국어 사전",
    description: "말 안 통한다고 버벅이지 말고, 발음 듣거나 현지인한테 크게 보여줘!",
    meta: "버벅임 방지 · 검색 · 발음 · 크게 보기",
    imageSrc: "/card-dictionary-echidna.png",
    delay: 0.22,
  },
] as const;

export const UtilsActivity: React.FC = () => {
  const { push } = useFlow();

  return (
    <AppScreen appBar={{ title: "유틸 도구... 실수하지 마!" }}>
      <div className="flex min-h-full w-full flex-col overflow-y-auto bg-slate-50 px-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] pt-5 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
          <header>
            <AnimatedContent
              distance={24}
              direction="vertical"
              duration={0.5}
              ease="power2.out"
              delay={0.05}
            >
              <p className="text-base sm:text-lg font-black tracking-tight text-[#00256C] dark:text-cyan-400" style={{ fontFamily: "var(--font-korean-air)" }}>
                방콕에서 바가지 쓰거나 당황하지 말라고!
              </p>
            </AnimatedContent>
          </header>

          <div className="flex flex-col gap-4">
            {utilityCards.map((card) => {
              return (
                <AnimatedContent
                  key={card.activity}
                  distance={30}
                  direction="vertical"
                  duration={0.55}
                  ease="power2.out"
                  delay={card.delay}
                >
                  <button
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
                </AnimatedContent>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav active="utils" />
    </AppScreen>
  );
};
