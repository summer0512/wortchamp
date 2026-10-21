import { WORD_LENGTHS, type WordLength, type WordListData, type WordListStats } from "@/constants/wordlist-metadata";
import { DEFAULT_REGION_MODE, type RegionMode } from "@/lib/region";
import { getDaysSinceBerlinEpoch } from "@/lib/time";

export type { WordLength, WordListData } from "@/constants/wordlist-metadata";
export type { RegionMode } from "@/lib/region";

export type AccentMode = "plain" | "accented";

export interface WordSettings {
  wordLength: WordLength;
  accentMode: AccentMode;
  regionMode: RegionMode;
}

export const DEFAULT_WORD_LENGTH: WordLength = 5;
export const DEFAULT_ACCENT_MODE: AccentMode = "plain";
export const DEFAULT_SETTINGS: WordSettings = {
  wordLength: DEFAULT_WORD_LENGTH,
  accentMode: DEFAULT_ACCENT_MODE,
  regionMode: DEFAULT_REGION_MODE,
};

const GERMAN_LOCALE = "de-DE";
const DIACRITIC_PATTERN = new RegExp(String.raw`\p{Diacritic}`, "gu");

const keepDiacriticsFor = new Map<string, string>();

type PreparedWordList = {
  data: WordListData;
  allowedSet: Set<string>;
  answersSet: Set<string>;
};

const rawDataCache = new Map<string, WordListData>();
const preparedCache = new Map<string, PreparedWordList>();
const uppercaseCache = new Map<string, string[]>();
const plainUppercaseCache = new Map<string, string[]>();

const toLowerCase = (value: string) => value.toLocaleLowerCase(GERMAN_LOCALE);
const toGermanUppercase = (value: string) =>
  Array.from(value)
    .map((char) => (char === "ß" ? "ẞ" : char.toLocaleUpperCase(GERMAN_LOCALE)))
    .join("");

export const stripAccents = (word: string): string => {
  let protectedWord = word;
  keepDiacriticsFor.forEach((placeholder, char) => {
    protectedWord = protectedWord.replace(new RegExp(char, "g"), placeholder);
  });

  const normalized = protectedWord
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .normalize("NFC");

  let restored = normalized;
  keepDiacriticsFor.forEach((placeholder, char) => {
    restored = restored.replace(new RegExp(placeholder, "g"), char);
  });

  return restored;
};

const makeCacheKey = (wordLength: WordLength, regionMode: RegionMode) => `${regionMode}:${wordLength}`;

export const hasWordList = (wordLength: WordLength, regionMode: RegionMode = DEFAULT_REGION_MODE): boolean =>
  rawDataCache.has(makeCacheKey(wordLength, regionMode));

export const registerWordList = (
  wordLength: WordLength,
  data: WordListData,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): void => {
  const key = makeCacheKey(wordLength, regionMode);
  rawDataCache.set(key, data);
  preparedCache.delete(key);
  uppercaseCache.delete(key);
  plainUppercaseCache.delete(key);
};

const ensureWordListData = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): WordListData => {
  const data = rawDataCache.get(makeCacheKey(wordLength, regionMode));
  if (!data) {
    throw new Error(
      `Keine Wortliste für Länge ${wordLength} geladen. ` +
        `Bitte zuerst registerWordList(${wordLength}) verwenden.`
    );
  }
  return data;
};

export const loadWordList = async (wordLength: WordLength): Promise<WordListData> => {
  throw new Error(
    "loadWordList wird zur Laufzeit nicht unterstützt. " +
      "Bitte WordListData vorab registrieren, bevor du die Helper nutzt."
  );
};

const getPreparedWordList = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): PreparedWordList => {
  const cacheKey = makeCacheKey(wordLength, regionMode);
  const cached = preparedCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const data = ensureWordListData(wordLength, regionMode);

  const prepared: PreparedWordList = {
    data,
    allowedSet: new Set(data.allowed),
    answersSet: new Set(data.answers),
  };

  preparedCache.set(cacheKey, prepared);
  return prepared;
};

export const isSupportedWordLength = (value: number): value is WordLength => {
  return WORD_LENGTHS.includes(value as WordLength);
};

export const getAvailableWordLengths = (): readonly WordLength[] => WORD_LENGTHS;

export const normalizeWord = (word: string, settings: WordSettings): string => {
  const lower = toLowerCase(word);
  if (settings.accentMode === "accented") {
    return lower;
  }

  return stripAccents(lower);
};

