import React, { useState, useRef } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Save, X } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { NumberFlowInput } from "@daformat/react-number-flow-input";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import NeumorphButton from "../components/ui/neumorph-button";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { StateTextRoll } from "@/components/core/state-text-roll";

import { useExchangeRates } from "@/lib/exchange-rates";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip, useGSAP);
}

export const ExchangeActivity: React.FC = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { data: exchangeData, isLoading: loading } = useExchangeRates();
  const [customRates, setCustomRates] = useState<{ THB?: number; USD?: number }>({});

  const rates = {
    THB: customRates.THB ?? exchangeData?.THB ?? 42.8,
    USD: customRates.USD ?? exchangeData?.USD ?? 1380,
  };
  const lastUpdatedTime = exchangeData?.lastUpdatedText ?? null;

  const [thb, setThb] = useState<number | undefined>(0);
  const [inputCurrency, setInputCurrency] = useState<"THB" | "KRW">("THB");
  const [previousInputCurrency, setPreviousInputCurrency] = useState<"THB" | "KRW">("THB");
  const [currencyTransitionKey, setCurrencyTransitionKey] = useState(0);
  const isClearing = useRef(false);
  const [inputKey, setInputKey] = useState(0);

  const flipState = useRef<Flip.FlipState | null>(null);

  const handleFocusToggle = (focused: boolean) => {
    // Capture state of the card container and the moving targets, including font properties
    flipState.current = Flip.getState(".thb-flip-container, .thb-flip-target, .thb-flip-text", { props: "opacity,fontSize,lineHeight" });
    setIsFocused(focused);
  };

  useGSAP(() => {
    if (flipState.current) {
      Flip.from(flipState.current, {
        duration: 0.4,
        ease: "power2.out", // Match framer motion easeOut
        scale: false, // Animate width/height natively instead of scaling to avoid text squishing
        nested: true,
      });
      flipState.current = null;
    }
  }, { dependencies: [isFocused] });

  const handleManualSave = (currency: 'THB' | 'USD', valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val) && val > 0) {
      setCustomRates((prev) => ({ ...prev, [currency]: val }));
      alert(`${currency} 환율이 수동 변경되었습니다! (${val}원)`);
    }
  };

  const isKrwInput = inputCurrency === "KRW";
  const krwValue = isKrwInput ? (thb ?? 0) : (thb ? thb * rates.THB : 0);
  const thbValue = isKrwInput ? ((thb ?? 0) / rates.THB) : (thb ?? 0);
  const usdValue = krwValue ? krwValue / rates.USD : 0;

  const toggleInputCurrency = () => {
    const currentKrw = isKrwInput ? (thb ?? 0) : (thb ?? 0) * rates.THB;
    const nextCurrency = isKrwInput ? "THB" : "KRW";

    setPreviousInputCurrency(inputCurrency);
    setThb(nextCurrency === "KRW" ? Math.round(currentKrw) : Number((currentKrw / rates.THB).toFixed(2)));
    setInputCurrency(nextCurrency);
    setCurrencyTransitionKey((key) => key + 1);
  };

  // 가변 사이즈 로직: 모바일 환경에 맞춰 극단적으로 줄이도록 조정
  const getFontSize = (val: number | undefined) => {
    if (isFocused) {
      if (!val) return "text-4xl";
      const len = String(val).length;
      if (len > 12) return "text-2xl";
      if (len > 9) return "text-3xl";
      return "text-4xl";
    }
    if (!val) return "text-7xl";
    const len = String(val).length;
    if (len > 11) return "text-4xl";
    if (len > 9) return "text-5xl";
    if (len > 7) return "text-6xl";
    return "text-7xl";
  };

  return (
    <AppScreen appBar={{ title: "환율 계산기... 바가지 쓰지 마!" }}>
      <div className="flex flex-col min-h-full w-full bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-gray-950 dark:to-indigo-950/30 text-gray-900 dark:text-white pb-12 overflow-x-hidden">
        
        <motion.div layout className={`flex flex-col px-4 pb-4 gap-3 max-w-lg mx-auto w-full ${isFocused ? 'pt-2' : 'pt-6'}`}>
          <LayoutGroup id="exchange-currency-cards">
          
          {/* 메인 입력 (THB) 카드 */}
          <motion.div layout layoutId={`exchange-currency-${inputCurrency}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <div className="thb-flip-container border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
              <div className={`relative ${isFocused ? 'py-1.5 px-3' : 'px-4 py-3'}`}>
                <div className={`flex flex-col`}>
                  
                  <div 
                    className={`thb-flip-container flex ${isFocused ? 'flex-row justify-between items-center min-h-[40px] pr-9' : 'flex-col justify-center items-center min-h-[72px]'} w-full max-w-full cursor-text relative`} 
                    onPointerDown={(event) => {
                      if (isFocused && event.target !== inputRef.current) {
                        event.preventDefault();
                      }
                    }}
                    onClick={() => {
                      if (isFocused) return;
                      inputRef.current?.focus();
                    }}
                  >
                    {/* The Flag */}
                    <div className={`thb-flip-target relative flex shrink-0 justify-center items-center rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 ring-white/80 dark:ring-white/10 ${isFocused ? 'size-6 ring-2' : 'size-14 ring-4 mb-3'}`}>
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.img
                          key={inputCurrency}
                          src={isKrwInput ? "https://flagcdn.com/w80/kr.png" : "https://flagcdn.com/w80/th.png"}
                          alt={isKrwInput ? "South Korea Flag" : "Thailand Flag"}
                          initial={{ opacity: 0, y: 8, scale: 0.82, rotate: -8 }}
                          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, y: -8, scale: 1.12, rotate: 8 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </AnimatePresence>
                    </div>

                    {/* The disappearing text */}
                    <div className={`thb-flip-text flex justify-center w-full shrink-0 overflow-hidden ${isFocused ? 'absolute opacity-0 h-0 mb-0 pointer-events-none' : 'relative opacity-100 h-[20px] mb-8'}`}>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        <StateTextRoll value={isKrwInput ? "대한민국 원 (KRW)" : "태국 바트 (THB)"} previousValue={previousInputCurrency === "KRW" ? "대한민국 원 (KRW)" : "태국 바트 (THB)"} transitionKey={currencyTransitionKey} />
                      </p>
                    </div>

                    {/* The Input Row */}
                    <div className={`thb-flip-target flex items-center ${getFontSize(thb)}`}>
                      <span className="font-bold text-slate-400 dark:text-slate-600 mr-2">{isKrwInput ? "₩" : "฿"}</span>
                      <NumberFlowInput
                        key={`input-reset-${inputKey}`}
                        ref={inputRef}
                        value={thb}
                        onChange={setThb}
                        onFocus={() => {
                          if (!isFocused) handleFocusToggle(true);
                          setTimeout(() => {
                            const activeEl = document.activeElement as HTMLInputElement;
                            if (activeEl && typeof activeEl.select === 'function') {
                              activeEl.select();
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 50);
                        }}
                        onBlur={() => {
                          if (!isClearing.current) {
                            handleFocusToggle(false);
                          }
                        }}
                        format
                        placeholder="0"
                        maxLength={15}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        {...({ inputMode: "numeric", pattern: "[0-9]*" } as any)}
                        className={`font-extrabold tracking-tighter bg-transparent outline-none text-slate-800 dark:text-white`}
                      />
                      {/* Blinking Cursor Animation (Only when NOT focused) */}
                      {!isFocused && (
                        <motion.div 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                          className={`w-[3px] bg-indigo-500 dark:bg-indigo-400 ml-1 rounded-full ${thb === 0 || thb === undefined ? 'block' : 'opacity-70'}`}
                          style={{ height: '0.85em' }}
                        />
                      )}
                    </div>

                    {/* Absolute Clear Button */}
                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-opacity duration-300 z-10 ${isFocused && thb !== undefined && String(thb).length > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                      <NeumorphButton
                        type="button"
                        intent="secondary"
                        size="small"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          isClearing.current = true;
                          setThb(undefined);
                          setInputKey(prev => prev + 1);
                          setTimeout(() => {
                            inputRef.current?.focus();
                            isClearing.current = false;
                          }, 50);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="!p-1.5 !h-auto !w-auto !rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                      </NeumorphButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 환산 결과 (KRW, USD) */}
          <div className="grid grid-cols-1 gap-3 mt-2">
            
            {/* 입력 통화와 반대편 환산 카드 */}
            <motion.div layout layoutId={`exchange-currency-${isKrwInput ? "THB" : "KRW"}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}>
              <Card
                role="button"
                tabIndex={0}
                aria-pressed={isKrwInput}
                aria-label={isKrwInput ? "태국 바트 입력으로 전환" : "대한민국 원 입력으로 전환"}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("input, button")) return;
                  toggleInputCurrency();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleInputCurrency();
                  }
                }}
                className="cursor-pointer border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)] bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <CardContent className="px-4 py-2 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-slate-100 shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10">
                        <AnimatePresence initial={false} mode="popLayout">
                          <motion.img
                            key={`result-flag-${inputCurrency}`}
                            src={isKrwInput ? "https://flagcdn.com/w80/th.png" : "https://flagcdn.com/w80/kr.png"}
                            alt={isKrwInput ? "Thailand Flag" : "South Korea Flag"}
                            initial={{ opacity: 0, y: 6, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 1.1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="size-full object-cover"
                          />
                        </AnimatePresence>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        <StateTextRoll value={isKrwInput ? "태국 바트 (THB)" : "대한민국 원 (KRW)"} previousValue={previousInputCurrency === "KRW" ? "태국 바트 (THB)" : "대한민국 원 (KRW)"} transitionKey={currencyTransitionKey} />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>1 THB =</span>
                      <input 
                        className="w-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-1 text-right text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        value={rates.THB}
                        onChange={(e) => setCustomRates((prev) => ({ ...prev, THB: parseFloat(e.target.value) || 0 }))}
                      />
                      <button onClick={() => handleManualSave('THB', rates.THB.toString())} className="hover:text-indigo-500 transition ml-0.5 p-1">
                        <Save className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-2xl font-semibold mt-0.5">{isKrwInput ? "฿" : "₩"}</span>
                    <NumberFlow 
                      value={isKrwInput ? thbValue : krwValue}
                      format={{ notation: 'standard', minimumFractionDigits: 0, maximumFractionDigits: 2 }}
                      className={`text-slate-800 dark:text-slate-100 ${loading ? "opacity-50" : ""}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* USD 카드 */}
            <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}>
              <Card className="border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)] bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl transition-transform hover:scale-[1.01]">
                <CardContent className="px-4 py-2 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        <AvatarImage src="https://flagcdn.com/w80/us.png" alt="USA Flag" />
                        <AvatarFallback>US</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">미국 달러 (USD)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>1 USD =</span>
                      <input 
                        className="w-14 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-1 text-right text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        value={rates.USD}
                        onChange={(e) => setCustomRates((prev) => ({ ...prev, USD: parseFloat(e.target.value) || 0 }))}
                      />
                      <span>KRW</span>
                      <button onClick={() => handleManualSave('USD', rates.USD.toString())} className="hover:text-indigo-500 transition ml-0.5 p-1">
                        <Save className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-slate-400 dark:text-slate-500 text-2xl font-semibold mt-0.5">$</span>
                    <NumberFlow 
                      value={usdValue} 
                      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} 
                      className={`text-slate-800 dark:text-slate-100 ${loading ? "opacity-50" : ""}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 하단 실시간 환율 안내 */}
            {!isFocused && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-1 flex items-center justify-between px-2.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">실시간 환율</span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">1 THB = {rates.THB}원</span>
                </div>
                {lastUpdatedTime && (
                  <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500">{lastUpdatedTime}</span>
                )}
              </motion.div>
            )}
            
          </div>
          </LayoutGroup>
        </motion.div>

      </div>
    </AppScreen>
  );
};
