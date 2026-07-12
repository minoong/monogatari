"use client";

import "@stackflow/plugin-basic-ui/index.css";
import { defineConfig } from "@stackflow/config";
import { stackflow } from "@stackflow/react";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { HomeActivity } from "../activities/HomeActivity";
import { CategoryActivity } from "../activities/CategoryActivity";
import { DetailActivity } from "../activities/DetailActivity";
import { SearchActivity } from "../activities/SearchActivity";
import { ProfileActivity } from "../activities/ProfileActivity";

export const config = defineConfig({
  transitionDuration: 350,
  activities: [
    { name: "HomeActivity" },
    { name: "CategoryActivity" },
    { name: "DetailActivity" },
    { name: "SearchActivity" },
    { name: "ProfileActivity" },
  ],
  initialActivity: () => "HomeActivity",
});

export const { Stack } = stackflow({
  config,
  components: {
    HomeActivity,
    CategoryActivity,
    DetailActivity,
    SearchActivity,
    ProfileActivity,
  },
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({
      theme: "cupertino",
    }),
  ],
});
