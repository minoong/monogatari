"use client";

import { useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { PIXELATE_FRAGMENT, PIXELATE_VERTEX } from "@/components/cinematic/shaders/pixelate";
import { getPixelTexture, rect } from "@/components/cinematic/canvas-texture";

const loader = new THREE.TextureLoader();
const loaded = new Map<string, THREE.Texture>();
const pending = new Set<string>();
const failures = new Set<string>();
const listeners = new Map<string, Set<() => void>>();

function notify(url: string) {
  listeners.get(url)?.forEach((listener) => listener());
}

function startLoad(url: string) {
  if (loaded.has(url) || pending.has(url) || failures.has(url)) return;
  pending.add(url);
  loader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      pending.delete(url);
      loaded.set(url, texture);
      notify(url);
    },
    undefined,
    () => {
      pending.delete(url);
      failures.add(url);
      notify(url);
    },
  );
}

export function disposeLoadedTextures() {
  loaded.forEach((texture) => texture.dispose());
  loaded.clear();
  failures.clear();
}

/** 로드되기 전에는 null을 돌려주고, 완료되면 자동으로 다시 렌더한다. */
export function useOptionalTexture(url: string) {
  const subscribe = useMemo(
    () => (onStoreChange: () => void) => {
      let set = listeners.get(url);
      if (!set) {
        set = new Set();
        listeners.set(url, set);
      }
      set.add(onStoreChange);
      startLoad(url);
      return () => {
        set?.delete(onStoreChange);
      };
    },
    [url],
  );

  return useSyncExternalStore(
    subscribe,
    () => loaded.get(url) ?? null,
    () => null,
  );
}

interface PixelPlaneProps {
  texture: THREE.Texture;
  /** 세로 기준 도트 개수. 높을수록 정밀하다. */
  resolution?: number;
  height?: number;
  levels?: number;
  dither?: number;
  saturation?: number;
  /** 1보다 크면 밝게. 어두운 실내 사진을 살릴 때 쓴다. */
  gain?: number;
  opacity?: number;
  alphaTest?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  renderOrder?: number;
}

export function PixelPlane({
  texture,
  resolution = 150,
  height = 3.2,
  levels = 7,
  dither = 0.09,
  saturation = 1.18,
  gain = 1,
  opacity = 1,
  alphaTest = 0.12,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  renderOrder = 0,
}: PixelPlaneProps) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const aspect = image?.width && image?.height ? image.width / image.height : 1;
  const width = height * aspect;

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uCells: { value: new THREE.Vector2(Math.round(resolution * aspect), resolution) },
      uDither: { value: dither },
      uLevels: { value: levels },
      uSaturation: { value: saturation },
      uGain: { value: gain },
      uOpacity: { value: opacity },
      uAlphaTest: { value: alphaTest },
    }),
    [alphaTest, aspect, dither, gain, levels, opacity, resolution, saturation, texture],
  );

  return (
    <mesh position={position} renderOrder={renderOrder} rotation={rotation} scale={scale}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        depthWrite={false}
        fragmentShader={PIXELATE_FRAGMENT}
        side={THREE.DoubleSide}
        transparent
        uniforms={uniforms}
        vertexShader={PIXELATE_VERTEX}
      />
    </mesh>
  );
}

export function PixelBillboard({
  url,
  ...rest
}: { url: string } & Omit<PixelPlaneProps, "texture">) {
  const texture = useOptionalTexture(url);
  if (!texture) return null;
  return <PixelPlane texture={texture} {...rest} />;
}

/** 사진이 아직 없으면 만화 컷 자리만 잡아둔다. */
export function PhotoSlot({
  url,
  label,
  height = 3,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  resolution = 110,
}: {
  url: string;
  label: string;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  resolution?: number;
}) {
  const texture = useOptionalTexture(url);
  const placeholder = getPixelTexture(`photo-slot:${label}`, 96, 124, (ctx, w, h) => {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.setLineDash([]);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("사진 예정", w / 2, 58);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(label, w / 2, 76);
    rect(ctx, 0, h - 4, w, 4, "#1f2937");
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[height * 0.78 + 0.18, height + 0.18]} />
        <meshBasicMaterial color="#f8fafc" toneMapped={false} />
      </mesh>
      {texture ? (
        <PixelPlane height={height} resolution={resolution} texture={texture} />
      ) : (
        <PixelPlane height={height} levels={5} resolution={62} texture={placeholder} />
      )}
    </group>
  );
}
