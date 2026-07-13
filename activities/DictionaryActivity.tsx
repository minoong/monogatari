import React, { useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

const PHRASES = [
  { ko: "안녕하세요", th: "사와디캅 (สวัสดีครับ/ค่ะ)", pron: "Sawatdee krap/kha" },
  { ko: "감사합니다", th: "코쿤캅 (ขอบคุณครับ/ค่ะ)", pron: "Khop khun krap/kha" },
  { ko: "얼마인가요?", th: "타오라이 캅? (เท่าไหร่ครับ/คะ)", pron: "Tao rai krap/kha?" },
  { ko: "너무 비싸요", th: "팽 빠이 (แพงไป)", pron: "Paeng pai" },
  { ko: "고수 빼주세요", th: "마이 싸이 팍치 (ไม่ใส่ผักชี)", pron: "Mai sai phak chi" },
];

export const DictionaryActivity: React.FC<any> = () => {
  const [selected, setSelected] = useState(PHRASES[0]);

  return (
    <AppScreen appBar={{ title: "회화 사전" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] bg-gray-50 dark:bg-gray-900 pb-16">
        
        {/* Top Half (Opposite person - Rotated) */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-blue-500 text-white rotate-180 relative transition-all">
          <p className="text-sm opacity-80 mb-4">현지인에게 이 화면을 보여주세요</p>
          <h2 className="text-5xl font-bold text-center leading-tight">
            {selected.th.split('(')[1]?.replace(')','') || selected.th}
          </h2>
          <p className="text-xl mt-4 opacity-90">{selected.ko}</p>
        </div>

        {/* Divider */}
        <div className="h-2 bg-gray-200 dark:bg-gray-800 shrink-0 shadow-inner z-10" />

        {/* Bottom Half (My view) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-black p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {selected.th.split('(')[0]}
            </h3>
            <p className="text-gray-500 text-sm mt-1">발음: {selected.pron}</p>
          </div>

          <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3">자주 쓰는 표현</h4>
          <div className="flex flex-wrap gap-2">
            {PHRASES.map((p, i) => (
              <button 
                key={i}
                onClick={() => setSelected(p)}
                className={`px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
                  selected.ko === p.ko 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {p.ko}
              </button>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="dictionary" />
    </AppScreen>
  );
};
