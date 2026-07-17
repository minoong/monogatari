import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { supabase } from "../lib/supabase";
import { Save } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { NumberFlowInput } from "@daformat/react-number-flow-input";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface ExchangeRate {
  currency: string;
  rate_to_krw: number;
  source: string;
  updated_at: string;
}

export const ExchangeActivity: React.FC = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [rates, setRates] = useState<{ THB: number; USD: number }>({ THB: 38.5, USD: 1380 });
  // 한화 1000원을 기준으로 한 바트 값을 기본값으로 설정 (약 25.97 밧)
  const [thb, setThb] = useState<number | undefined>(Number((1000 / 38.5).toFixed(2)));
  const isPristine = React.useRef(true);
  const [loading, setLoading] = useState(true);

  const fetchRatesFromDB = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .in('currency', ['THB', 'USD']);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newRates = { ...rates };
        data.forEach(rate => {
          if (rate.currency === 'THB') newRates.THB = rate.rate_to_krw;
          if (rate.currency === 'USD') newRates.USD = rate.rate_to_krw;
        });
        setRates(newRates);
        
        // 사용자가 아직 값을 입력하지 않았다면(초기 상태), DB에서 가져온 최신 환율 기준으로 한화 1000원에 맞게 바트 업데이트
        if (isPristine.current) {
          setThb(Number((1000 / newRates.THB).toFixed(2)));
        }
      }
    } catch (err) {
      console.error("Failed to load rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRatesFromDB();
  }, [fetchRatesFromDB]);

  const updateDBRate = async (currency: string, rate: number, source: string) => {
    await supabase.from("exchange_rates").upsert({
      currency,
      rate_to_krw: rate,
      source,
      updated_at: new Date().toISOString()
    }, { onConflict: 'currency' });
  };

  const handleManualSave = async (currency: 'THB' | 'USD', valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val) && val > 0) {
      await updateDBRate(currency, val, "manual");
      await fetchRatesFromDB();
      alert(`${currency} 환율이 저장되었습니다!`);
    }
  };

  const krwValue = thb ? thb * rates.THB : 0;
  const usdValue = thb ? (thb * rates.THB) / rates.USD : 0;

  // 가변 사이즈 로직: 모바일 환경에 맞춰 극단적으로 줄이도록 조정
  const getFontSize = (val: number | undefined) => {
    if (!val) return "text-6xl";
    const len = String(val).length;
    if (len > 10) return "text-4xl";
    if (len > 7) return "text-5xl";
    if (len > 5) return "text-6xl";
    return "text-7xl";
  };

  return (
    <AppScreen appBar={{ title: "환율 계산기" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-gray-950 dark:to-indigo-950/30 text-gray-900 dark:text-white pb-20 overflow-y-auto overflow-x-hidden">
        
        <div className="flex flex-col p-5 gap-5 max-w-lg mx-auto w-full pt-8">
          
          {/* 메인 입력 (THB) 카드 */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
            <Card className="border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] bg-white/70 dark:bg-black/40 backdrop-blur-xl overflow-hidden rounded-3xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center gap-3 mb-8">
                  <Avatar className="size-14 ring-4 ring-white/80 dark:ring-white/10 shadow-sm">
                    <AvatarImage src="https://flagcdn.com/w80/th.png" alt="Thailand Flag" />
                    <AvatarFallback>TH</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    태국 바트 (THB)
                  </p>
                </div>
                
                <div 
                  className={`flex justify-center items-center w-full max-w-full cursor-text ${getFontSize(thb)}`} 
                  onClick={() => inputRef.current?.focus()}
                >
                  <span className="font-bold text-slate-400 dark:text-slate-600 mr-2">฿</span>
                  <NumberFlowInput
                    ref={inputRef}
                    value={thb}
                    onChange={(val) => {
                      isPristine.current = false;
                      setThb(val);
                    }}
                    onFocus={(e) => {
                      setIsFocused(true);
                      setTimeout(() => {
                        inputRef.current?.select();
                      }, 50);
                    }}
                    onBlur={() => setIsFocused(false)}
                    format
                    placeholder="0"
                    maxLength={10}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({ inputMode: "numeric", pattern: "[0-9]*" } as any)}
                    className="font-extrabold tracking-tighter bg-transparent outline-none text-slate-800 dark:text-white"
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
              </CardContent>
            </Card>
          </motion.div>

          {/* 환산 결과 (KRW, USD) */}
          <div className="grid grid-cols-1 gap-4 mt-2">
            
            {/* KRW 카드 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}>
              <Card className="border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)] bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl transition-transform hover:scale-[1.01]">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                        <AvatarImage src="https://flagcdn.com/w80/kr.png" alt="South Korea Flag" />
                        <AvatarFallback>KR</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">대한민국 원 (KRW)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>1 THB =</span>
                      <input 
                        className="w-12 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-1 text-right text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                        value={rates.THB}
                        onChange={(e) => setRates({...rates, THB: parseFloat(e.target.value) || 0})}
                      />
                      <button onClick={() => handleManualSave('THB', rates.THB.toString())} className="hover:text-indigo-500 transition ml-0.5 p-1">
                        <Save className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight flex items-center gap-1.5 mt-0.5 pl-1">
                    <span className="text-slate-400 dark:text-slate-500 text-2xl font-semibold mt-0.5">₩</span>
                    <NumberFlow 
                      value={krwValue} 
                      format={{ notation: 'standard', maximumFractionDigits: 0 }} 
                      className={`text-slate-800 dark:text-slate-100 ${loading ? "opacity-50" : ""}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* USD 카드 */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}>
              <Card className="border-white/60 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.15)] bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl transition-transform hover:scale-[1.01]">
                <CardContent className="p-6 flex flex-col gap-4">
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
                        onChange={(e) => setRates({...rates, USD: parseFloat(e.target.value) || 0})}
                      />
                      <span>KRW</span>
                      <button onClick={() => handleManualSave('USD', rates.USD.toString())} className="hover:text-indigo-500 transition ml-0.5 p-1">
                        <Save className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight flex items-center gap-1.5 mt-0.5 pl-1">
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
            
          </div>
        </div>

      </div>
    </AppScreen>
  );
};
