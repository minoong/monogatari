"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { CinematicClockContext } from "@/components/cinematic/cinematic-clock";
import { clearPixelTextureCache } from "@/components/cinematic/canvas-texture";
import { disposeLoadedTextures } from "@/components/cinematic/pixel-billboard";
import { AdventureScene } from "@/components/cinematic/scenes/adventure-scene";
import { BirthdayPartyScene } from "@/components/cinematic/scenes/birthday-party-scene";
import { DatingStartScene } from "@/components/cinematic/scenes/dating-start-scene";
import { FirstDateScene } from "@/components/cinematic/scenes/first-date-scene";
import { FukuokaTripScene } from "@/components/cinematic/scenes/fukuoka-trip-scene";
import { GahyunBdayScene } from "@/components/cinematic/scenes/gahyun-bday-scene";
import { MinuBday2026Scene } from "@/components/cinematic/scenes/minu-bday-2026-scene";
import { FlightScene } from "@/components/cinematic/scenes/flight-scene";
import { GTowerScene } from "@/components/cinematic/scenes/g-tower-scene";
import { ProposalScene } from "@/components/cinematic/scenes/proposal-scene";
import { ToBeContinuedScene } from "@/components/cinematic/scenes/to-be-continued";
import { WotageiScene } from "@/components/cinematic/scenes/wotagei-scene";
import type { ActiveCut, CutId } from "@/components/cinematic/proposal-timeline";

function WebGlTeardown() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    return () => {
      clearPixelTextureCache();
      disposeLoadedTextures();
      gl.setRenderTarget(null);
      gl.dispose();
      gl.forceContextLoss();
    };
  }, [gl]);

  return null;
}

function ActiveScene({ cutId }: { cutId: CutId }) {
  switch (cutId) {
    case "g-tower":
      return <GTowerScene />;
    case "minu-bday-2025":
      return (
        <BirthdayPartyScene
          honoree="minu-bday"
          label="2025.05.27"
          photoUrl="/cinematic/birthday/minu-2025.jpg"
        />
      );
    case "dating-start":
      return <DatingStartScene />;
    case "first-date-2025":
      return <FirstDateScene />;
    case "wotagei":
      return <WotageiScene />;
    case "fukuoka-2025":
      return <FukuokaTripScene />;
    case "gahyun-bday":
      return <GahyunBdayScene />;
    case "adventure":
      return <AdventureScene />;
    case "minu-bday-2026":
      return <MinuBday2026Scene />;
    case "flight-out":
      return <FlightScene heading="out" />;
    case "proposal":
      return <ProposalScene />;
    case "flight-home":
      return <FlightScene heading="home" />;
    case "tbc":
      return <ToBeContinuedScene />;
    default:
      return null;
  }
}

export function ProposalCanvas({
  clockRef,
  cutId,
}: {
  clockRef: RefObject<ActiveCut>;
  cutId: CutId;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      flat
      frameloop="always"
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#05060c", 1);
      }}
      style={{ width: "100%", height: "100%", background: "#05060c", display: "block", touchAction: "none" }}
    >
      <CinematicClockContext.Provider value={clockRef}>
        <WebGlTeardown />
        <color args={["#05060c"]} attach="background" />
        <PerspectiveCamera fov={38} makeDefault position={[0, 0, 6.4]} />
        <ActiveScene cutId={cutId} />
      </CinematicClockContext.Provider>
    </Canvas>
  );
}
