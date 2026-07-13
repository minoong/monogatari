import React, { useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";

export const ExchangeActivity: React.FC<any> = () => {
  const [krw, setKrw] = useState<string>("38000");
  const exchangeRate = 38.5; // Dummy rate: 1 THB = 38.5 KRW

  const thb = (parseFloat(krw || "0") / exchangeRate).toFixed(2);

  return (
    <AppScreen appBar={{ title: "환율 계산기" }}>
      <div className="flex flex-col flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-sm flex flex-col gap-6 mt-4">
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
            <button className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-2 rounded-full shadow-sm">
              ⇅
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-500">바트 (THB)</label>
            <div className="flex items-end gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-2">
              <span className="text-3xl font-bold text-gray-400">฿</span>
              <span className="text-4xl font-extrabold w-full truncate">{thb}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
            💡 암산 꿀팁
          </h3>
          <p className="mt-2 text-blue-700 dark:text-blue-400 leading-relaxed">
            바트(฿) 금액에 <strong className="bg-blue-200 dark:bg-blue-800 px-1 rounded">곱하기 40</strong>을 하면 얼추 한국 돈이 됩니다!<br/><br/>
            예) 100바트 식사 ➡️ 약 4,000원
          </p>
        </div>
      </div>
    </AppScreen>
  );
};
