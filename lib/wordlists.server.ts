import { getCloudflareContext } from "@opennextjs/cloudflare";
import type {
  WordLength,
  WordListData,
  WordListStats,
  AnswerWordListPayload,
} from "@/constants/wordlist-metadata";
import { WORD_LENGTHS } from "@/constants/wordlist-metadata";
import { WORD_LIST_SUMMARY } from "@/constants/wordlist-manifest";
import { getLocalWordList } from "@/lib/wordlists.local";
import {
  registerWordList,
  getUppercaseWordList,
  filterWordListByRegion,
  buildWordListStats,
  DEFAULT_ACCENT_MODE,
  type AccentMode,
} from "@/lib/words";
import type { WordListBundle } from "@/lib/wordlist-types";
import { DEFAULT_REGION_MODE, type RegionMode } from "@/lib/region";
import { getDaysSinceBerlinEpoch } from "@/lib/time";

const BINDING_NAME = process.env.WORDLIST_KV_BINDING?.trim() || "WORDLISTS";
const BUNDLE_KEY_PREFIX = process.env.WORDLIST_BUNDLE_KV_KEY_PREFIX?.trim() || "wordlists-bundle:";
const FINDER_KEY_PREFIX = process.env.WORDLIST_FINDER_KV_KEY_PREFIX?.trim() || "wordlists-finder:";
const ANSWER_KEY_PREFIX = process.env.WORDLIST_ANSWER_KV_KEY_PREFIX?.trim() || "wordlists-answer:";

export const FINDER_PREVIEW_LIMIT = Number.parseInt(process.env.FINDER_PREVIEW_LIMIT ?? "300", 10);

const bundleCache = new Map<WordLength, Promise<WordListBundle>>();
const finderPreviewCache = new Map<string, Promise<FinderPreviewData>>();
const answerListCache = new Map<string, Promise<readonly string[]>>();
const derivedWordListCache = new Map<string, Promise<WordListData>>();
const derivedStatsCache = new Map<string, Promise<WordListStats>>();

const BROWSER_ONLY_WORD_LENGTHS = new Set<WordLength>(
  WORD_LENGTHS.filter((length) => length >= 7),
);

const makeRegionKey = (wordLength: WordLength, regionMode: RegionMode) =>
  `${regionMode}:${wordLength}`;

const GERMAN_LOCALE = "de-DE";
const toUpperGerman = (value: string) =>
  Array.from(value)
    .map((char) => (char === "ß" ? "ẞ" : char.toLocaleUpperCase(GERMAN_LOCALE)))
    .join("");

type KvNamespace = {
  get: (key: string, options?: { type?: "text" | "json" | "arrayBuffer" | "stream" }) => Promise<unknown>;
};

type FinderPreviewStats = WordListStats;
type DailySolutionVariant = "plain" | "accented" | "ch";

export type FinderPreviewData = {
  preview: readonly string[];
  stats: FinderPreviewStats;
};

export type GamePageData = {
  wordListData: WordListData | null;
  stats: WordListStats;
  dailySolution: string;
  requiresBrowserBundle: boolean;
};

const DAILY_SOLUTION_VARIANTS: readonly DailySolutionVariant[] = ["plain", "accented", "ch"];
const DAILY_SOLUTION_OFFSETS: Record<DailySolutionVariant, number> = {
  plain: 0,
  accented: 1,
  ch: 2,
};

const shouldUseLocalWordlists = () => {
  if (process.env.USE_LOCAL_WORDLISTS === "1") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
};

export const isBrowserOnlyWordLength = (wordLength: WordLength): boolean =>
  BROWSER_ONLY_WORD_LENGTHS.has(wordLength);

const shouldDeferWordListToBrowser = (wordLength: WordLength): boolean =>
  isBrowserOnlyWordLength(wordLength);

const isWordLength = (value: number): value is WordLength => WORD_LENGTHS.includes(value as WordLength);

const ensureWordLength = (value: WordLength) => {
  if (!isWordLength(value)) {
    throw new Error(`Unsupported word length: ${value}`);
  }
};

async function getKvNamespace(): Promise<KvNamespace> {
  const context = await getCloudflareContext({ async: true });
  const env = context?.env as Record<string, unknown> | undefined;
  if (!env) {
    throw new Error("Cloudflare environment bindings are unavailable in the current context.");
  }

  const namespace = env[BINDING_NAME] as KvNamespace | undefined;
  if (!namespace || typeof namespace.get !== "function") {
    throw new Error(`KV binding '${BINDING_NAME}' is not available. Ensure it is defined in wrangler.jsonc.`);
  }

  return namespace;
}

const toBundleKey = (wordLength: WordLength) => `${BUNDLE_KEY_PREFIX}${wordLength}`;
const toAnswerKey = (wordLength: WordLength) => `${ANSWER_KEY_PREFIX}${wordLength}`;

