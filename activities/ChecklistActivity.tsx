import React, { useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

const INITIAL_ITEMS = [
  { id: 1, category: "필수 서류", text: "여권 (만료일 6개월 이상)", checked: true },
  { id: 2, category: "필수 서류", text: "여행자 보험 가입증명서", checked: false },
  { id: 3, category: "필수 서류", text: "호텔 바우처 (영문)", checked: true },
  { id: 4, category: "전자제품", text: "태국 유심 (또는 eSIM)", checked: false },
  { id: 5, category: "전자제품", text: "보조배터리 (수하물X, 기내O)", checked: true },
  { id: 6, category: "전자제품", text: "멀티어댑터 (돼지코)", checked: false },
  { id: 7, category: "의류 및 기타", text: "여름옷 및 얇은 가디건", checked: false },
  { id: 8, category: "의류 및 기타", text: "모기 기피제 / 비상약", checked: false },
];

export const ChecklistActivity: React.FC<any> = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const toggleCheck = (id: number) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  // Group by category
  const categories = Array.from(new Set(items.map(i => i.category)));

  const totalChecked = items.filter(i => i.checked).length;
  const progress = Math.round((totalChecked / items.length) * 100);

  return (
    <AppScreen appBar={{ title: "여행 준비물 체크리스트" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] pb-16 bg-white dark:bg-black">
        
        <div className="p-6 pb-2 border-b">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold">준비 진행률</h2>
            <span className="text-blue-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {categories.map(cat => (
            <div key={cat} className="flex flex-col gap-3">
              <h3 className="font-bold text-gray-400 dark:text-gray-500 text-sm">{cat}</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {items.filter(i => i.category === cat).map((item, idx, arr) => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-3 p-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors ${idx !== arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-lg transition-all ${item.checked ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
      </div>
      <BottomNav active="checklist" />
    </AppScreen>
  );
};