export const isWordInWordList = (word: string, settings: WordSettings): boolean => {
  const lower = toLowerCase(word);
  if (Array.from(lower).length !== settings.wordLength) {
    return false;
  }

  const { allowedSet, answersSet, data } = getPreparedWordList(
    settings.wordLength,
    settings.regionMode,
  );

  if (settings.accentMode === "accented") {
    return allowedSet.has(lower) || answersSet.has(lower);
  }

  const base = stripAccents(lower);

  if (allowedSet.has(base) || answersSet.has(base)) {
    return true;
  }

  const canonical = data.accentMap[base];
  if (canonical && (allowedSet.has(canonical) || answersSet.has(canonical))) {
    return true;
  }

  return false;
};

export const isWinningWord = (word: string, solution: string, settings: WordSettings): boolean => {
  const normalizedInput = normalizeWord(word, settings);
  const normalizedSolution = normalizeWord(solution, settings);
  return normalizedInput === normalizedSolution;
};

const getDaysSinceEpoch = (): number => {
  return getDaysSinceBerlinEpoch({ year: 2026, month: 2, day: 15 });
};

export const getWordOfDay = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): string => {
  const { data } = getPreparedWordList(wordLength, regionMode);
  const answers = data.answers;
  if (answers.length === 0) {
    throw new Error(`Die Antwortliste für ${wordLength} Buchstaben ist leer.`);
  }

  const index = getDaysSinceEpoch() % answers.length;
  return toGermanUppercase(answers[index]);
};

export const getRandomWord = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): string => {
  const { data } = getPreparedWordList(wordLength, regionMode);
  const answers = data.answers;
  if (answers.length === 0) {
    throw new Error(`Die Antwortliste für ${wordLength} Buchstaben ist leer.`);
  }

  const index = Math.floor(Math.random() * answers.length);
  return toGermanUppercase(answers[index]);
};

const KEYBOARD_CHARACTERS_STANDARD = new Set(
  Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜẞ"),
);
const KEYBOARD_CHARACTERS_CH = new Set(
  Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ"),
);
const getKeyboardCharacters = (regionMode: RegionMode) =>
  regionMode === "ch" ? KEYBOARD_CHARACTERS_CH : KEYBOARD_CHARACTERS_STANDARD;

const buildUppercaseWordList = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): string[] => {
  const data = ensureWordListData(wordLength, regionMode);
  const accepted = new Set<string>();
  const keyboardCharacters = getKeyboardCharacters(regionMode);

  const addWord = (word?: string) => {
    if (!word) {
      return;
    }

    const trimmed = word.trim();
    if (!trimmed) {
      return;
    }

    if (Array.from(trimmed).length !== wordLength) {
      return;
    }

    const upper = toGermanUppercase(trimmed);
    if (Array.from(upper).every((char) => keyboardCharacters.has(char))) {
      accepted.add(upper);
    }
  };

  data.allowed.forEach(addWord);
  data.answers.forEach(addWord);
  Object.keys(data.accentMap).forEach(addWord);
  Object.values(data.accentMap).forEach(addWord);

  return Array.from(accepted).sort((a, b) => a.localeCompare(b, "de"));
};

export const getUppercaseWordList = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): readonly string[] => {
  const cacheKey = makeCacheKey(wordLength, regionMode);
  const cached = uppercaseCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const generated = buildUppercaseWordList(wordLength, regionMode);
  uppercaseCache.set(cacheKey, generated);
  return generated;
};

export const getPlainUppercaseWordList = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): readonly string[] => {
  const cacheKey = makeCacheKey(wordLength, regionMode);
  const cached = plainUppercaseCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const uppercase = getUppercaseWordList(wordLength, regionMode);
  const generated = uppercase.map((word) => stripAccents(word));
  plainUppercaseCache.set(cacheKey, generated);
  return generated;
};

export const getWordListData = (
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): WordListData => {
  return ensureWordListData(wordLength, regionMode);
};

export const buildAccentMap = (words: readonly string[]): Record<string, string> => {
  const map = new Map<string, string>();
  for (const word of words) {
    const base = stripAccents(word);
    if (base === word) {
      continue;
    }
    if (map.has(base)) {
      continue;
    }
    map.set(base, word);
  }
  return Object.fromEntries(Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, GERMAN_LOCALE)));
};

const hasEszett = (value: string) => value.includes("ß") || value.includes("ẞ");

export const filterWordListByRegion = (
  data: WordListData,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): WordListData => {
  if (regionMode === "standard") {
    return data;
  }

  const allowed = data.allowed.filter((word) => !hasEszett(word));
  const answers = data.answers.filter((word) => !hasEszett(word));
  const accentMap = buildAccentMap([...allowed, ...answers]);

  return { allowed, answers, accentMap };
};

export const buildWordListStats = (data: WordListData): WordListStats => {
  const uniqueCount = new Set([
    ...data.allowed,
    ...data.answers,
    ...Object.keys(data.accentMap),
    ...Object.values(data.accentMap),
  ]).size;
  return {
    allowed: data.allowed.length,
    answers: data.answers.length,
    unique: uniqueCount,
  };
};
