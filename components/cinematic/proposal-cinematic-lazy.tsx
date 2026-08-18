"use client";

import dynamic from "next/dynamic";

export const ProposalCinematic = dynamic(
  () => import("@/components/cinematic/proposal-cinematic").then((module) => module.ProposalCinematic),
  { ssr: false },
);
