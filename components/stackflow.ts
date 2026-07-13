"use client";

import "@stackflow/plugin-basic-ui/index.css";
import { defineConfig } from "@stackflow/config";
import { stackflow } from "@stackflow/react";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";

import { HomeActivity } from "../activities/HomeActivity";
import { ExchangeActivity } from "../activities/ExchangeActivity";
import { DictionaryActivity } from "../activities/DictionaryActivity";
import { ScheduleActivity } from "../activities/ScheduleActivity";
import { ChecklistActivity } from "../activities/ChecklistActivity";
import { DiscoverActivity } from "../activities/DiscoverActivity";

export const config = defineConfig({
  transitionDuration: 350,
  activities: [
    { name: "HomeActivity" },
    { name: "ExchangeActivity" },
    { name: "DictionaryActivity" },
    { name: "ScheduleActivity" },
    { name: "ChecklistActivity" },
    { name: "DiscoverActivity" },
  ],
  initialActivity: () => "HomeActivity",
});

export const { Stack } = stackflow({
  config,
  components: {
    HomeActivity,
    ExchangeActivity,
    DictionaryActivity,
    ScheduleActivity,
    ChecklistActivity,
    DiscoverActivity,
  },
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({
      theme: "cupertino",
    }),
  ],
});
