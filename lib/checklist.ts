export type ChecklistUser = "gahyun" | "minu";

export interface PreparationItem {
  id: string;
  title: string;
  type: "master" | "personal";
  assignees: string[];
  completed_by: string[];
  importance: "high" | "normal" | "low";
}

export interface ChecklistPlayerStats {
  total: number;
  completed: number;
  remaining: number;
  progress: number;
}

export type ChecklistBattleResult = "gahyun" | "minu" | "tie" | "perfect" | "empty";

export interface ChecklistBattleStats {
  gahyun: ChecklistPlayerStats;
  minu: ChecklistPlayerStats;
  result: ChecklistBattleResult;
  lead: number;
  uniqueTotal: number;
  averageProgress: number;
}

export const getChecklistItemsForUser = (
  items: PreparationItem[],
  user: ChecklistUser,
) => items.filter((item) => (
  item.assignees.includes(user)
  || item.type === "master"
  || item.assignees.includes("all")
));

export const isChecklistItemCompletedFor = (
  item: PreparationItem,
  user: string,
) => item.completed_by.includes(user) || item.completed_by.includes("all");

const getPlayerStats = (
  items: PreparationItem[],
  user: ChecklistUser,
): ChecklistPlayerStats => {
  const assignedItems = getChecklistItemsForUser(items, user);
  const completed = assignedItems.filter((item) => isChecklistItemCompletedFor(item, user)).length;
  const total = assignedItems.length;

  return {
    total,
    completed,
    remaining: total - completed,
    progress: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

export const getChecklistBattleStats = (
  items: PreparationItem[],
): ChecklistBattleStats => {
  const gahyun = getPlayerStats(items, "gahyun");
  const minu = getPlayerStats(items, "minu");
  const averageProgress = Math.round((gahyun.progress + minu.progress) / 2);
  const lead = Math.abs(gahyun.progress - minu.progress);

  let result: ChecklistBattleResult;
  if (gahyun.total === 0 && minu.total === 0) {
    result = "empty";
  } else if (
    gahyun.total > 0
    && minu.total > 0
    && gahyun.progress === 100
    && minu.progress === 100
  ) {
    result = "perfect";
  } else if (gahyun.progress === minu.progress) {
    result = "tie";
  } else {
    result = gahyun.progress > minu.progress ? "gahyun" : "minu";
  }

  return {
    gahyun,
    minu,
    result,
    lead,
    uniqueTotal: items.length,
    averageProgress,
  };
};

export const fetchChecklist = async (): Promise<PreparationItem[]> => {
  const response = await fetch("/api/checklist");
  if (!response.ok) {
    throw new Error("준비물 정보를 불러오지 못했습니다.");
  }

  const json = await response.json() as { data?: PreparationItem[] };
  return json.data ?? [];
};
