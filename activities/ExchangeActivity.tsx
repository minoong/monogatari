import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { supabase } from "../lib/supabase";
import { RefreshCcw, Save, Loader2 } from "lucide-react";

interface ExchangeRate {
  currency: string;
  rate_to_krw: number;
  source: string;
  updated_at: string;
}

export const ExchangeActivity: React.FC = () => {
  const [krw, setKrw] = useState<string>("38000");
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
      // Fetch latest rates using free ExchangeRate-API
      const res = await fetch("https://open.er-api.com/v6/latest/KRW");
      const data = await res.json();
      
      if (data && data.rates) {
        // Since base is KRW, 1 KRW = x THB. Therefore 1 THB = 1 / x KRW
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

  const krwValue = parseFloat(krw || "0");
  const thbValue = (krwValue / rates.THB).toFixed(2);
  const usdValue = (krwValue / rates.USD).toFixed(2);

  return (
    <AppScreen appBar={{ title: "환율 계산기" }}>
      <div className="flex flex-col flex-1 p-4 bg-gray-50 dark:bg-gray-900 pb-20 overflow-y-auto">
        <div className="flex justify-between items-center mb-2 px-2">
          <p className="text-xs text-gray-500">
            마지막 업데이트: {lastUpdated || "로딩 중..."}
          </p>
          <button 
            onClick={handleUpdateAPI}
            disabled={updating || loading}
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium hover:bg-blue-200 transition disabled:opacity-50"
          >
            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
            API 업데이트
          </button>
        </div>

        <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-500">원화 (KRW)</label>
            <div className="flex items-end gap-2 border-b-2 border-blue-500 pb-2">
              <span className="text-3xl font-bold">₩</span>
              <input 
                type="number" 
                value={krw}
                onChange={(e) => setKrw(e.target.value)}
                className="text-4xl font-extrabold w-full bg-transparent outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 p-2 rounded-full shadow-sm">
              ⇅
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-gray-500">바트 (THB)</label>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                1 THB = 
                <input 
                  className="w-16 bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-right outline-none focus:ring-1 focus:ring-blue-500" 
                  value={rates.THB}
                  onChange={(e) => setRates({...rates, THB: parseFloat(e.target.value) || 0})}
                /> KRW
                <button onClick={() => handleManualSave('THB', rates.THB.toString())} className="text-blue-500 hover:text-blue-600"><Save className="w-3 h-3"/></button>
              </div>
            </div>
            <div className="flex items-end gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-3xl font-bold text-gray-400">฿</span>
              <span className="text-4xl font-extrabold w-full truncate">{loading ? "..." : thbValue}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-gray-500">미국 달러 (USD)</label>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                1 USD = 
                <input 
                  className="w-16 bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-right outline-none focus:ring-1 focus:ring-blue-500" 
                  value={rates.USD}
                  onChange={(e) => setRates({...rates, USD: parseFloat(e.target.value) || 0})}
                /> KRW
                <button onClick={() => handleManualSave('USD', rates.USD.toString())} className="text-blue-500 hover:text-blue-600"><Save className="w-3 h-3"/></button>
              </div>
            </div>
            <div className="flex items-end gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-3xl font-bold text-gray-400">$</span>
              <span className="text-4xl font-extrabold w-full truncate">{loading ? "..." : usdValue}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            💡 환율 계산기 사용법
          </h3>
          <ul className="mt-2 text-blue-700 dark:text-blue-400 leading-relaxed text-sm list-disc pl-4 space-y-1">
            <li>원화를 입력하면 바트(THB)와 달러(USD)로 자동 변환됩니다.</li>
            <li>우측 상단 <strong>API 업데이트</strong> 버튼을 누르면 최신 환율 정보를 불러옵니다.</li>
            <li>기준 환율(1 THB = ? KRW) 값을 직접 수정하고 저장 버튼(<Save className="w-3 h-3 inline"/>)을 눌러 임의의 환율을 저장할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </AppScreen>
  );
};
