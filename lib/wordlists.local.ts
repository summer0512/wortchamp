import { promises as fs } from "fs";
import path from "path";
import type { WordLength, WordListData } from "@/constants/wordlist-metadata";
import { WORD_LENGTHS } from "@/constants/wordlist-metadata";
import { stripAccents } from "@/lib/words";
import { DEFAULT_REGION_MODE, type RegionMode } from "@/lib/region";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANSWERS_DIR = path.join(DATA_DIR, "answers");
const LETTER_REGEX = new RegExp(String.raw`^[A-Za-zÄÖÜäöüßẞ]+$`, "u");

const locale = "de-DE";

const wordLengthSet = new Set<WordLength>(WORD_LENGTHS);

const localCache = new Map<string, Promise<WordListData>>();

const toLowerCase = (value: string) => value.toLocaleLowerCase(locale);

const countGraphemes = (value: string) => Array.from(value).length;

const getFilePrefix = (wordLength: WordLength) => wordLength.toString().padStart(2, "0");

const parseWordList = (raw: string, wordLength: WordLength, source: string): string[] => {
  const words = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((word) => toLowerCase(word));

  const unique = new Set<string>();

  for (const word of words) {
    if (countGraphemes(word) !== wordLength) {
      throw new Error(
        `Das Wort '${word}' in ${source} hat nicht genau ${wordLength} Zeichen.`
      );
    }

    if (!LETTER_REGEX.test(word)) {
      throw new Error(`Das Wort '${word}' in ${source} enthält ungültige Zeichen.`);
    }

    unique.add(word);
  }

  return Array.from(unique);
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
  return Object.fromEntries(Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, locale)));
};

const hasEszett = (value: string) => value.includes("ß") || value.includes("ẞ");

const makeCacheKey = (wordLength: WordLength, regionMode: RegionMode) => `${regionMode}:${wordLength}`;

async function readLocalWordList(
  wordLength: WordLength,
  regionMode: RegionMode,
): Promise<WordListData> {
  if (!wordLengthSet.has(wordLength)) {
    throw new Error(`Nicht unterstützte Wortlänge: ${wordLength}`);
  }

  const prefix = getFilePrefix(wordLength);
  const allowedPath = path.join(DATA_DIR, `${prefix}.txt`);
  const answersPath = path.join(ANSWERS_DIR, `${prefix}.txt`);

  const [allowedRaw, answersRaw] = await Promise.all([
    fs.readFile(allowedPath, "utf8"),
    fs.readFile(answersPath, "utf8"),
  ]);

  let allowed = parseWordList(allowedRaw, wordLength, allowedPath);
  let answers = parseWordList(answersRaw, wordLength, answersPath);

  if (regionMode === "ch") {
    allowed = allowed.filter((word) => !hasEszett(word));
    answers = answers.filter((word) => !hasEszett(word));
  }

  const accentMap = buildAccentMap([...allowed, ...answers]);

  return {
    allowed,
    answers,
    accentMap,
  };
}

export async function getLocalWordList(
  wordLength: WordLength,
  regionMode: RegionMode = DEFAULT_REGION_MODE,
): Promise<WordListData> {
  const cacheKey = makeCacheKey(wordLength, regionMode);
  const cached = localCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = readLocalWordList(wordLength, regionMode);
  localCache.set(cacheKey, promise);
  try {
    return await promise;
  } catch (error) {
    localCache.delete(cacheKey);
    throw error;
  }
}
