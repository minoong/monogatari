"use client";

import React from "react";
import Image from "next/image";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useFlow } from "@stackflow/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@heroui/react";
import { triggerHapticFeedback } from "../components/BottomNav";
import { ClearCacheUtilityCard } from "@/components/utils/ClearCacheUtilityCard";
import { AnimatedContent } from "@/components/ui/animated-content";
import { cardNavButtonClass } from "@/components/ui/drawer-form";
import { useExchangeRates } from "@/lib/exchange-rates";
import { UTILITY_CARDS } from "@/lib/utility-cards";

export const UtilsActivity: React.FC = () => {
  const { push } = useFlow();
  const { data: exchangeData } = useExchangeRates();
  const thbRate = exchangeData?.THB ?? 42.8;

  return (
    <AppScreen appBar={{ title: "유틸 도구... 실수하지 마!" }}>
      <div className="flex min-h-full w-full flex-col bg-white dark:bg-slate-950">
        <div className="flex-1 overflow-y-auto px-4 pt-5">
          <div className="mx-auto w-full max-w-lg">
          <header className="shrink-0">
            <AnimatedContent
              distance={30}
              direction="vertical"
              duration={0.6}
              ease="power3.out"
              scale={0.96}
              delay={0.04}
            >
              <p className="text-base sm:text-lg font-black tracking-tight text-[#00256C] dark:text-cyan-400" style={{ fontFamily: "var(--font-korean-air)" }}>
                방콕에서 바가지 쓰거나 당황하지 말라고!
              </p>
            </AnimatedContent>
          </header>

          <div className="mt-5 flex shrink-0 flex-col gap-4">
            {UTILITY_CARDS.map((card) => {
              const base = card.baseDelay;

              return (
                <AnimatedContent
                  key={card.activity}
                  distance={35}
                  direction="vertical"
                  duration={0.6}
                  ease="power3.out"
                  scale={0.97}
                  delay={base}
                >
                  <Button
                    className={`group w-full rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800 ${cardNavButtonClass}`}
                    fullWidth
                    onPress={() => {
                      triggerHapticFeedback();
                      push(card.activity, {});
                    }}
                    variant="secondary"
                  >
                    <div className="flex w-full items-start gap-4">
                      <AnimatedContent
                        distance={20}
                        direction="vertical"
                        duration={0.5}
                        ease="back.out(1.4)"
                        scale={0.84}
                        delay={base + 0.08}
                      >
                        <div className="relative flex size-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 shadow-md dark:border-slate-800">
                          <Image
                            src={card.imageSrc}
                            alt={card.title}
                            fill
                            sizes="56px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </AnimatedContent>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <AnimatedContent
                              distance={15}
                              direction="vertical"
                              duration={0.45}
                              ease="power3.out"
                              delay={base + 0.12}
                            >
                              <h2 className="text-base font-bold text-[#00256C] dark:text-cyan-300">{card.title}</h2>
                            </AnimatedContent>

                              {card.activity === "ExchangeActivity" ? (
                                <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                                  <span>실시간 ·</span>
                                  <span>฿10 ≈ ₩{Math.round(thbRate * 10).toLocaleString()}</span>
                                </div>
                              ) : (
                                <p className="mt-0.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">{card.meta}</p>
                              )}
                          </div>

                          <AnimatedContent
                            distance={10}
                            direction="vertical"
                            duration={0.4}
                            ease="power2.out"
                            scale={0.8}
                            delay={base + 0.22}
                          >
                            <ArrowRight aria-hidden="true" className="size-5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                          </AnimatedContent>
                        </div>

                        <AnimatedContent
                          distance={18}
                          direction="vertical"
                          duration={0.5}
                          ease="power3.out"
                          delay={base + 0.24}
                        >
                          <p className="mt-3 text-sm leading-6 font-medium text-slate-700 dark:text-slate-200">{card.description}</p>
                        </AnimatedContent>
                      </div>
                    </div>
                  </Button>
                </AnimatedContent>
              );
            })}
          </div>
          </div>
        </div>

        <div className="shrink-0 px-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] pt-2">
          <div className="mx-auto w-full max-w-lg">
            <ClearCacheUtilityCard />
          </div>
        </div>
      </div>
    </AppScreen>
  );
};