const normalizeStats = (stats: Partial<WordListStats> | undefined, wordLength: WordLength): WordListStats => {
  if (!stats) {
    throw new Error(`KV-Bundle für ${wordLength} Buchstaben enthält keine Statistiken.`);
  }

  const answers = Number(stats.answers);
  const allowed = Number(stats.allowed);
  const unique = Number(stats.unique);

  if (!Number.isFinite(answers) || !Number.isFinite(allowed) || !Number.isFinite(unique)) {
    throw new Error(`KV-Bundle für ${wordLength} Buchstaben hat ungültige Statistiken.`);
  }

  return { answers, allowed, unique };
};

const normalizeAccentMap = (accentMap: unknown, wordLength: WordLength): Record<string, string> => {
  if (!accentMap || typeof accentMap !== "object") {
    throw new Error(`KV-Bundle für ${wordLength} Buchstaben hat eine ungültige AccentMap.`);
  }

  const entries = Object.entries(accentMap as Record<string, unknown>);
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};

const normalizeWordArray = (value: unknown, kind: string, wordLength: WordLength): string[] => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`KV-Bundle für ${wordLength} Buchstaben hat ein ungültiges '${kind}'-Array.`);
  }
  return value as string[];
};

const normalizeBundle = (raw: unknown, wordLength: WordLength): WordListBundle => {
  if (!raw || typeof raw !== "object") {
    throw new Error(`KV-Bundle für ${wordLength} Buchstaben ist ungültig.`);
  }

  const record = raw as Partial<WordListBundle>;
  const allowed = normalizeWordArray(record.allowed, "allowed", wordLength);
  const answers = normalizeWordArray(record.answers, "answers", wordLength);
  const accentMap = normalizeAccentMap(record.accentMap, wordLength);
  const stats = normalizeStats(record.stats, wordLength);

  const version = typeof record.version === "string" ? record.version : undefined;
  const checksum = typeof record.checksum === "string" ? record.checksum : undefined;
  const generatedAt = typeof record.generatedAt === "string" ? record.generatedAt : undefined;

  return {
    allowed,
    answers,
    accentMap,
    stats,
    version,
    checksum,
    generatedAt,
  };
};

const normalizeAnswerPayload = (raw: unknown, wordLength: WordLength): readonly string[] => {
  if (!raw || typeof raw !== "object") {
    throw new Error(`KV-Antwort-Payload für ${wordLength} Buchstaben ist ungültig.`);
  }

  const record = raw as Partial<AnswerWordListPayload>;
  if (!Array.isArray(record.answers) || record.answers.some((entry) => typeof entry !== "string")) {
    throw new Error(`KV-Antwort-Payload für ${wordLength} Buchstaben enthält ungültige Antworten.`);
  }

  return record.answers;
};

const deriveStatsFromWordListData = (wordListData: WordListData): WordListStats => {
  const answers = wordListData.answers.length;
  const allowed = wordListData.allowed.length;
  const unique = new Set([
    ...wordListData.allowed,
    ...wordListData.answers,
    ...Object.keys(wordListData.accentMap),
    ...Object.values(wordListData.accentMap),
  ]).size;

  return { answers, allowed, unique };
};

const buildLocalBundle = async (wordLength: WordLength): Promise<WordListBundle> => {
  const data = await getLocalWordList(wordLength);
  const stats = deriveStatsFromWordListData(data);
  return {
    ...data,
    stats,
    version: "local",
    checksum: undefined,
    generatedAt: undefined,
  };
};

async function readBundleFromKv(wordLength: WordLength): Promise<WordListBundle> {
  ensureWordLength(wordLength);
  const namespace = await getKvNamespace();
  const key = toBundleKey(wordLength);
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  return normalizeBundle(value, wordLength);
}

async function readAnswerListFromKv(wordLength: WordLength): Promise<readonly string[]> {
  ensureWordLength(wordLength);
  const namespace = await getKvNamespace();
  const key = toAnswerKey(wordLength);
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  return normalizeAnswerPayload(value, wordLength);
}

