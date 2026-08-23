"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot, PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import {
  fingerHeartPose,
  peaceSignPose,
  travelCouplePose,
  walkPose,
} from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTOS = {
  airport: "/cinematic/fukuoka/01-airport.jpg",
  mandarake: "/cinematic/fukuoka/02-mandarake.jpg",
  outdoor: "/cinematic/fukuoka/03-outdoor.jpg",
  outdoorBg: "/cinematic/fukuoka/03-outdoor-bg.jpg",
  iceCream: "/cinematic/fukuoka/05-ice-cream.jpg",
  yakiniku: "/cinematic/fukuoka/06-yakiniku.jpg",
  hotel: "/cinematic/fukuoka/07-hotel.jpg",
  coupleNight: "/cinematic/fukuoka/08-couple-night.jpg",
  purikuraMachine: "/cinematic/fukuoka/09-purikura-machine.jpg",
  squid: "/cinematic/fukuoka/10-squid.jpg",
  purikuraStrips: "/cinematic/fukuoka/11-purikura-strips.jpg",
  figureShelf: "/cinematic/fukuoka/12-figure-shelf.jpg",
  nakasuBg: "/cinematic/fukuoka/13-nakasu-bg.jpg",
} as const;

/** 상단에 쌓이는 여행 사진 (풀밭 셀카는 마지막 씬 전용) */
const MONTAGE_PHOTOS = [
  { url: PHOTOS.airport, label: "공항", x: -2.9, y: 3.75, tilt: 0.1, appear: 0.03 },
  { url: PHOTOS.purikuraMachine, label: "프리큐라", x: -1.45, y: 3.75, tilt: -0.08, appear: 0.07 },
  { url: PHOTOS.purikuraStrips, label: "Best Couple", x: 0, y: 3.75, tilt: 0.06, appear: 0.12 },
  { url: PHOTOS.mandarake, label: "만다라케", x: 1.45, y: 3.75, tilt: -0.1, appear: 0.17 },
  { url: PHOTOS.figureShelf, label: "오타쿠 바", x: 2.9, y: 3.75, tilt: 0.08, appear: 0.22 },
  { url: PHOTOS.iceCream, label: "간식", x: -2.9, y: 2.45, tilt: -0.07, appear: 0.27 },
  { url: PHOTOS.squid, label: "이자카야", x: -1.45, y: 2.45, tilt: 0.09, appear: 0.32 },
  { url: PHOTOS.yakiniku, label: "야키니쿠", x: 0, y: 2.45, tilt: -0.06, appear: 0.37 },
  { url: PHOTOS.hotel, label: "숙소", x: 1.45, y: 2.45, tilt: 0.07, appear: 0.42 },
  { url: PHOTOS.coupleNight, label: "나카스", x: 2.9, y: 2.45, tilt: -0.09, appear: 0.47 },
] as const;

const GRASS_START = 0.82;

