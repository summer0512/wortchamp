'use client';
import { BarChart3, HelpCircle, Info, PlusCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Alert } from "@/components/alerts/Alert";
import { Grid } from "@/components/grid/Grid";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { InfoModal } from "@/components/modals/InfoModal";
import { WinModal } from "@/components/modals/WinModal";
import { LoseModal } from "@/components/modals/LoseModal";
import { CreateGameModal } from "@/components/modals/CreateGameModal";
import { ModeInfoModal } from "@/components/modals/ModeInfoModal";
import { StatsModal } from "@/components/modals/StatsModal";
import { Confetti } from "@/components/confetti";
import {
  isWordInWordList,
  getAvailableWordLengths,
  isSupportedWordLength,
  isWinningWord,
  stripAccents,
  filterWordListByRegion,
  DEFAULT_WORD_LENGTH,
  DEFAULT_ACCENT_MODE,
  type WordLength,
  type AccentMode,
  type RegionMode,
  registerWordList,
  type WordSettings,
  type WordListData,
} from "@/lib/words";
import { getChallengeWordFromUrl, clearChallengeFromUrl } from "@/lib/share";
import { getGamePath, getFinderPath } from "@/lib/length-pages";
import { completeDailyGame, isDailyGameCompleted } from "@/lib/dailyGame";
import { DEFAULT_STATS, loadStats, recordGameResult, StoredStats } from "@/lib/stats";
import {
  DEFAULT_REGION_MODE,
  REGION_COOKIE_KEY,
  REGION_STORAGE_KEY,
  detectRegionFromClient,
  normalizeRegionMode,
} from "@/lib/region";
import { useAdsterraPopunder } from "@/hooks/use-adsterra-popunder";
import { getBerlinDateString } from "@/lib/time";

type GameMode = "daily" | "infinite" | "challenge";

const DAILY_STORAGE_KEY = "wortchamp-daily-progress";
const CHALLENGE_STORAGE_PREFIX = "wortchamp-challenge-progress:";

interface StoredGameState {
  solution: string;
  guesses: string[];
  currentGuess: string;
  isGameWon: boolean;
  isGameLost: boolean;
  playedOn?: string;
  challengeId?: string;
  wordLength?: WordLength;
  accentMode?: AccentMode;
  regionMode?: RegionMode;
}

const getTodayString = (): string => getBerlinDateString();
const toStorageIdentifier = (value: string): string => value.trim().toLowerCase();
const buildVariantSuffix = (settings: WordSettings): string =>
  `${settings.wordLength}-${settings.accentMode}-${settings.regionMode}`;

const getStorageKeys = (mode: GameMode, settings: WordSettings, identifier?: string | null): string[] => {
  const suffix = buildVariantSuffix(settings);

  if (mode === "daily") {
    const keys = [`${DAILY_STORAGE_KEY}-${suffix}`];
    if (
      settings.wordLength === DEFAULT_WORD_LENGTH &&
      settings.accentMode === DEFAULT_ACCENT_MODE &&
      settings.regionMode === DEFAULT_REGION_MODE
    ) {
      keys.push(DAILY_STORAGE_KEY);
    }
    return keys;
  }

  if (mode === "challenge" && identifier) {
    const primary = `${CHALLENGE_STORAGE_PREFIX}${suffix}:${identifier}`;
    const keys = [primary];
    if (
      settings.wordLength === DEFAULT_WORD_LENGTH &&
      settings.accentMode === DEFAULT_ACCENT_MODE &&
      settings.regionMode === DEFAULT_REGION_MODE
    ) {
      keys.push(`${CHALLENGE_STORAGE_PREFIX}${identifier}`);
    }
    return keys;
  }

  return [];
};

const getPrimaryStorageKey = (mode: GameMode, settings: WordSettings, identifier?: string | null): string | null => {
  const [primary] = getStorageKeys(mode, settings, identifier);
  return primary ?? null;
};

const MODE_LABELS: Record<GameMode, string> = {
  daily: "Tagesmodus",
  infinite: "Endlos-Modus",
  challenge: "Challenge",
};

const createInfiniteGameId = (): string => {
  const randomSegment = Math.random().toString(36).slice(2, 8);
  return `infinite-${Date.now().toString(36)}-${randomSegment}`;
};

