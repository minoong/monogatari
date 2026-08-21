import { resolveActivityAppBarTitle } from "@/lib/activity-app-bar-titles";

type QueueSnapshot = {
  queue: readonly string[];
  version: number;
};

const listeners = new Set<() => void>();

let queue: string[] = [];
let version = 0;
let cachedSnapshot: QueueSnapshot = { queue, version: 0 };

function emit() {
  version += 1;
  cachedSnapshot = { queue, version };
  listeners.forEach((listener) => listener());
}

export function enqueueAppBarTitle(title: string) {
  if (!title) return;
  if (queue[queue.length - 1] === title) return;

  queue = [...queue, title];
  emit();
}

export function enqueueActivityAppBarTitle(
  activityName: string,
  params: Record<string, unknown> = {},
) {
  enqueueAppBarTitle(resolveActivityAppBarTitle(activityName, params));
}

export function shiftAppBarTitleQueue() {
  if (queue.length === 0) return;

  queue = queue.slice(1);
  emit();
}

export function peekAppBarTitleQueue() {
  return queue[0];
}

export function collapseAppBarTitleQueueToLatest() {
  if (queue.length === 0) return undefined;

  const latest = queue[queue.length - 1];
  if (queue.length === 1) return latest;

  queue = [latest];
  emit();
  return latest;
}

export function clearAppBarTitleQueue() {
  if (queue.length === 0) return;

  queue = [];
  emit();
}

export function getAppBarTitleQueueSnapshot(): QueueSnapshot {
  if (cachedSnapshot.version === version) {
    return cachedSnapshot;
  }

  cachedSnapshot = { queue, version };
  return cachedSnapshot;
}

export function subscribeAppBarTitleQueue(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}
