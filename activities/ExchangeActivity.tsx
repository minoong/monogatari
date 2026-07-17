import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { supabase } from "../lib/supabase";
import { RefreshCcw, Save, Loader2, DollarSign, Wallet } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { NumberFlowInput } from "@daformat/react-number-flow-input";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";

interface ExchangeRate {
  currency: string;
  rate_to_krw: number;
  source: string;
  updated_at: string;
}

export const ExchangeActivity: React.FC = () => {
  const [thb, setThb] = useState<number | undefined>(1000);
  const [rates, setRates] = useState<{ THB: number; USD: number }>({ THB: 38.5, USD: 1380 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchRatesFromDB = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("exchange_rates").select("*");
      if (error) throw error;

      if (data && data.length > 0) {
        setRates(prevRates => {
          const newRates = { ...prevRates };
          let latestDate = "";
          data.forEach((rate: ExchangeRate) => {
            if (rate.currency === "THB") newRates.THB = rate.rate_to_krw;
            if (rate.currency === "USD") newRates.USD = rate.rate_to_krw;
            if (rate.updated_at > latestDate) latestDate = rate.updated_at;
          });
          if (latestDate) {
            setLastUpdated(new Date(latestDate).toLocaleString());
          }
          return newRates;
        });
      }
    } catch (err) {
      console.error("Failed to fetch rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRatesFromDB();
  }, [fetchRatesFromDB]);

  const handleUpdateAPI = async () => {
    try {
      setUpdating(true);
      const res = await fetch("https://open.er-api.com/v6/latest/KRW");
      const data = await res.json();
      
      if (data && data.rates) {
        const thbRate = 1 / data.rates.THB;
        const usdRate = 1 / data.rates.USD;
        
        await updateDBRate("THB", parseFloat(thbRate.toFixed(4)), "api");
        await updateDBRate("USD", parseFloat(usdRate.toFixed(4)), "api");
        
        await fetchRatesFromDB();
        alert("환율이 최신화되었습니다!");
      }
    } catch (err) {
      console.error("Failed to update from API:", err);
      alert("API 업데이트 실패!");
    } finally {
      setUpdating(false);
    }
  };

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
      setUpdating(true);
      await updateDBRate(currency, val, "manual");
      await fetchRatesFromDB();
      setUpdating(false);
      alert(`${currency} 환율이 수동으로 저장되었습니다!`);
    }
  };

  const krwValue = thb ? thb * rates.THB : 0;
  const usdValue = thb ? (thb * rates.THB) / rates.USD : 0;

  // 가변 사이즈 로직: 모바일 환경에 맞춰 극단적으로 줄이도록 조정
  const getFontSize = (val: number | undefined) => {
    if (!val) return "text-6xl";
    const len = String(val).length;
    if (len > 10) return "text-3xl";
    if (len > 7) return "text-4xl";
    if (len > 5) return "text-5xl";
    return "text-6xl";
  };

  return (
    <AppScreen appBar={{ title: "환율 계산기" }}>
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-20 overflow-y-auto overflow-x-hidden">
        
        {/* 상단 컨트롤 영역 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-neutral-800 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur z-10 sticky top-0">
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {lastUpdated ? `업데이트: ${lastUpdated.split(" ")[0]}` : "로딩 중..."}
          </p>
          <button 
            onClick={handleUpdateAPI}
            disabled={updating || loading}
            className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            최신화
          </button>
        </div>

        <div className="flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">
          
          {/* 메인 입력 (THB) 카드 */}
          <Card className="border-none shadow-md bg-white dark:bg-neutral-900 overflow-hidden">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-gray-500 dark:text-neutral-400 mb-6 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" />
                태국 바트 (THB)
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center w-full max-w-full"
              >
                <div className="flex justify-center items-center w-full max-w-full">
                  <span className={`font-bold text-gray-400 dark:text-neutral-600 mr-2 transition-all duration-300 ease-out ${getFontSize(thb)}`}>฿</span>
                  <NumberFlowInput
                    value={thb}
                    onChange={(val) => setThb(val)}
                    format
                    placeholder="0"
                    maxLength={10}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...({ inputMode: "numeric", pattern: "[0-9]*" } as any)}
                    className={`font-extrabold tracking-tighter max-w-full bg-transparent outline-none transition-all duration-300 ease-out text-blue-600 dark:text-blue-400 ${getFontSize(thb)}`}
                  />
                </div>
              </motion.div>
            </CardContent>
          </Card>

          {/* 환산 결과 (KRW, USD) */}
          <div className="grid grid-cols-1 gap-4 mt-2">
            
            {/* KRW 카드 */}
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900/60">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">대한민국 원 (KRW)</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>1 THB =</span>
                    <input 
                      className="w-12 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-transparent rounded px-1.5 py-1 text-right text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition" 
                      value={rates.THB}
                      onChange={(e) => setRates({...rates, THB: parseFloat(e.target.value) || 0})}
                    />
                    <button onClick={() => handleManualSave('THB', rates.THB.toString())} className="hover:text-blue-500 transition ml-1">
                      <Save className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight flex items-center gap-1 mt-1">
                  <span className="text-gray-400 text-xl font-semibold mt-1">₩</span>
                  <NumberFlow 
                    value={krwValue} 
                    format={{ notation: 'standard', maximumFractionDigits: 0 }} 
                    className={loading ? "opacity-50" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* USD 카드 */}
            <Card className="border-none shadow-sm bg-white dark:bg-neutral-900/60">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5"/>미국 달러 (USD)</span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>1 USD =</span>
                    <input 
                      className="w-14 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-transparent rounded px-1.5 py-1 text-right text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 transition" 
                      value={rates.USD}
                      onChange={(e) => setRates({...rates, USD: parseFloat(e.target.value) || 0})}
                    />
                    <span>KRW</span>
                    <button onClick={() => handleManualSave('USD', rates.USD.toString())} className="hover:text-blue-500 transition ml-1">
                      <Save className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight flex items-center gap-1 mt-1">
                  <span className="text-gray-400 text-lg font-semibold mt-1">$</span>
                  <NumberFlow 
                    value={usdValue} 
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} 
                    className={loading ? "opacity-50" : ""}
                  />
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>

      </div>
    </AppScreen>
  );
};
