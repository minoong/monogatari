"use client";

import "@stackflow/plugin-basic-ui/index.css";
import { defineConfig } from "@stackflow/config";
import { stackflow } from "@stackflow/react";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";

import { appBarTitlePlugin } from "./app-bar-title-plugin";
import { bottomNavPlugin } from "./bottom-nav-plugin";

import { HomeActivity } from "../activities/HomeActivity";
import { ExchangeActivity } from "../activities/ExchangeActivity";
import { DictionaryActivity } from "../activities/DictionaryActivity";
import { ScheduleActivity } from "../activities/ScheduleActivity";
import { ChecklistActivity } from "../activities/ChecklistActivity";
import { DiscoverActivity } from "../activities/DiscoverActivity";
import { AccommodationActivity } from "../activities/AccommodationActivity";
import { UtilsActivity } from "../activities/UtilsActivity";
import { WishListActivity } from "../activities/WishListActivity";
import { FlightActivity } from "../activities/FlightActivity";
import { ExpenseActivity } from "../activities/ExpenseActivity";

export const config = defineConfig({
  transitionDuration: 350,
  activities: [
    { name: "HomeActivity" },
    { name: "ExchangeActivity" },
    { name: "DictionaryActivity" },
    { name: "ScheduleActivity" },
    { name: "ChecklistActivity" },
    { name: "DiscoverActivity" },
    { name: "AccommodationActivity" },
    { name: "UtilsActivity" },
    { name: "WishListActivity" },
    { name: "FlightActivity" },
    { name: "ExpenseActivity" },
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
    AccommodationActivity,
    UtilsActivity,
    WishListActivity,
    FlightActivity,
    ExpenseActivity,
  },
  plugins: [
    basicRendererPlugin(),
    bottomNavPlugin(),
    appBarTitlePlugin(),
    basicUIPlugin({
      theme: "cupertino",
      backgroundColor: "#ffffff",
      appBar: {
        backgroundColor: "#ffffff",
        minSafeAreaInsetTop: "env(safe-area-inset-top, 0px)",
      },
    }),
  ],
});