export async function getWordListBundle(wordLength: WordLength): Promise<WordListBundle> {
  const cached = bundleCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    if (shouldUseLocalWordlists()) {
      return buildLocalBundle(wordLength);
    }

    try {
      return await readBundleFromKv(wordLength);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[wordlists] KV bundle konnte für Länge ${wordLength} nicht geladen werden. Lokale Liste wird genutzt.`,
          error,
        );
        return buildLocalBundle(wordLength);
      }
      throw error;
    }
  })();

  bundleCache.set(wordLength, promise);
  try {
    return await promise;
  } catch (error) {
    bundleCache.delete(wordLength);
    throw error;
  }
}

const getBaseWordListData = async (wordLength: WordLength): Promise<WordListData> => {
  if (shouldUseLocalWordlists()) {
    return getLocalWordList(wordLength);
  }

  const bundle = await getWordListBundle(wordLength);
  return {
    allowed: bundle.allowed,
    answers: bundle.answers,
    accentMap: bundle.accentMap,
  };
};

const getWordListDataForRegion = async (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<WordListData> => {
  if (regionMode === "standard") {
    return getBaseWordListData(wordLength);
  }

  const cacheKey = makeRegionKey(wordLength, regionMode);
  const cached = derivedWordListCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const base = await getBaseWordListData(wordLength);
    return filterWordListByRegion(base, regionMode);
  })().catch((error) => {
    derivedWordListCache.delete(cacheKey);
    throw error;
  });

  derivedWordListCache.set(cacheKey, promise);
  return promise;
};

export async function getWordListData(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<WordListData> {
  const data = await getWordListDataForRegion(wordLength, regionMode);
  registerWordList(wordLength, data, regionMode);
  return data;
}

export async function getWordListStats(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<WordListStats> {
  if (regionMode !== "standard") {
    const cacheKey = makeRegionKey(wordLength, regionMode);
    const cached = derivedStatsCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const promise = (async () => {
      const data = await getWordListDataForRegion(wordLength, regionMode);
      return buildWordListStats(data);
    })().catch((error) => {
      derivedStatsCache.delete(cacheKey);
      throw error;
    });
    derivedStatsCache.set(cacheKey, promise);
    return promise;
  }

  if (!shouldDeferWordListToBrowser(wordLength)) {
    const bundle = await getWordListBundle(wordLength);
    return bundle.stats;
  }

  const summary = WORD_LIST_SUMMARY[wordLength];
  if (!summary) {
    throw new Error(`Keine Statistiken für Wortlänge ${wordLength} verfügbar.`);
  }

  return {
    answers: summary.answers,
    allowed: summary.allowed,
    unique: summary.unique,
  };
}

export async function getAnswerList(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<readonly string[]> {
  if (regionMode !== "standard") {
    const cacheKey = makeRegionKey(wordLength, regionMode);
    const cached = answerListCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const promise = (async () => {
      const data = await getWordListDataForRegion(wordLength, regionMode);
      return data.answers;
    })().catch((error) => {
      answerListCache.delete(cacheKey);
      throw error;
    });
    answerListCache.set(cacheKey, promise);
    return promise;
  }

  if (shouldUseLocalWordlists()) {
    const data = await getLocalWordList(wordLength);
    return data.answers;
  }

  if (!shouldDeferWordListToBrowser(wordLength)) {
    const bundle = await getWordListBundle(wordLength);
    return bundle.answers;
  }

  const cached = answerListCache.get(makeRegionKey(wordLength, regionMode));
  if (cached) {
    return cached;
  }

  const promise = readAnswerListFromKv(wordLength).catch((error) => {
    answerListCache.delete(makeRegionKey(wordLength, regionMode));
    throw error;
  });
  answerListCache.set(makeRegionKey(wordLength, regionMode), promise);
  return promise;
}

const buildFinderPreview = async (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<FinderPreviewData> => {
  if (shouldDeferWordListToBrowser(wordLength) && !shouldUseLocalWordlists()) {
    throw new Error(
      `Finder-Vorschau-Fallback nicht unterstützt für ${wordLength} Buchstaben ohne lokale Daten.`,
    );
  }

  const data = await getWordListDataForRegion(wordLength, regionMode);
  registerWordList(wordLength, data, regionMode);
  const uppercaseWordList = getUppercaseWordList(wordLength, regionMode);
  const preview = uppercaseWordList.slice(0, FINDER_PREVIEW_LIMIT);
  return { preview, stats: buildWordListStats(data) };
};

async function readFinderPreviewFromKv(wordLength: WordLength): Promise<FinderPreviewData> {
  const namespace = await getKvNamespace();
  const key = `${FINDER_KEY_PREFIX}${wordLength}`;
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  const parsed = value as FinderPreviewData;
  if (!parsed.preview || !Array.isArray(parsed.preview)) {
    throw new Error(`KV key '${key}' returned an invalid preview payload.`);
  }
  if (!parsed.stats) {
    throw new Error(`KV key '${key}' returned no stats payload.`);
  }

  return parsed;
}

export async function getFinderPreviewData(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<FinderPreviewData> {
  if (regionMode !== "standard" || shouldUseLocalWordlists()) {
    return buildFinderPreview(wordLength, regionMode);
  }

  const cacheKey = makeRegionKey(wordLength, regionMode);
  const cached = finderPreviewCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = readFinderPreviewFromKv(wordLength);
  finderPreviewCache.set(cacheKey, promise);
  try {
    return await promise;
  } catch (error) {
    finderPreviewCache.delete(cacheKey);
    console.warn(
      `[wordlists] Finder-Vorschau fehlgeschlagen für Länge ${wordLength}. Erzeuge aus kompletter Liste.`,
      error,
    );
    const fallback = buildFinderPreview(wordLength, regionMode);
    finderPreviewCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function getFinderPageData(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<readonly string[]> {
  if (shouldDeferWordListToBrowser(wordLength) && !shouldUseLocalWordlists()) {
    throw new Error(
      `Die vollständige Wortliste für ${wordLength} Buchstaben ist nur im Browser verfügbar.`,
    );
  }

  const data = await getWordListDataForRegion(wordLength, regionMode);
  registerWordList(wordLength, data, regionMode);
  const uppercaseWordList = getUppercaseWordList(wordLength, regionMode);
  return uppercaseWordList;
}

export async function getGamePageData(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
  accentMode: AccentMode = DEFAULT_ACCENT_MODE,
): Promise<GamePageData> {
  const requiresBrowserBundle = isBrowserOnlyWordLength(wordLength);

  let wordListData: WordListData | null = null;
  let stats: WordListStats;

  if (!requiresBrowserBundle) {
    const baseData = await getBaseWordListData(wordLength);
    const regionData =
      regionMode === "standard" ? baseData : filterWordListByRegion(baseData, regionMode);
    registerWordList(wordLength, regionData, regionMode);
    wordListData = baseData;
    stats = buildWordListStats(regionData);
  } else {
    stats = await getWordListStats(wordLength, regionMode);
  }

  const dailySolution = await getDailySolution(wordLength, regionMode, accentMode);
  return {
    wordListData,
    stats,
    dailySolution,
    requiresBrowserBundle,
  };
}

export function clearWordListCache(): void {
  bundleCache.clear();
  finderPreviewCache.clear();
  answerListCache.clear();
  derivedWordListCache.clear();
  derivedStatsCache.clear();
}

const getDaysSinceEpoch = (): number => {
  return getDaysSinceBerlinEpoch({ year: 2026, month: 2, day: 15 });
};

const ensureAnswersAvailable = (answers: readonly string[], wordLength: WordLength) => {
  if (answers.length === 0) {
    throw new Error(`Die Antwortliste für ${wordLength} Buchstaben ist leer.`);
  }
};

const resolveDailySolutionVariant = (
  regionMode: RegionMode,
  accentMode: AccentMode,
): DailySolutionVariant => {
  if (regionMode === "ch") {
    return "ch";
  }
  return accentMode === "accented" ? "accented" : "plain";
};

const pickDistinctDailyWord = (
  answers: readonly string[],
  dayNumber: number,
  offset: number,
  reserved: Set<string>,
): string => {
  const startIndex = (dayNumber + offset) % answers.length;
  let index = startIndex;

  for (let attempts = 0; attempts < answers.length; attempts += 1) {
    const candidate = toUpperGerman(answers[index]);
    if (!reserved.has(candidate) || attempts === answers.length - 1) {
      reserved.add(candidate);
      return candidate;
    }
    index = (index + 1) % answers.length;
  }

  const fallback = toUpperGerman(answers[startIndex]);
  reserved.add(fallback);
  return fallback;
};

const getDailySolutionsByVariant = async (
  wordLength: WordLength,
): Promise<Record<DailySolutionVariant, string>> => {
  const [standardAnswers, chAnswers] = await Promise.all([
    getAnswerList(wordLength, "standard"),
    getAnswerList(wordLength, "ch"),
  ]);

  ensureAnswersAvailable(standardAnswers, wordLength);
  ensureAnswersAvailable(chAnswers, wordLength);

  const answersByVariant: Record<DailySolutionVariant, readonly string[]> = {
    plain: standardAnswers,
    accented: standardAnswers,
    ch: chAnswers,
  };

  const dayNumber = getDaysSinceEpoch();
  const reserved = new Set<string>();
  const result = {} as Record<DailySolutionVariant, string>;

  for (const variant of DAILY_SOLUTION_VARIANTS) {
    const answers = answersByVariant[variant];
    result[variant] = pickDistinctDailyWord(
      answers,
      dayNumber,
      DAILY_SOLUTION_OFFSETS[variant],
      reserved,
    );
  }

  return result;
};

export async function getDailySolution(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
  accentMode: AccentMode = DEFAULT_ACCENT_MODE,
): Promise<string> {
  const variant = resolveDailySolutionVariant(regionMode, accentMode);
  const solutions = await getDailySolutionsByVariant(wordLength);
  return solutions[variant];
}

export async function getRandomSolution(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<string> {
  const answers = await getAnswerList(wordLength, regionMode);
  ensureAnswersAvailable(answers, wordLength);
  const index = Math.floor(Math.random() * answers.length);
  return toUpperGerman(answers[index]);
}
