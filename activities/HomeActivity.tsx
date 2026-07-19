import React, { useState } from "react";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";
import { motion } from "framer-motion";
import NeumorphButton from "../components/ui/neumorph-button";

export const HomeActivity: React.FC = () => {
  const { push, replace } = useFlow();
  const [tripState, setTripState] = useState<"before" | "during" | "after">("before");

  return (
    <AppScreen appBar={{ title: "태국 여행 2026" }}>
      <div className="flex flex-col flex-1 pb-24 overflow-y-auto">
        {/* State Toggle for Mockup */}
        <div className="flex justify-center gap-2 p-4 bg-muted/30 border-b">
          <NeumorphButton intent={tripState === "before" ? "primary" : "secondary"} size="small" onClick={() => setTripState("before")}>여행 전</NeumorphButton>
          <NeumorphButton intent={tripState === "during" ? "primary" : "secondary"} size="small" onClick={() => setTripState("during")}>여행 중</NeumorphButton>
          <NeumorphButton intent={tripState === "after" ? "primary" : "secondary"} size="small" onClick={() => setTripState("after")}>여행 후</NeumorphButton>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {tripState === "before" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-2xl p-6 text-center">
                <h2 className="text-xl font-bold mb-1">방콕 출발까지</h2>
                <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">D-14</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => replace("ChecklistActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">📝</span>
                  <span className="font-semibold">준비물 리스트</span>
                </button>
                <button onClick={() => push("ExchangeActivity", {})} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">💱</span>
                  <span className="font-semibold">환율 계산기</span>
                </button>
              </div>

              <button onClick={() => push("DiscoverActivity", {})} className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-2xl border border-orange-200 dark:border-orange-800 text-left active:scale-95 transition-transform">
                <h3 className="font-bold text-lg">태국 맛집 & 쇼핑 추천 🇹🇭</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">세븐일레븐 필수 간식부터 야시장 맛집까지</p>
              </button>
            </motion.div>
          )}

          {tripState === "during" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold">방콕 (실시간)</h2>
                    <p className="text-3xl font-extrabold mt-1">32°C <span className="text-xl font-normal">맑음</span></p>
                  </div>
                  <span className="text-5xl">☀️</span>
                </div>
                <p className="text-sm mt-3 bg-white/20 p-2 rounded-lg">오후 3시경 소나기(스콜) 예보가 있어요! 우산을 챙기세요 ☔️</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => replace("ScheduleActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">📅</span>
                  <span className="font-semibold">오늘의 일정</span>
                </button>
                <button onClick={() => replace("DictionaryActivity", {}, { animate: false })} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="text-2xl">🗣️</span>
                  <span className="font-semibold">태국어 회화</span>
                </button>
              </div>
              
              <button onClick={() => push("ExchangeActivity", {})} className="p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl border border-green-200 dark:border-green-800 flex justify-between items-center active:scale-95 transition-transform">
                <div>
                  <h3 className="font-bold">빠른 환율 계산</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">100바트 ≈ 3,800원</p>
                </div>
                <span className="text-2xl">👉</span>
              </button>
            </motion.div>
          )}

          {tripState === "after" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-2xl p-6 text-center">
                <span className="text-4xl">✈️</span>
                <h2 className="text-xl font-bold mt-2">여행 끝! 일상으로</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">3박 4일의 방콕 여행 어떠셨나요?</p>
              </div>

              <button onClick={() => push("DiscoverActivity", {})} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm flex justify-between items-center active:scale-95 transition-transform">
                <div>
                  <h3 className="font-bold">내 쇼핑 리스트 복기</h3>
                  <p className="text-sm text-gray-500">다 못 산 아이템이 있는지 확인해보세요</p>
                </div>
                <span className="text-2xl">🛍️</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
