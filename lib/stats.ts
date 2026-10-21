export interface GuessDistribution {
  [attempt: string]: number;
}

export interface StoredStats {
  totalGames: number;
  victories: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: GuessDistribution;
  failCount: number;
  recordedGameIds: string[];
}

export interface RecordGameParams {
  gameId: string;
  won: boolean;
  guesses: number;
}

export const STATS_STORAGE_KEY = 'wortchamp-stats';

const createDefaultGuessDistribution = (): GuessDistribution => ({
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  '6': 0,
});

export const DEFAULT_STATS: StoredStats = {
  totalGames: 0,
  victories: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: createDefaultGuessDistribution(),
  failCount: 0,
  recordedGameIds: [],
};

const cloneStats = (stats: StoredStats): StoredStats => ({
  totalGames: stats.totalGames,
  victories: stats.victories,
  currentStreak: stats.currentStreak,
  maxStreak: stats.maxStreak,
  guessDistribution: { ...stats.guessDistribution },
  failCount: stats.failCount,
  recordedGameIds: [...stats.recordedGameIds],
});

export const loadStats = (): StoredStats => {
  if (typeof window === 'undefined') {
    return cloneStats(DEFAULT_STATS);
  }

  try {
    const raw = window.localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      return cloneStats(DEFAULT_STATS);
    }

    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    const base = cloneStats(DEFAULT_STATS);

    const guessDistribution = {
      ...base.guessDistribution,
      ...(parsed.guessDistribution ?? {}),
    } as GuessDistribution;

    const recordedGameIds = Array.isArray(parsed.recordedGameIds)
      ? parsed.recordedGameIds.filter((id): id is string => typeof id === 'string')
      : [];

    return {
      totalGames: typeof parsed.totalGames === 'number' ? parsed.totalGames : base.totalGames,
      victories: typeof parsed.victories === 'number' ? parsed.victories : base.victories,
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : base.currentStreak,
      maxStreak: typeof parsed.maxStreak === 'number' ? parsed.maxStreak : base.maxStreak,
      guessDistribution,
      failCount: typeof parsed.failCount === 'number' ? parsed.failCount : base.failCount,
      recordedGameIds,
    };
  } catch (error) {
    console.error('Failed to load stats from localStorage:', error);
    return cloneStats(DEFAULT_STATS);
  }
};

export const saveStats = (stats: StoredStats): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats to localStorage:', error);
  }
};

export const recordGameResult = ({ gameId, won, guesses }: RecordGameParams): StoredStats => {
  if (!gameId) {
    return cloneStats(DEFAULT_STATS);
  }

  const current = loadStats();

  if (current.recordedGameIds.includes(gameId)) {
    return current;
  }

  const updated = cloneStats(current);
  updated.recordedGameIds.push(gameId);

  const MAX_TRACKED_IDS = 200;
  if (updated.recordedGameIds.length > MAX_TRACKED_IDS) {
    updated.recordedGameIds = updated.recordedGameIds.slice(-MAX_TRACKED_IDS);
  }

  updated.totalGames += 1;

  if (won) {
    updated.victories += 1;
    updated.currentStreak += 1;
    if (updated.currentStreak > updated.maxStreak) {
      updated.maxStreak = updated.currentStreak;
    }

    const bucket = String(Math.min(Math.max(guesses, 1), 6));
    updated.guessDistribution[bucket] = (updated.guessDistribution[bucket] ?? 0) + 1;
  } else {
    updated.currentStreak = 0;
    updated.failCount += 1;
  }

  saveStats(updated);
  return updated;
};

export const resetStats = (): void => {
  saveStats(cloneStats(DEFAULT_STATS));
};
