import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { WordLength } from "@/constants/wordlist-metadata";
import { getFinderPageData, isBrowserOnlyWordLength } from "@/lib/wordlists.server";
import { getPlainUppercaseWordList, isSupportedWordLength, stripAccents } from "@/lib/words";
import { DEFAULT_REGION_MODE, type RegionMode } from "@/lib/region";

const LETTER_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Ä",
  "Ö",
  "Ü",
  "ẞ",
];

const LETTER_SET = new Set(LETTER_OPTIONS);
const LETTER_OPTIONS_CH = LETTER_OPTIONS.filter((letter) => letter !== "ẞ");
const LETTER_SET_CH = new Set(LETTER_OPTIONS_CH);
const RESULTS_PAGE_SIZE = Number.parseInt(process.env.FINDER_PREVIEW_LIMIT ?? "100", 10);

const toUpperGerman = (value: string) =>
  Array.from(value)
    .map((char) => (char === "ß" ? "ẞ" : char.toLocaleUpperCase("de-DE")))
    .join("");

const sanitizeLetter = (rawValue: string, letterSet: Set<string>): string => {
  const normalized = toUpperGerman(rawValue);
  for (const char of Array.from(normalized)) {
    if (letterSet.has(char)) {
      return char;
    }
  }
  return "";
};

const dedupeLetters = (letters: string[]): string[] => {
  return Array.from(new Set(letters.filter(Boolean)));
};

type FinderSearchPayload = {
  words: string[];
  total: number;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ length: string }> }) {
  const { length } = await params;
  const lengthParam = Number.parseInt(length, 10);
  if (!isSupportedWordLength(lengthParam)) {
    return NextResponse.json({ error: "Wortlänge nicht unterstützt" }, { status: 400 });
  }

  const wordLength = lengthParam as WordLength;
  if (isBrowserOnlyWordLength(wordLength)) {
    return NextResponse.json(
      { error: "Diese Wortlänge kann nur im Browser gefiltert werden." },
      { status: 400 },
    );
  }
  const url = request.nextUrl;
  const respectAccents = url.searchParams.get("acc") === "1";
  const regionParam = url.searchParams.get("region");
  const region: RegionMode = regionParam === "ch" ? "ch" : DEFAULT_REGION_MODE;
  const letterSet = region === "ch" ? LETTER_SET_CH : LETTER_SET;

  const parseLettersParam = (value: string | null): string[] => {
    if (!value) {
      return [];
    }
    const parsed = Array.from(value)
      .map((char) => sanitizeLetter(char, letterSet))
      .filter(Boolean);
    return dedupeLetters(parsed.filter((letter) => letterSet.has(letter)));
  };

  const includeLetters = parseLettersParam(url.searchParams.get("incl"));
  const excludeLetters = parseLettersParam(url.searchParams.get("excl"));

  const positionLetters = Array.from({ length: wordLength }, () => "");
  const positionsParam = url.searchParams.get("pos");
  if (positionsParam && positionsParam.length === wordLength) {
    for (let index = 0; index < wordLength; index += 1) {
      const char = positionsParam[index];
      if (char === "_") {
        continue;
      }
      const sanitized = sanitizeLetter(char, letterSet);
      if (sanitized && letterSet.has(sanitized)) {
        positionLetters[index] = sanitized;
      }
    }
  }

  const normalizedPositionLetters = respectAccents
    ? positionLetters
    : positionLetters.map((letter) => (letter ? stripAccents(letter) : ""));

  const normalizedIncludeLetters = respectAccents
    ? includeLetters
    : includeLetters.map((letter) => stripAccents(letter));

  const normalizedExcludeLetters = respectAccents
    ? excludeLetters
    : excludeLetters.map((letter) => stripAccents(letter));

  const hasIncludeFilter = normalizedIncludeLetters.length > 0;
  const hasExcludeFilter = normalizedExcludeLetters.length > 0;

  const wordList = await getFinderPageData(wordLength, region);
  const comparisonWordList = respectAccents
    ? wordList
    : getPlainUppercaseWordList(wordLength, region);

  const matches: string[] = [];
  let totalMatches = 0;

  for (let listIndex = 0; listIndex < wordList.length; listIndex += 1) {
    const word = wordList[listIndex];
    const comparisonWord = comparisonWordList[listIndex];

    let matchesPositions = true;
    for (let index = 0; index < wordLength; index += 1) {
      const target = normalizedPositionLetters[index];
      if (target && comparisonWord[index] !== target) {
        matchesPositions = false;
        break;
      }
    }

    if (!matchesPositions) {
      continue;
    }

    if (hasIncludeFilter) {
      let includesAll = true;
      for (const letter of normalizedIncludeLetters) {
        if (!comparisonWord.includes(letter)) {
          includesAll = false;
          break;
        }
      }
      if (!includesAll) {
        continue;
      }
    }

    if (hasExcludeFilter) {
      let excludesAll = true;
      for (const letter of normalizedExcludeLetters) {
        if (letter && comparisonWord.includes(letter)) {
          excludesAll = false;
          break;
        }
      }
      if (!excludesAll) {
        continue;
      }
    }

    totalMatches += 1;
    if (matches.length < RESULTS_PAGE_SIZE) {
      matches.push(word);
    }
  }

  const payload: FinderSearchPayload = {
    words: matches,
    total: totalMatches,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