const MAX_GUESSES = 6;
const ACCENT_MODE_OPTIONS: readonly AccentMode[] = ["plain", "accented"];
const REGION_OPTIONS: readonly RegionMode[] = ["standard", "ch"];
const SETTINGS_STORAGE_KEY = "wortchamp-settings";
const toUpperGerman = (value: string) =>
  Array.from(value)
    .map((char) => (char === "ß" ? "ẞ" : char.toLocaleUpperCase("de-DE")))
    .join("");

type GameProps = {
  wordListData: WordListData;
  initialWordLength?: WordLength;
  initialAccentMode?: AccentMode;
  initialRegionMode?: RegionMode;
  initialDailySolution: string;
};

function Game({
  wordListData,
  initialWordLength,
  initialAccentMode,
  initialRegionMode,
  initialDailySolution,
}: GameProps) {
  const initialLength =
    initialWordLength !== undefined && isSupportedWordLength(initialWordLength)
      ? initialWordLength
      : DEFAULT_WORD_LENGTH;
  const initialAccent = initialAccentMode ?? DEFAULT_ACCENT_MODE;
  const initialRegion = initialRegionMode ?? DEFAULT_REGION_MODE;
  const initialConfigKey = `${initialLength}-${initialAccent}-${initialRegion}-${initialDailySolution}`;

  const registeredWordListRef = useRef<WordListData | null>(null);
  const registeredRegionRef = useRef<RegionMode>(initialRegion);

  const [mode, setMode] = useState<GameMode>("daily");
  const [challengeWord, setChallengeWord] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isModeInfoOpen, setIsModeInfoOpen] = useState(false);
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isLoseModalOpen, setIsLoseModalOpen] = useState(false);
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [revealingRowIndex, setRevealingRowIndex] = useState<number | undefined>();
  const [currentSolution, setCurrentSolution] = useState<string>(initialDailySolution);
  const [isMounted, setIsMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialModeResolved, setInitialModeResolved] = useState(false);
  const [stats, setStats] = useState<StoredStats>(() => ({
    ...DEFAULT_STATS,
    guessDistribution: { ...DEFAULT_STATS.guessDistribution },
    recordedGameIds: [...DEFAULT_STATS.recordedGameIds],
  }));
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [infiniteGameId, setInfiniteGameId] = useState<string>(() => createInfiniteGameId());
  const initialConfigRef = useRef(initialConfigKey);
  const { recordCompletedRound, triggerPendingPopunder, resetPendingPopunder } = useAdsterraPopunder();

  const wordLength = initialLength;
  const [accentMode, setAccentMode] = useState<AccentMode>(initialAccent);
  const [regionMode, setRegionMode] = useState<RegionMode>(initialRegion);
  const settings = useMemo<WordSettings>(
    () => ({ wordLength, accentMode, regionMode }),
    [wordLength, accentMode, regionMode],
  );
  const effectiveWordListData = useMemo(
    () => filterWordListByRegion(wordListData, regionMode),
    [wordListData, regionMode],
  );
  if (
    registeredWordListRef.current !== effectiveWordListData ||
    registeredRegionRef.current !== regionMode
  ) {
    registerWordList(wordLength, effectiveWordListData, regionMode);
    registeredWordListRef.current = effectiveWordListData;
    registeredRegionRef.current = regionMode;
  }
  const dailyVariantKey = useMemo(() => buildVariantSuffix(settings), [settings]);

  const locale = useLocale();
  const localePathPrefix = locale ? `/${locale}` : "";

  const wordLengthOptions = useMemo(() => getAvailableWordLengths(), []);
  const finderHref = useMemo(() => `${localePathPrefix}${getFinderPath(wordLength)}`, [localePathPrefix, wordLength]);



  useEffect(() => {
    if (typeof window === "undefined") {
      setIsMounted(true);
      return;
    }

    try {
      if (initialAccentMode === undefined) {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<WordSettings>;
          if (parsed.accentMode === "accented" || parsed.accentMode === "plain") {
            setAccentMode(parsed.accentMode);
          }
        }
      }

      const storedRegion = localStorage.getItem(REGION_STORAGE_KEY);
      if (storedRegion) {
        const normalized = normalizeRegionMode(storedRegion);
        setRegionMode(normalized);
        document.cookie = `${REGION_COOKIE_KEY}=${normalized}; path=/; max-age=31536000`;
      } else if (initialRegionMode) {
        setRegionMode(initialRegionMode);
      } else {
        setRegionMode(detectRegionFromClient());
      }
    } catch (error) {
      console.warn("Gespeicherte Einstellungen konnten nicht geladen werden:", error);
    } finally {
      setIsMounted(true);
    }
  }, [initialAccentMode, initialRegionMode]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ wordLength, accentMode })
      );
    } catch (error) {
      console.warn("Einstellungen konnten nicht gespeichert werden:", error);
    }
  }, [isMounted, wordLength, accentMode]);

  const skipWinEffectsRef = useRef(false);
  const skipLoseEffectsRef = useRef(false);

  const initializeGameState = useCallback(
    (
      state: {
        solution: string;
        guesses?: string[];
        currentGuess?: string;
        isGameWon?: boolean;
        isGameLost?: boolean;
      },
      options?: { skipCompletionEffects?: boolean },
    ) => {
      if (options?.skipCompletionEffects) {
        if (state.isGameWon) {
          skipWinEffectsRef.current = true;
        }
        if (state.isGameLost) {
          skipLoseEffectsRef.current = true;
        }
      }

    resetPendingPopunder();
    setCurrentSolution(state.solution);
    setGuesses(state.guesses ?? []);
    setCurrentGuess(state.currentGuess ?? "");
    setIsGameWon(state.isGameWon ?? false);
    setIsGameLost(state.isGameLost ?? false);
    setIsWinModalOpen(false);
      setIsLoseModalOpen(false);
      setShowConfetti(false);
      setRevealingRowIndex(undefined);
    },
    [resetPendingPopunder],
  );

  const restoreState = useCallback((targetMode: GameMode, solution: string, activeSettings: WordSettings) => {
    if (typeof window === "undefined") {
      initializeGameState({ solution });
      return;
    }

    const identifier = targetMode === "challenge" ? toStorageIdentifier(solution) : null;
    const keys = getStorageKeys(targetMode, activeSettings, identifier);

    if (keys.length === 0) {
      initializeGameState({ solution });
      return;
    }

    const [primaryKey] = keys;

    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const stored = JSON.parse(raw) as Partial<StoredGameState>;

        if (!stored.solution || stored.solution !== solution) {
          localStorage.removeItem(key);
          continue;
        }

        if (targetMode === "daily") {
          const today = getTodayString();
          if (stored.playedOn && stored.playedOn !== today) {
            localStorage.removeItem(key);
            continue;
          }
        }

        if (targetMode === "challenge" && identifier) {
          if (stored.challengeId && stored.challengeId !== identifier) {
            localStorage.removeItem(key);
            continue;
          }
        }

        initializeGameState(
          {
            solution,
            guesses: stored.guesses ?? [],
            currentGuess: stored.currentGuess ?? "",
            isGameWon: stored.isGameWon ?? false,
            isGameLost: stored.isGameLost ?? false,
          },
          { skipCompletionEffects: Boolean(stored.isGameWon || stored.isGameLost) }
        );

        if (key !== primaryKey) {
          try {
            localStorage.removeItem(key);
          } catch (cleanupError) {
            console.warn("Alter Zustand konnte nicht bereinigt werden", cleanupError);
          }
        }

        return;
      } catch (error) {
        console.error("Failed to restore game state:", error);
        localStorage.removeItem(key);
      }
    }

    initializeGameState({ solution });
  }, [initializeGameState]);

  useEffect(() => {
    if (initialConfigRef.current === initialConfigKey) {
      return;
    }

    initialConfigRef.current = initialConfigKey;

    // Route/config changed without a full remount: re-sync state from new page props.
    setAccentMode(initialAccent);
    setRegionMode(initialRegion);
    setMode("daily");
    setChallengeWord(null);
    setInitialModeResolved(false);
    setInfiniteGameId(createInfiniteGameId());
    initializeGameState({ solution: initialDailySolution });
  }, [
    initialConfigKey,
    initialAccent,
    initialRegion,
    initialDailySolution,
    initializeGameState,
  ]);

  const fetchSolution = useCallback(
    async (
      length: WordLength,
      mode: "daily" | "infinite",
      region: RegionMode,
      accent: AccentMode,
    ): Promise<string> => {
      const params = new URLSearchParams({ mode, region, accent });
      const response = await fetch(`/api/game-solution/${length}?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch ${mode} solution (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as { solution?: unknown };
      if (typeof payload.solution !== "string" || payload.solution.length === 0) {
        throw new Error(`Invalid ${mode} solution payload.`);
      }

      return payload.solution;
    },
    []
  );

  const startInfiniteGame = useCallback(
    async (overrideSettings?: WordSettings) => {
      const activeSettings = overrideSettings ?? settings;
      try {
        const newSolution = await fetchSolution(
          activeSettings.wordLength,
          "infinite",
          activeSettings.regionMode,
          activeSettings.accentMode,
        );
        setInfiniteGameId(createInfiniteGameId());
        initializeGameState({ solution: newSolution });
      } catch (error) {
        console.error("Failed to fetch infinite game solution:", error);
      }
    },
    [fetchSolution, initializeGameState, settings]
  );

  const getGameIdentifier = (targetMode: GameMode = mode, solution: string = currentSolution): string | null => {
    if (!solution) {
      return null;
    }

    if (targetMode === "daily") {
      return `daily-${getTodayString()}-${buildVariantSuffix(settings)}`;
    }

    if (targetMode === "challenge") {
      return `challenge-${toStorageIdentifier(solution)}-${buildVariantSuffix(settings)}`;
    }

    if (targetMode === "infinite") {
      return infiniteGameId;
    }

    return null;
  };

  const recordStatsResult = (won: boolean, guessesUsed: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const gameId = getGameIdentifier();
    if (!gameId) {
      return;
    }

    const updatedStats = recordGameResult({ gameId, won, guesses: guessesUsed });
    setStats(updatedStats);
  };

  const openStatsModal = () => {
    if (typeof window !== "undefined") {
      setStats(loadStats());
    }
    setIsStatsModalOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setStats(loadStats());
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // console.log(`[WORTCHAMP] Tageswort: ${getWordOfDay(wordLength)}`);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || initialModeResolved) {
      return;
    }

    const challengePayload = getChallengeWordFromUrl();

    if (challengePayload) {
      const { word, wordLength: payloadLength, accentMode: payloadAccent, regionMode: payloadRegion } = challengePayload;
      const resolvedLength = isSupportedWordLength(payloadLength) ? payloadLength : DEFAULT_WORD_LENGTH;
      const resolvedAccent = payloadAccent ?? DEFAULT_ACCENT_MODE;
      const resolvedRegion = payloadRegion ?? regionMode;

      if (resolvedLength !== wordLength || resolvedAccent !== accentMode) {
        if (typeof window !== "undefined") {
          const search = window.location.search;
          const targetPath = `${localePathPrefix}${getGamePath(resolvedLength, resolvedAccent)}`;
          window.location.assign(`${targetPath}${search}`);
        }
        return;
      }

      const challengeSettings: WordSettings = {
        wordLength,
        accentMode: resolvedAccent,
        regionMode: resolvedRegion,
      };

      setAccentMode(resolvedAccent);
      setRegionMode(resolvedRegion);
      setChallengeWord(word);
      setMode("challenge");
      restoreState("challenge", word, challengeSettings);
    } else {
      const dailyCompleted = isDailyGameCompleted(dailyVariantKey);

      if (dailyCompleted) {
        setMode("infinite");
      } else {
        setMode("daily");
      }
    }

    setInitialModeResolved(true);
  }, [
    isMounted,
    initialModeResolved,
    accentMode,
    regionMode,
    localePathPrefix,
    wordLength,
    restoreState,
    dailyVariantKey,
  ]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    let cancelled = false;

    const resolveSolutionForMode = async () => {
      if (mode === "daily") {
        try {
          const solution = await fetchSolution(
            wordLength,
            "daily",
            settings.regionMode,
            settings.accentMode,
          );
          if (!cancelled) {
            restoreState("daily", solution, settings);
          }
        } catch (error) {
          console.error("Failed to fetch daily game solution:", error);
        }
      } else if (mode === "infinite") {
        await startInfiniteGame(settings);
      } else if (mode === "challenge" && challengeWord) {
        restoreState("challenge", challengeWord, settings);
      }
    };

    void resolveSolutionForMode();

    return () => {
      cancelled = true;
    };
  }, [
    mode,
    isMounted,
    initialModeResolved,
    challengeWord,
    settings,
    wordLength,
    fetchSolution,
    startInfiniteGame,
    restoreState,
  ]);

  useEffect(() => {
    if (skipWinEffectsRef.current) {
      skipWinEffectsRef.current = false;
      return;
    }

    if (!isGameWon) {
      return;
    }

    setShowConfetti(true);
    const timeoutId = window.setTimeout(() => {
      setIsWinModalOpen(true);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [isGameWon]);

  useEffect(() => {
    if (skipLoseEffectsRef.current) {
      skipLoseEffectsRef.current = false;
      return;
    }

    if (isGameLost) {
      setIsLoseModalOpen(true);
    }
  }, [isGameLost]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    if (mode === "infinite") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const solution = currentSolution;
    if (!solution) {
      return;
    }

    const identifier = mode === "challenge" ? toStorageIdentifier(solution) : null;
    const key = getPrimaryStorageKey(mode, settings, identifier);

    if (!key) {
      return;
    }

    const payload: StoredGameState = {
      solution,
      guesses,
      currentGuess,
      isGameWon,
      isGameLost,
      wordLength: settings.wordLength,
      accentMode: settings.accentMode,
      regionMode: settings.regionMode,
    };

    if (mode === "daily") {
      payload.playedOn = getTodayString();
    } else if (mode === "challenge") {
      payload.challengeId = identifier ?? undefined;
    }

    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to persist game state:", error);
    }
  }, [guesses, currentGuess, isGameWon, isGameLost, mode, currentSolution, settings, isMounted, initialModeResolved]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    if (!currentSolution) {
      return;
    }

    // const label = MODE_LABELS[mode];
    // console.log(`[WORTCHAMP] Aktuelles Wort (${label}): ${currentSolution}`);
  }, [mode, currentSolution, isMounted, initialModeResolved]);

  useEffect(() => {
    setCurrentGuess((prev) => prev.slice(0, wordLength));
  }, [wordLength]);

  const onChar = useCallback(
    (value: string) => {
      if (isGameWon || isGameLost) {
        return;
      }

      if (guesses.length >= MAX_GUESSES) {
        return;
      }

      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) {
          return prev;
        }

        const upper = toUpperGerman(value);
        const sanitized = accentMode === "plain" ? stripAccents(upper) : upper;
        const allowedPattern = regionMode === "ch" ? /^[A-ZÄÖÜ]$/u : /^[A-ZÄÖÜẞ]$/u;

        if (!allowedPattern.test(sanitized)) {
          return prev;
        }

        return `${prev}${sanitized}`;
      });
    },
    [accentMode, regionMode, guesses.length, isGameLost, isGameWon, wordLength]
  );

  const onDelete = useCallback(() => {
    if (isGameWon || isGameLost) {
      return;
    }

    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameLost, isGameWon]);

  const onEnter = useCallback(() => {
    if (isGameWon || isGameLost) {
      return;
    }

    if (currentGuess.length !== wordLength) {
      return;
    }

    if (!isWordInWordList(currentGuess, settings)) {
      setIsWordNotFoundAlertOpen(true);
      setTimeout(() => {
        setIsWordNotFoundAlertOpen(false);
      }, 2000);
      return;
    }

    if (guesses.length >= MAX_GUESSES) {
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    const currentRowIndex = guesses.length;

    setRevealingRowIndex(currentRowIndex);
    setGuesses(newGuesses);
    setCurrentGuess("");

    const winningWord = isWinningWord(currentGuess, currentSolution, settings);
    const roundKey = mode === "daily"
      ? `daily-${dailyVariantKey}-${getTodayString()}`
      : mode === "challenge"
        ? `challenge-${dailyVariantKey}-${toStorageIdentifier(currentSolution)}`
        : `infinite-${dailyVariantKey}-${infiniteGameId}`;

    setTimeout(() => {
      setRevealingRowIndex(undefined);

      if (winningWord) {
        if (mode === "daily") {
          completeDailyGame(dailyVariantKey, true, newGuesses.length, currentSolution);
        }
        recordStatsResult(true, newGuesses.length);
        recordCompletedRound(roundKey);
        setIsGameWon(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        if (mode === "daily") {
          completeDailyGame(dailyVariantKey, false, newGuesses.length, currentSolution);
        }
        recordStatsResult(false, newGuesses.length);
        recordCompletedRound(roundKey);
        setIsGameLost(true);
      }
    }, 600);
  }, [
    currentGuess,
    currentSolution,
    guesses,
    isGameLost,
    isGameWon,
    mode,
    settings,
    wordLength,
    dailyVariantKey,
    infiniteGameId,
    recordCompletedRound,
  ]);

  const handleNewGame = useCallback(() => {
    triggerPendingPopunder();
    if (mode === "challenge") {
      if (typeof window !== "undefined") {
        const key = getPrimaryStorageKey("challenge", settings, toStorageIdentifier(currentSolution));
        if (key) {
          localStorage.removeItem(key);
        }
        clearChallengeFromUrl();
      }
      setChallengeWord(null);
      setMode("infinite");
      return;
    }

    if (mode === "daily") {
      setMode("infinite");
      return;
    }

    void startInfiniteGame(settings);
  }, [currentSolution, mode, settings, startInfiniteGame, triggerPendingPopunder]);

  const handleModeSelection = (selected: "daily" | "infinite") => {
    if (mode === "challenge") {
      return;
    }
    if (selected === mode) {
      return;
    }
    setMode(selected);
  };

  const handleRegionSelection = (selected: RegionMode) => {
    if (mode === "challenge") {
      return;
    }
    if (selected === regionMode) {
      return;
    }
    setRegionMode(selected);
    if (typeof window !== "undefined") {
      localStorage.setItem(REGION_STORAGE_KEY, selected);
      document.cookie = `${REGION_COOKIE_KEY}=${selected}; path=/; max-age=31536000`;
    }
  };

  useEffect(() => {
    const basePattern = regionMode === "ch" ? /^[a-zäöü]$/iu : /^[a-zäöüßẞ]$/iu;
    const plainPattern = basePattern;
    const accentedPattern = basePattern;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInfoModalOpen || isCreateGameModalOpen) {
        return;
      }

      if (event.key === 'Enter') {
        if (isGameLost || isGameWon) {
          handleNewGame();
        } else {
          onEnter();
        }
        return;
      }

      if (event.key === 'Backspace') {
        if (!isGameWon && !isGameLost) {
          onDelete();
        }
        return;
      }

      const pattern = accentMode === 'accented' ? accentedPattern : plainPattern;

      if (pattern.test(event.key)) {
        if (!isGameWon && !isGameLost) {
          onChar(event.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onChar,
    onDelete,
    onEnter,
    handleNewGame,
    isGameWon,
    isGameLost,
    isCreateGameModalOpen,
    isInfoModalOpen,
    accentMode,
    regionMode,
  ]);

  const primaryActionLabel = mode === "infinite" ? "NEUES SPIEL" : "ZUM ENDLOS-MODUS";

  return (
    <>
      <Confetti trigger={showConfetti} duration={3000} />
      <Alert message="Wort nicht gefunden" isOpen={isWordNotFoundAlertOpen} />
      <div className="pb-8 pt-2 max-w-7xl mx-auto sm:px-6 lg:px-8 game-container">
        <div className="flex w-full max-w-xl mx-auto items-center justify-between mb-3 gap-4">
          <div className="flex items-center gap-2 flex-1 pl-2">
            <div className="flex">
              <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium text-gray-600">
                  {mode === "challenge" ? (
                    <label className="px-3 py-1 rounded-full cursor-pointer transition bg-white text-primary-green shadow">
                      <input
                        type="radio"
                        name="game-mode"
                        className="sr-only"
                        checked={true}
                        readOnly
                      />
                      Challenge
                    </label>
                  ) : (
                    <>
                      <label
                        className={`px-3 py-1 rounded-full cursor-pointer transition ${mode === "daily" ? "bg-white text-primary-green shadow" : "hover:text-gray-800"}`}
                      >
                        <input
                          type="radio"
                          name="game-mode"
                          className="sr-only"
                          checked={mode === "daily"}
                          onChange={() => handleModeSelection("daily")}
                        />
                        Täglich
                      </label>
                      <label
                        className={`px-3 py-1 rounded-full cursor-pointer transition ${mode === "infinite" ? "bg-white text-primary-green shadow" : "hover:text-gray-800"}`}
                      >
                        <input
                          type="radio"
                          name="game-mode"
                          className="sr-only"
                          checked={mode === "infinite"}
                          onChange={() => handleModeSelection("infinite")}
                        />
                        Endlos
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModeInfoOpen(true)}
              title="Infos zum aktuellen Modus"
              className="p-1 rounded bg-gray-100 transition-colors ml-auto"
            >
              <Info className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
          </div>
          <div className="flex items-center space-x-2 pr-2">

            {mode === "infinite" && (
              <button
                onClick={handleNewGame}
                title="Neues Spiel"
                className="hidden sm:inline-flex items-center p-1 px-3 rounded bg-primary-green transition-colors ml-1 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Neues Spiel
              </button>
            )}
            {mode === "infinite" && (
              <button
                onClick={handleNewGame}
                title="Neues Spiel"
                className="sm:hidden p-1 rounded bg-primary-green text-white transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={openStatsModal}
              title="Statistiken"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
            <button
              onClick={() => setIsCreateGameModalOpen(true)}
              title="Challenge erstellen"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <PlusCircle className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              title="So spielst du"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <HelpCircle className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
          </div>
        </div>
        <Grid guesses={guesses} currentGuess={currentGuess} revealingRowIndex={revealingRowIndex} solution={currentSolution} settings={settings} wordLength={wordLength} maxGuesses={MAX_GUESSES} isGameOver={isGameWon || isGameLost} />

        <div className="flex flex-col items-center gap-2 ml-3 justify-center mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">Länge</span>
            {wordLengthOptions.map((length) => {
              const isActive = length === wordLength;
              const href = `${localePathPrefix}${getGamePath(length, accentMode)}`;
              const isDisabled = mode === "challenge";

              return (
                <a
                  key={length}
                  href={href}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition ${isActive
                      ? "bg-white text-primary-green shadow"
                      : "text-gray-600 hover:text-gray-800"
                    } ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {length}
                </a>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-center">
            <div
              className={`inline-flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium text-gray-600 ${
                mode === "challenge" ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <span className="px-2 text-[10px] uppercase tracking-wide text-gray-500">Region</span>
              {REGION_OPTIONS.map((option) => {
                const isActive = option === regionMode;
                const label = option === "standard" ? "DE/AT" : "CH";

                return (
                  <label
                    key={option}
                    className={`px-3 py-1 rounded-full cursor-pointer transition ${
                      isActive ? "bg-white text-primary-green shadow" : "hover:text-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="region-mode"
                      className="sr-only"
                      checked={isActive}
                      onChange={() => handleRegionSelection(option)}
                    />
                    {label}
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Umlaute</span>
              {ACCENT_MODE_OPTIONS.map((option) => {
                const isActive = option === accentMode;
                const href = `${localePathPrefix}${getGamePath(wordLength, option)}`;
                const isDisabled = mode === "challenge";
                const label = option === "plain" ? "Ohne" : "Mit";

                return (
                  <a
                    key={option}
                    href={href}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition ${isActive
                        ? "bg-white text-primary-green shadow"
                        : "text-gray-600 hover:text-gray-800"
                      } ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={isDisabled || undefined}
                  >
                    {label}
                  </a>
                );
              })}
              <a
                href={finderHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-green text-white hover:bg-primary-green/90 transition"
                title="Wortsuche öffnen"
              >
                Wortsuche
              </a>
            </div>
          </div>
        </div>

        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={guesses}
          solution={currentSolution}
          settings={settings}
        />
        <WinModal
          isOpen={isWinModalOpen}
          handleClose={() => {
            setIsWinModalOpen(false);
            setShowConfetti(false);
          }}
          guesses={guesses}
          solution={currentSolution}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={handleNewGame}
          onShowStats={openStatsModal}
          settings={settings}
          maxGuesses={MAX_GUESSES}
        />
        <LoseModal
          isOpen={isLoseModalOpen}
          handleClose={() => setIsLoseModalOpen(false)}
          guesses={guesses}
          solution={currentSolution}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={handleNewGame}
          onShowStats={openStatsModal}
          settings={settings}
        />
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
          settings={settings}
        />
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={() => setIsStatsModalOpen(false)}
          stats={stats}
        />
        <ModeInfoModal
          isOpen={isModeInfoOpen}
          handleClose={() => setIsModeInfoOpen(false)}
          currentMode={mode}
        />
        <CreateGameModal
          isOpen={isCreateGameModalOpen}
          handleClose={() => setIsCreateGameModalOpen(false)}
          settings={settings}
        />
      </div>
    </>
  );
}

export default Game;