export function FukuokaTripScene() {
  const clock = useCutClock();
  const nakasuBg = useRef<THREE.Group>(null);
  const grassBg = useRef<THREE.Group>(null);
  const airportBg = useRef<THREE.Group>(null);
  const airportDuo = useRef<THREE.Group>(null);
  const outdoorDuo = useRef<THREE.Group>(null);
  const montagePhotos = useRef<Array<THREE.Group | null>>([]);
  const montageLayer = useRef<THREE.Group>(null);
  const grassPhoto = useRef<THREE.Group>(null);
  const grassShout = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    const grassIn = smooth(seg(p, GRASS_START, GRASS_START + 0.06));
    const montageOut = 1 - smooth(seg(p, GRASS_START - 0.04, GRASS_START + 0.02));
    const inMontage = p < GRASS_START + 0.02;

    if (nakasuBg.current) nakasuBg.current.visible = grassIn < 0.98;
    if (grassBg.current) grassBg.current.visible = grassIn > 0.02;
    if (airportBg.current) airportBg.current.visible = inMontage && p < 0.2;

    if (airportDuo.current) {
      airportDuo.current.visible = true;
      airportDuo.current.scale.setScalar(montageOut);
    }
    if (outdoorDuo.current) {
      outdoorDuo.current.visible = true;
      outdoorDuo.current.scale.setScalar(grassIn);
    }

    if (montageLayer.current) {
      montageLayer.current.visible = montageOut > 0.02;
      montageLayer.current.scale.setScalar(0.92 + montageOut * 0.08);
    }

    montagePhotos.current.forEach((card, i) => {
      if (!card) return;
      const slot = MONTAGE_PHOTOS[i];
      const enter = smooth(seg(p, slot.appear, slot.appear + 0.08));
      card.visible = enter > 0.01 && montageOut > 0.05;
      const dir = i % 2 === 0 ? -1 : 1;
      card.position.x = slot.x + dir * 4.5 * (1 - enter);
      card.position.y = slot.y + Math.sin(t * 1.3 + i) * 0.05;
      card.rotation.z = slot.tilt * enter + Math.sin(t * 1.1 + i) * 0.015;
      card.scale.setScalar((0.75 + enter * 0.25) * montageOut);
    });

    const grassPhotoIn = smooth(seg(p, GRASS_START + 0.08, GRASS_START + 0.16));

    if (grassPhoto.current) {
      grassPhoto.current.visible = grassPhotoIn > 0.01;
      grassPhoto.current.position.y = 3.55 + (1 - grassPhotoIn) * 0.7;
      grassPhoto.current.rotation.z = Math.sin(t * 1.3) * 0.02;
      grassPhoto.current.scale.setScalar(0.88 + grassPhotoIn * 0.12);
    }

    if (grassShout.current) {
      grassShout.current.visible = grassPhotoIn > 0.35;
      grassShout.current.scale.setScalar(0.58 + easeOutBack(grassPhotoIn) * 0.42);
    }

    if (airportDuo.current && inMontage) {
      const enter = smooth(seg(p, 0.02, 0.1));
      airportDuo.current.position.x = (1 - enter) * -0.35;
    }
  });

  const airportMinuPose = (e: number) => {
    const p = clock.current.progress;
    if (p < 0.1) return walkPose(e, 0, true);
    return fingerHeartPose(e);
  };
  const airportGahyunPose = (e: number) => {
    const p = clock.current.progress;
    if (p < 0.1) return walkPose(e, 0.4, true);
    return peaceSignPose(e);
  };

  return (
    <>
      <StageCover height={5.2} width={7.6} z={-6}>
        <group ref={nakasuBg}>
          <PixelBillboard dither={0.05} gain={1.02} height={5.2} levels={8} resolution={130} url={PHOTOS.nakasuBg} />
        </group>
        <group ref={grassBg} visible={false}>
          <PixelBillboard dither={0.05} gain={1.05} height={5.2} levels={8} resolution={130} url={PHOTOS.outdoorBg} />
        </group>
      </StageCover>

      <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <group ref={airportBg} visible={false}>
          <SkyBackdrop from="#e8f4fc" to="#cbd5e1" size={40} z={-5.5} />
          <mesh position={[0, 1.5, -5]}>
            <planeGeometry args={[10, 1.2]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.8, -4.9]}>
            <planeGeometry args={[7, 0.5]} />
            <meshBasicMaterial color="#ff5fa2" toneMapped={false} />
          </mesh>
        </group>

        <Halftone color="#5fd0ff" opacity={0.06} size={42} z={-4} />

        <group ref={montageLayer}>
          {MONTAGE_PHOTOS.map((slot, i) => (
            <group
              key={slot.url}
              position={[slot.x, slot.y, 1.35]}
              ref={(node) => {
                montagePhotos.current[i] = node;
              }}
              visible={false}
            >
              <PhotoSlot height={1.28} label={slot.label} resolution={100} url={slot.url} />
            </group>
          ))}
        </group>

        <group ref={airportDuo}>
          <group position={[-0.85, -1.05, 1.1]}>
            <PixelCharacter fps={14} height={3} kind="minu-fukuoka" pose={airportMinuPose} />
          </group>
          <group position={[0.85, -1.08, 1.1]}>
            <PixelCharacter flip fps={14} height={2.95} kind="gahyun-fukuoka-airport" pose={airportGahyunPose} />
          </group>
        </group>

        <group ref={outdoorDuo} visible={false}>
          <group position={[-0.8, -1, 1.1]}>
            <PixelCharacter fps={14} height={2.95} kind="minu-fukuoka-outdoor" pose={(e) => travelCouplePose(e, 0)} />
          </group>
          <group position={[0.8, -1.03, 1.1]}>
            <PixelCharacter
              flip
              fps={14}
              height={2.9}
              kind="gahyun-fukuoka-outdoor"
              pose={(e) => travelCouplePose(e, 0.5)}
            />
          </group>
        </group>

        <group position={[0, 3.55, 1.4]} ref={grassPhoto} visible={false}>
          <PhotoSlot height={2.05} label="가현이와의 행복 여행" resolution={118} url={PHOTOS.outdoor} />
        </group>

        <group position={[0, 4.15, 1.6]} ref={grassShout} visible={false}>
          <PixelShout color="#4ade80" height={0.92} text="가현이와의 행복 여행" wobble={0.02} />
        </group>

        <PixelParticles area={[8, 12]} color="#ffe45e" count={16} shape="star" size={0.22} speed={0.8} z={1.5} />
      </StageFit>
    </>
  );
}
