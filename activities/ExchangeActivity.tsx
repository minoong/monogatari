import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { supabase } from "../lib/supabase";
import { RefreshCcw, Save, Loader2 } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { NumberFlowInput } from "@daformat/react-number-flow-input";
import { motion } from "framer-motion";

interface ExchangeRate {
  currency: string;
  rate_to_krw: number;
  source: string;
  updated_at: string;
}

export const ExchangeActivity: React.FC = () => {
  const [krw, setKrw] = useState<number | undefined>(100000);
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

  const thbValue = krw ? krw / rates.THB : 0;
  const usdValue = krw ? krw / rates.USD : 0;

  // 가변 사이즈 로직: 모바일 환경에 맞춰 극단적으로 줄이도록 조정
  const getFontSize = (val: number | undefined) => {
    if (!val) return "text-6xl";
    const len = String(val).length;
    if (len > 12) return "text-2xl";
    if (len > 9) return "text-3xl";
    if (len > 7) return "text-4xl";
    if (len > 5) return "text-5xl";
    return "text-6xl";
  };

  return (
    <AppScreen appBar={{ title: "환율 계산기" }}>
      {/* 가로 스크롤 완전 차단을 위해 overflow-x-hidden 추가 */}
      <div className="flex flex-col flex-1 bg-neutral-950 text-white pb-20 overflow-y-auto overflow-x-hidden">
        
        {/* 상단 컨트롤 영역 */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur z-10 sticky top-0">
          <p className="text-xs text-neutral-400">
            {lastUpdated ? `업데이트: ${lastUpdated}` : "로딩 중..."}
          </p>
          <button 
            onClick={handleUpdateAPI}
            disabled={updating || loading}
            className="flex items-center gap-1.5 text-xs bg-white/10 text-white px-3 py-1.5 rounded-full font-medium hover:bg-white/20 transition disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            API 갱신
          </button>
        </div>

        {/* 메인 KRW 입력 영역 */}
        <div className="flex flex-col items-center justify-center p-8 min-h-[40vh] border-b border-neutral-900 relative overflow-hidden w-full max-w-full">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-full"
          >
            <p className="text-neutral-500 text-sm mb-6 font-medium tracking-widest uppercase">
              Enter KRW Amount
            </p>
            <div className="flex justify-center w-full max-w-full">
              <NumberFlowInput
                value={krw}
                onChange={(val) => setKrw(val)}
                format
                placeholder="0"
                maxLength={14}
                className={`font-semibold tracking-tighter w-full max-w-full bg-transparent outline-none text-center transition-all duration-300 ease-out ${getFontSize(krw)}`}
              />
            </div>
          </motion.div>
        </div>

        {/* 변환 결과 영역 */}
        <div className="flex flex-col flex-1 p-6 gap-8 bg-neutral-950">
          {/* THB */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400 font-medium">태국 바트 (THB)</span>
              <div className="flex items-center gap-2 text-neutral-500">
                <span>1 THB =</span>
                <input 
                  className="w-16 bg-neutral-900 rounded px-2 py-1 text-right text-white outline-none focus:ring-1 focus:ring-neutral-700 transition" 
                  value={rates.THB}
                  onChange={(e) => setRates({...rates, THB: parseFloat(e.target.value) || 0})}
                />
                <span>KRW</span>
                <button onClick={() => handleManualSave('THB', rates.THB.toString())} className="text-neutral-400 hover:text-white transition">
                  <Save className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white flex gap-2">
              <span className="text-neutral-600">฿</span>
              <NumberFlow 
                value={thbValue} 
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} 
                className={loading ? "opacity-50" : ""}
              />
            </div>
          </motion.div>

          <div className="h-px bg-neutral-900 w-full" />

          {/* USD */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400 font-medium">미국 달러 (USD)</span>
              <div className="flex items-center gap-2 text-neutral-500">
                <span>1 USD =</span>
                <input 
                  className="w-16 bg-neutral-900 rounded px-2 py-1 text-right text-white outline-none focus:ring-1 focus:ring-neutral-700 transition" 
                  value={rates.USD}
                  onChange={(e) => setRates({...rates, USD: parseFloat(e.target.value) || 0})}
                />
                <span>KRW</span>
                <button onClick={() => handleManualSave('USD', rates.USD.toString())} className="text-neutral-400 hover:text-white transition">
                  <Save className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white flex gap-2">
              <span className="text-neutral-600">$</span>
              <NumberFlow 
                value={usdValue} 
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} 
                className={loading ? "opacity-50" : ""}
              />
            </div>
          </motion.div>
        </div>

      </div>
    </AppScreen>
  );
};
