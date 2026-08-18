"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintAirplane, paintCloud } from "@/components/cinematic/sprites/pixel-art";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, seg, smooth } from "@/components/cinematic/scene-utils";

export function FlightScene({ heading }: { heading: "out" | "home" }) {
  const clock = useCutClock();
  const plane = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);
  const trail = useRef<THREE.Group>(null);
  const shout = useRef<THREE.Group>(null);
  const sign = heading === "out" ? 1 : -1;

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    const travel = smooth(seg(p, 0.05, 0.95));
    if (plane.current) {
      plane.current.position.x = sign * (-5.4 + travel * 10.8);
      plane.current.position.y = -1.6 + travel * 2.6 + Math.sin(t * 2.4) * 0.16;
      plane.current.rotation.z = sign * (0.16 - travel * 0.1) + Math.sin(t * 1.9) * 0.02;
      plane.current.scale.x = sign * 1;
    }

    if (clouds.current) {
      clouds.current.children.forEach((cloud, i) => {
        const speed = 1.6 + i * 0.75;
        cloud.position.x = sign * -1 * ((((t * speed + i * 3.7) % 16) - 8) * 1);
        cloud.position.y = [2.9, -0.4, 4.4, 1.1, -2.4][i % 5];
      });
    }

    if (trail.current) {
      trail.current.children.forEach((dot, i) => {
        const mesh = dot as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        mesh.material.opacity = Math.max(0, 0.45 - i * 0.05);
        dot.position.x = -sign * (0.9 + i * 0.55);
        dot.position.y = -0.12 + Math.sin(t * 4 + i) * 0.06;
        dot.scale.setScalar(0.9 - i * 0.07);
      });
    }

    if (shout.current) {
      const show = seg(p, 0.12, 0.34);
      shout.current.visible = show > 0.02 && p < 0.6;
      shout.current.scale.setScalar(0.7 + show * 0.4);
      shout.current.position.y = 3.6 + Math.sin(t * 4) * 0.1;
    }
  });

  const sky = heading === "out"
    ? { from: "#0f2a6b", to: "#ffb26b" }
    : { from: "#12163a", to: "#ff7aa8" };

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <SkyBackdrop from={sky.from} size={40} to={sky.to} z={-6} />
      <Halftone color="#ffffff" opacity={0.09} size={42} z={-5.6} />
      <SpeedLines color="#ffffff" count={70} inner={0.16} opacity={0.16} size={34} spin={0.9} z={-5} />

      <group ref={clouds}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PixelArt
            key={i}
            cacheKey="cloud"
            height={24}
            opacity={0.55 + (i % 3) * 0.15}
            paint={paintCloud}
            position={[0, 0, -4 + i * 0.3]}
            size={0.9 + (i % 3) * 0.5}
            width={40}
          />
        ))}
      </group>

      <group position={[0, 0, 1]} ref={plane}>
        <PixelArt height={40} cacheKey="airplane" paint={paintAirplane} size={1.5} width={64} />
        <group ref={trail}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, 0, -0.1]}>
              <planeGeometry args={[0.42, 0.28]} />
              <meshBasicMaterial color="#ffffff" depthWrite={false} opacity={0.3} toneMapped={false} transparent />
            </mesh>
          ))}
        </group>
      </group>

      <PixelParticles
        area={[9, 12]}
        color="#ffffff"
        count={20}
        shape="dot"
        size={0.14}
        speed={1.5}
        z={1.4}
      />

      <group position={[0, 3.6, 1.6]} ref={shout} visible={false}>
        <PixelShout
          color={heading === "out" ? "#ffe45e" : "#8affc1"}
          height={0.95}
          text={heading === "out" ? "이륙!" : "집으로!"}
          wobble={0.03}
        />
      </group>
    </StageFit>
  );
}
