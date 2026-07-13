import React, { useState } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

const SCHEDULE_DATA = [
  {
    day: 1,
    date: "10월 24일 (목)",
    items: [
      { time: "18:00", title: "인천공항 출발", desc: "대한항공 KE651편" },
      { time: "22:00", title: "수완나품 공항 도착", desc: "입국심사 및 짐찾기" },
      { time: "23:30", title: "호텔 체크인", desc: "아속역 근처 호텔" },
    ]
  },
  {
    day: 2,
    date: "10월 25일 (금)",
    items: [
      { time: "10:00", title: "왕궁 투어", desc: "반바지, 슬리퍼 입장 불가" },
      { time: "13:00", title: "팁싸마이 점심", desc: "팟타이 & 오렌지주스 필수" },
      { time: "16:00", title: "마사지 타임", desc: "헬스랜드 예약 완료" },
      { time: "19:00", title: "쑈드 야시장", desc: "랭쎕(돼지등뼈찜) 먹어보기" },
    ]
  },
  {
    day: 3,
    date: "10월 26일 (토)",
    items: [
      { time: "09:00", title: "짜뚜짝 주말시장", desc: "코끼리 바지 쇼핑, 과일 스무디" },
      { time: "14:00", title: "아이콘시암", desc: "쑥시암 구경 & 응커피" },
      { time: "18:00", title: "루프탑 바", desc: "티츄카 예약 확인" },
    ]
  }
];

export const ScheduleActivity: React.FC<any> = () => {
  const [activeDay, setActiveDay] = useState(2); // Default to Day 2 for demo

  return (
    <AppScreen appBar={{ title: "3일간의 일정표" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] pb-16 bg-gray-50 dark:bg-gray-900">
        
        {/* Tabs */}
        <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
          {SCHEDULE_DATA.map((d) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-colors ${
                activeDay === d.day
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-500 border"
              }`}
            >
              Day {d.day}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <h2 className="text-xl font-extrabold mb-6 text-gray-800 dark:text-gray-100">
            {SCHEDULE_DATA.find(d => d.day === activeDay)?.date}
          </h2>

          <div className="flex flex-col gap-0">
            {SCHEDULE_DATA.find(d => d.day === activeDay)?.items.map((item, idx, arr) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Line & Dot */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 z-10 shadow-[0_0_0_4px_var(--color-white)] dark:shadow-[0_0_0_4px_var(--color-gray-900)]" />
                  {idx !== arr.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 dark:bg-blue-900/50 absolute top-4 bottom-0 left-1.5 -z-0" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8 flex-1">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{item.time}</span>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border mt-1">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <BottomNav active="schedule" />
    </AppScreen>
  );
};
