import { clearPixelTextureCache } from "@/components/cinematic/canvas-texture";

export type ClearAppCacheResult = {
  cacheKeys: number;
  serviceWorkers: number;
};

export async function clearAppCache(): Promise<ClearAppCacheResult> {
  if (typeof window === "undefined") {
    return { cacheKeys: 0, serviceWorkers: 0 };
  }

  let cacheKeys = 0;
  let serviceWorkers = 0;

  if ("caches" in window) {
    const keys = await caches.keys();
    cacheKeys = keys.length;
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    serviceWorkers = registrations.length;
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch {
    // storage가 막혀 있으면 무시한다.
  }

  clearPixelTextureCache();

  return { cacheKeys, serviceWorkers };
}
