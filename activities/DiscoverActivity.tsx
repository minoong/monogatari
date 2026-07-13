import React, { useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { Button } from "../components/ui/button";

const FOOD_ITEMS = [
  { id: 1, title: "세븐일레븐 필수 간식", desc: "토스트 샌드위치, 벤또 쥐포, 마일로 초코우유", emoji: "🥪" },
  { id: 2, title: "길거리 과일 추천", desc: "망고, 망고스틴, 파파야! 시장에서 꼭 사먹기", emoji: "🥭" },
  { id: 3, title: "로컬 맛집: 팁싸마이", desc: "방콕 최고의 팟타이 맛집, 오렌지 주스 꼭 시킬 것!", emoji: "🍜" },
];

const SHOPPING_ITEMS = [
  { id: 4, title: "짜뚜짝 시장 리스트", desc: "코끼리 바지, 야돔(코 뻥 뚫리는 약), 우드 식기", emoji: "🐘" },
  { id: 5, title: "고메마켓 필수템", desc: "쿤나 건망고, 옥수수 젤리, 김과자(타오캐노이)", emoji: "🛒" },
  { id: 6, title: "약국 쇼핑", desc: "타이레놀(매우 저렴), 모기 기피제, 소화제", emoji: "💊" },
];

export const DiscoverActivity: React.FC<any> = () => {
  const [tab, setTab] = useState<"food" | "shopping">("food");

  const items = tab === "food" ? FOOD_ITEMS : SHOPPING_ITEMS;

  return (
    <AppScreen appBar={{ title: "태국 탐색 (맛집 & 쇼핑)" }}>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        
        {/* Top Tabs */}
        <div className="flex p-4 gap-2 bg-white dark:bg-black border-b sticky top-0 z-10">
          <button 
            onClick={() => setTab("food")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === "food" ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300" : "bg-gray-100 text-gray-500"}`}
          >
            맛집 / 간식 🍜
          </button>
          <button 
            onClick={() => setTab("shopping")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === "shopping" ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" : "bg-gray-100 text-gray-500"}`}
          >
            쇼핑 리스트 🛍️
          </button>
        </div>

        {/* Content List */}
        <div className="flex flex-col gap-4 p-4 overflow-y-auto pb-20">
          {items.map(item => (
            <Drawer key={item.id}>
              <DrawerTrigger render={<button className="w-full text-left" />}>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 items-center active:scale-[0.98] transition-transform">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.desc}</p>
                  </div>
                </div>
              </DrawerTrigger>
              <DrawerPopup showBar>
                <DrawerHeader className="text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4">
                    {item.emoji}
                  </div>
                  <DrawerTitle>{item.title}</DrawerTitle>
                  <DrawerDescription>상세 정보</DrawerDescription>
                </DrawerHeader>
                <DrawerPanel className="px-6 py-4">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
                    {item.desc}
                  </p>
                  <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                    💡 이곳에 사진이나 더 긴 상세 설명, 가격 정보 등을 추가할 수 있습니다.
                  </div>
                </DrawerPanel>
                <DrawerFooter className="justify-center mt-6">
                  <DrawerClose render={<Button className="w-full" size="lg" />}>
                    닫기
                  </DrawerClose>
                </DrawerFooter>
              </DrawerPopup>
            </Drawer>
          ))}
        </div>
        
      </div>
    </AppScreen>
  );
};
