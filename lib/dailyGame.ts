import { getBerlinDateString } from "@/lib/time";

// 每日游戏状态管理（按变体存储）

export interface DailyGameStatus {
  date: string; // YYYY-MM-DD
  completed: boolean;
  won?: boolean;
  guesses?: number;
  solution?: string;
}

const STORAGE_KEY = "wortchamp-daily-status";
const DEFAULT_VARIANT_KEY = "5-plain";

type DailyGameStatusMap = Record<string, DailyGameStatus>;

const getTodayString = (): string => getBerlinDateString();

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readStorage = (): DailyGameStatusMap => {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    const today = getTodayString();

    if (
      isObject(parsed) &&
      typeof parsed.date === "string" &&
      typeof parsed.completed === "boolean"
    ) {
      const legacyStatus: DailyGameStatus = {
        date: parsed.date,
        completed: parsed.completed,
        won: typeof parsed.won === "boolean" ? parsed.won : undefined,
        guesses: typeof parsed.guesses === "number" ? parsed.guesses : undefined,
        solution: typeof parsed.solution === "string" ? parsed.solution : undefined,
      };

      if (legacyStatus.date === today) {
        return { [DEFAULT_VARIANT_KEY]: legacyStatus };
      }
      return {};
    }

    if (!isObject(parsed)) {
      return {};
    }

    const entries = Object.entries(parsed);
    const result: DailyGameStatusMap = {};

    for (const [variant, value] of entries) {
      if (!isObject(value)) {
        continue;
      }
      const statusCandidate = value as Partial<DailyGameStatus>;
      if (typeof statusCandidate.date !== "string") {
        continue;
      }
      if (statusCandidate.date !== today) {
        continue;
      }
      result[variant] = {
        date: statusCandidate.date,
        completed: Boolean(statusCandidate.completed),
        won: typeof statusCandidate.won === "boolean" ? statusCandidate.won : undefined,
        guesses: typeof statusCandidate.guesses === "number" ? statusCandidate.guesses : undefined,
        solution: typeof statusCandidate.solution === "string" ? statusCandidate.solution : undefined,
      };
    }

    return result;
  } catch (error) {
    console.error("Error reading daily game status:", error);
    return {};
  }
};

const writeStorage = (map: DailyGameStatusMap): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const today = getTodayString();
    const sanitizedEntries = Object.entries(map).filter(([, status]) => status.date === today);
    if (sanitizedEntries.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = Object.fromEntries(sanitizedEntries);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Error saving daily game status:", error);
  }
};

const buildStatus = (status: Omit<DailyGameStatus, "date">): DailyGameStatus => ({
  ...status,
  date: getTodayString(),
});

export const getDailyGameStatus = (variant: string): DailyGameStatus | null => {
  const map = readStorage();
  return map[variant] ?? null;
};

export const isDailyGameCompleted = (variant: string): boolean => {
  const status = getDailyGameStatus(variant);
  return status?.completed ?? false;
};

export const completeDailyGame = (
  variant: string,
  won: boolean,
  guesses: number,
  solution: string,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const map = readStorage();
  map[variant] = buildStatus({
    completed: true,
    won,
    guesses,
    solution,
  });
  writeStorage(map);
};
