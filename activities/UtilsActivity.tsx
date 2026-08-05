import React from "react";
import Image from "next/image";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useFlow } from "@stackflow/react";
import { ArrowRight } from "lucide-react";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";
import { AnimatedContent } from "@/components/ui/animated-content";
import { TextLoop } from "@/components/core/text-loop";

const utilityCards = [
  {
    activity: "ExchangeActivity" as const,
    title: "실수하지 마! 환율 계산기",
    description: "태국 바트 바가지 쓰지 않도록 원화랑 달러로 똑바로 확인해!",
    meta: "바가지 방지 · ฿100 ≈ ₩3,850",
    imageSrc: "/card-exchange-ruka.jpg",
    baseDelay: 0.1,
  },
  {
    activity: "DictionaryActivity" as const,
    title: "당황 금지! 현지 태국어 사전",
    description: "말 안 통한다고 버벅이지 말고, 발음 듣거나 현지인한테 크게 보여줘!",
    meta: "버벅임 방지 · 검색 · 발음 · 크게 보기",
    imageSrc: "/card-dictionary-echidna.png",
    baseDelay: 0.36,
  },
] as const;

export const UtilsActivity: React.FC = () => {
  const { push } = useFlow();
  const [thbRate, setThbRate] = React.useState<number>(42.8);

  React.useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/THB")
      .then((res) => res.json())
      .then((json) => {
        if (json?.result === "success" && json?.rates?.KRW) {
          setThbRate(Number(json.rates.KRW.toFixed(2)));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AppScreen appBar={{ title: "유틸 도구... 실수하지 마!" }}>
      <div className="flex min-h-full w-full flex-col overflow-y-auto bg-slate-50 px-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] pt-5 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
          <header>
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

          <div className="flex flex-col gap-4">
            {utilityCards.map((card) => {
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
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback();
                      push(card.activity, {});
                    }}
                    className="group w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200/80 transition-transform active:scale-[0.985] dark:bg-slate-900 dark:ring-slate-800"
                  >
                    <div className="flex items-start gap-4">
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
                                  <TextLoop
                                    className="overflow-y-clip"
                                    interval={2.5}
                                    transition={{
                                      type: "spring",
                                      stiffness: 900,
                                      damping: 80,
                                      mass: 10,
                                    }}
                                    variants={{
                                      initial: {
                                        y: 20,
                                        rotateX: 90,
                                        opacity: 0,
                                        filter: "blur(4px)",
                                      },
                                      animate: {
                                        y: 0,
                                        rotateX: 0,
                                        opacity: 1,
                                        filter: "blur(0px)",
                                      },
                                      exit: {
                                        y: -20,
                                        rotateX: -90,
                                        opacity: 0,
                                        filter: "blur(4px)",
                                      },
                                    }}
                                  >
                                    <span>฿1 ≈ ₩{Math.round(thbRate).toLocaleString()}</span>
                                    <span>฿10 ≈ ₩{Math.round(thbRate * 10).toLocaleString()}</span>
                                    <span>฿100 ≈ ₩{Math.round(thbRate * 100).toLocaleString()}</span>
                                  </TextLoop>
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
