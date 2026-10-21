import type { WordLength, WordListStats } from "@/constants/wordlist-metadata";
import { getFinderPath, getGamePath, formatLengthLabel } from "@/lib/length-pages";
import type { AccentMode } from "@/lib/words";
import { getStarterWordGroups } from "@/lib/starter-word-sets";

export type LengthPageStats = WordListStats;

export type LengthSeoBulletSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LengthSeoFaq = {
  question: string;
  answer: string;
};

export type LengthExampleStep = {
  word: string;
  caption: string;
};

export type LengthExample = {
  title: string;
  description: string;
  solution: string;
  steps: LengthExampleStep[];
};

export type GuideGroup = {
  title: string;
  words: string[];
  description: string;
};

export type GuideContent = {
  title: string;
  description: string;
  groups: GuideGroup[];
  note?: string;
};

export type GameSeoContent = {
  intro: string;
  keyTakeaways: string[];
  sections: LengthSeoBulletSection[];
  faq: LengthSeoFaq[];
  relatedLinks: Array<{ href: string; label: string; description: string }>;
  example: LengthExample;
  guide: GuideContent;
};

export type FinderSeoContent = {
  intro: string;
  helper: string;
  sections: LengthSeoBulletSection[];
  faq: LengthSeoFaq[];
  highlights: string[];
};

type ContentContext = {
  length: WordLength;
  lengthLabel: string;
  accentMode: AccentMode;
  accentLabel: string;
  accentDescriptor: string;
  finderPath: string;
  accentedGamePath: string;
  plainGamePath: string;
  stats: LengthPageStats;
  formatNumber: (value: number) => string;
};

const getAccentDescriptor = (accentMode: AccentMode) =>
  accentMode === "accented" ? "mit Umlauten" : "ohne Umlaute";

const getAccentLabel = (accentMode: AccentMode) =>
  accentMode === "accented" ? "mit Umlauten" : "ohne Umlaute";

const MAX_GUESSES = 6;

const buildGameIntro = (context: ContentContext): string => {
  const { lengthLabel, accentDescriptor, stats, formatNumber } = context;
  const total = formatNumber(stats.unique);
  return `Wordle Deutsch mit ${lengthLabel} ${accentDescriptor} bietet ${total} mögliche Wörter. Spiele deine Startwörter als feste Sequenz, um zuerst Buchstaben auszuschließen und danach gezielt Positionen zu lösen.`;
};

type ScoredExampleWord = {
  word: string;
  overlapCount: number;
  absentCount: number;
  absentLetters: Set<string>;
};

const getUniqueCharacters = (word: string): string[] => Array.from(new Set(Array.from(word)));

const scoreWordAgainstSolution = (word: string, solutionLetters: Set<string>): ScoredExampleWord => {
  const uniqueChars = getUniqueCharacters(word);
  const absentLetters = new Set<string>();
  let overlapCount = 0;

  for (const char of uniqueChars) {
    if (solutionLetters.has(char)) {
      overlapCount += 1;
    } else {
      absentLetters.add(char);
    }
  }

  return {
    word,
    overlapCount,
    absentCount: absentLetters.size,
    absentLetters,
  };
};

const buildFallbackWord = (length: number, seed: string): string => {
  const chars = Array.from(seed);
  if (chars.length === 0) {
    return "A".repeat(Math.max(1, length));
  }

  return Array.from({ length: Math.max(1, length) }, (_, index) => chars[index % chars.length]).join("");
};

const chooseExampleScenario = (words: string[], wordLength: number): { solution: string; guesses: string[] } => {
  const distinctWords = Array.from(new Set(words));
  if (distinctWords.length === 0) {
    const fallbackSolution = buildFallbackWord(wordLength, "LÖSUNG");
    return {
      solution: fallbackSolution,
      guesses: [
        buildFallbackWord(wordLength, "START"),
        buildFallbackWord(wordLength, "PRÜFEN"),
        buildFallbackWord(wordLength, "MUSTER"),
        buildFallbackWord(wordLength, "KLAREN"),
        buildFallbackWord(wordLength, "FILTER"),
      ],
    };
  }

  if (distinctWords.length === 1) {
    return {
      solution: distinctWords[0],
      guesses: [distinctWords[0], distinctWords[0], distinctWords[0], distinctWords[0], distinctWords[0]],
    };
  }

  const earlyGuessTarget = Math.min(4, MAX_GUESSES - 2);
  let bestSelection: { solution: string; guesses: string[] } | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const solution of distinctWords) {
    const solutionLetters = new Set(Array.from(solution));
    const candidates = distinctWords
      .filter((word) => word !== solution)
      .map((word) => scoreWordAgainstSolution(word, solutionLetters));

    const earlyPhase = [...candidates]
      .sort((a, b) => b.absentCount - a.absentCount || a.overlapCount - b.overlapCount)
      .slice(0, earlyGuessTarget);

    const earlyUsed = new Set(earlyPhase.map((entry) => entry.word));
    const latePhase = candidates
      .filter((entry) => !earlyUsed.has(entry.word))
      .sort((a, b) => b.overlapCount - a.overlapCount || b.absentCount - a.absentCount);

    const orderedGuesses = [...earlyPhase, ...latePhase].map((entry) => entry.word);

    const earlyAbsentLetters = new Set<string>();
    for (const guess of earlyPhase) {
      for (const char of guess.absentLetters) {
        earlyAbsentLetters.add(char);
      }
    }

    const score =
      earlyAbsentLetters.size * 10 +
      earlyPhase.reduce((sum, entry) => sum + entry.absentCount, 0) * 2 -
      earlyPhase.reduce((sum, entry) => sum + entry.overlapCount, 0);

    if (score > bestScore) {
      bestScore = score;
      bestSelection = { solution, guesses: orderedGuesses };
    }
  }

  return bestSelection ?? { solution: distinctWords[0], guesses: distinctWords.slice(1) };
};

const getExampleStepCaption = (stepIndex: number, finalGuessIndex: number): string => {
  const move = stepIndex + 1;
  if (stepIndex === 0) {
    return `${move}. Zug: Breiter Ausschlussstart mit vielen neuen Buchstaben`;
  }
  if (stepIndex === 1) {
    return `${move}. Zug: Weitere Buchstabenfelder scannen und graue Hinweise sammeln`;
  }
  if (stepIndex === 2) {
    return `${move}. Zug: Vokale und Kernkonsonanten nachschärfen`;
  }
  if (stepIndex === 3) {
    return `${move}. Zug: Mustercheck für typische Endungen und Positionen`;
  }
  if (stepIndex === finalGuessIndex) {
    return `${move}. Zug: Lösung spielen`;
  }
  return `${move}. Zug: Restkandidaten gezielt reduzieren`;
};

const buildExampleContent = (context: ContentContext): LengthExample => {
  const starterWords = getStarterWordGroups(context.length, context.accentMode).flatMap((group) => group.words);
  const scenario = chooseExampleScenario(starterWords, context.length);
  const maxSetupMoves = MAX_GUESSES - 1;
  const guessWords = scenario.guesses.slice(0, maxSetupMoves);
  while (guessWords.length < maxSetupMoves) {
    guessWords.push(guessWords[guessWords.length - 1] ?? scenario.solution);
  }

  const solutionStepIndex = guessWords.length;
  const stepWords = [...guessWords, scenario.solution];

  return {
    title: "Beispielrunde",
    description:
      "Die Beispielrunde nutzt alle 6 Züge: zuerst gezielter Buchstabenausschluss, danach Musterarbeit und abschließend der Lösungszug.",
    solution: scenario.solution,
    steps: stepWords.map((word, index) => ({
      word,
      caption: getExampleStepCaption(index, solutionStepIndex),
    })),
  };
};

const buildGuideContent = (context: ContentContext): GuideContent => {
  const groups = getStarterWordGroups(context.length, context.accentMode);
  const note =
    context.accentMode === "accented"
      ? "Im Umlaut-Modus lohnt sich mindestens ein Starter-Set mit Ä/Ö/Ü, damit du keine falschen Ausschlüsse baust."
      : "Wenn nach zwei Zügen wenige Vokale bestätigt sind, teste gezielt Doppelbuchstaben (z. B. NN, LL, SS) statt nur neue Einzelbuchstaben.";

  return {
    title: `Startwörter für ${context.lengthLabel}`,
    description: "Nutze Startwörter als feste Sets: erst Abdeckung, dann Musterprüfung, dann gezielte Positionssuche.",
    groups,
    note,
  };
};

const gameSections = (context: ContentContext): LengthSeoBulletSection[] => {
  const { finderPath, lengthLabel } = context;
  return [
    {
      title: "Startstrategie",
      paragraphs: [
        `Mit ${lengthLabel} solltest du mit 2-3 Wörtern starten, die zusammen möglichst viele häufige Buchstaben abdecken.`,
        "Ab Zug 3 wechselst du von reiner Abdeckung auf Positionsarbeit: gelbe Buchstaben verschieben, grüne Positionen absichern.",
      ],
      bullets: [
        "Decke A/E/I/O/U früh ab und kombiniere mit häufigen Konsonanten wie N/R/S/T/L.",
        "Wenn kaum Vokale bestätigt sind, teste früh Doppelbuchstaben (z. B. NN, LL, SS).",
        "Wenn 2-3 Buchstaben fix sind, prüfe typische Muster wie -EN, -ER, GE-, VER-.",
      ],
    },
    {
      title: "Umlaute & ß",
      paragraphs: [
        "Im Umlaut-Modus sind Ä, Ö und Ü eigene Buchstaben. Plane deshalb mindestens einen Umlaut-Testzug ein.",
        "Das ß ist im DE/AT-Modus gültig; im CH-Modus wird es nicht verwendet.",
      ],
      bullets: [
        "Ohne Umlaute zählen Ä/Ö/Ü wie A/O/U.",
        "Mit Umlauten können Ä/Ö/Ü komplett andere Wortzweige öffnen.",
      ],
    },
    {
      title: "Endspiel mit Wortsuche",
      paragraphs: [
        `Wenn dir nur noch ein Platz fehlt, nutze die Wortsuche (${finderPath}) zum Filtern.`,
        "So vermeidest du unnötige Fehlversuche und spielst den letzten Zug deutlich sicherer.",
      ],
      bullets: [
        "Ausschlüsse zuerst setzen, dann Positionsfilter schrittweise ergänzen.",
        "Bei zwei offenen Slots gezielt die wahrscheinlichsten Endungen priorisieren.",
      ],
    },
  ];
};

const gameFaq = (context: ContentContext): LengthSeoFaq[] => {
  const { accentDescriptor } = context;
  return [
    {
      question: `Gibt es Wordle Deutsch mit ${accentDescriptor}?`,
      answer: "Ja, du kannst zwischen Umlaut-Modus und Standardmodus wechseln.",
    },
    {
      question: "Wie viele Versuche habe ich?",
      answer: "Du hast 6 Versuche pro Runde.",
    },
    {
      question: "Gibt es einen Endlos-Modus?",
      answer: "Ja, neben dem Tageswort gibt es den Endlos-Modus ohne Limit.",
    },
  ];
};

const gameLinks = (context: ContentContext): GameSeoContent["relatedLinks"] => {
  const { finderPath, accentedGamePath, plainGamePath, accentMode } = context;
  const links: GameSeoContent["relatedLinks"] = [
    {
      href: finderPath,
      label: "Wordle Hilfe",
      description: "Filtere Wörter nach Positionen, Pflichtbuchstaben und Ausschlüssen.",
    },
    {
      href: "/wordle-anleitung",
      label: "Wordle Anleitung",
      description: "Strategien, Startwörter und Tipps für Wordle Deutsch.",
    },
  ];

  if (accentMode === "accented") {
    links.unshift({
      href: plainGamePath,
      label: "Ohne Umlaute",
      description: "Wechsle zur Standardvariante ohne Umlaute.",
    });
  } else {
    links.unshift({
      href: accentedGamePath,
      label: "Mit Umlauten",
      description: "Trainiere die Variante mit Umlauten und ß (DE/AT).",
    });
  }

  return links;
};

const gameKeyTakeaways = (context: ContentContext): string[] => {
  const { lengthLabel, finderPath, accentMode } = context;
  const accentMessage =
    accentMode === "accented"
      ? "Plane einen gezielten Umlaut-Testzug ein, statt Umlaute nur nebenbei mitzunehmen."
      : "Wenn Vokale fehlen, teste gezielt Doppelbuchstaben statt blind neue Buchstaben zu streuen.";

  return [
    `Nutze Starter-Sets für ${lengthLabel}: erst Ausschluss, dann Positionsarbeit.`,
    accentMessage,
    `Nutze die Wortsuche (${finderPath}) für Positionsarbeit im Endspiel.`,
  ];
};

export const getGameSeoContent = (
  length: WordLength,
  accentMode: AccentMode,
  stats: LengthPageStats,
  formatNumber: (value: number) => string
): GameSeoContent => {
  const lengthLabel = formatLengthLabel(length);
  const accentLabel = getAccentLabel(accentMode);
  const accentDescriptor = getAccentDescriptor(accentMode);
  const finderPath = getFinderPath(length);
  const accentedGamePath = getGamePath(length, "accented");
  const plainGamePath = getGamePath(length, "plain");

  const context: ContentContext = {
    length,
    lengthLabel,
    accentMode,
    accentLabel,
    accentDescriptor,
    finderPath,
    accentedGamePath,
    plainGamePath,
    stats,
    formatNumber,
  };

  return {
    intro: buildGameIntro(context),
    keyTakeaways: gameKeyTakeaways(context),
    sections: gameSections(context),
    faq: gameFaq(context),
    relatedLinks: gameLinks(context),
    example: buildExampleContent(context),
    guide: buildGuideContent(context),
  };
};

export const getFinderSeoContent = (
  length: WordLength,
  _accentMode: AccentMode,
  stats: LengthPageStats,
  formatNumber: (value: number) => string
): FinderSeoContent => {
  const lengthLabel = formatLengthLabel(length);
  const total = formatNumber(stats.unique);
  const answers = formatNumber(stats.answers);

  return {
    intro: `Finde Wordle-Wörter mit ${lengthLabel} schnell und gezielt.`,
    helper: `Die Wortsuche enthält ${total} mögliche Wörter und ${answers} tägliche Antworten.`,
    highlights: [
      "Positionsfilter für grüne Hinweise.",
      "Pflicht- und Ausschlussbuchstaben für gelbe/graue Hinweise.",
      "Umlaut-Modus für Ä, Ö, Ü (ß im DE/AT-Modus).",
    ],
    sections: [
      {
        title: "So nutzt du die Filter",
        paragraphs: [
          "Setze grüne Buchstaben direkt an die richtige Position.",
          "Gelbe Buchstaben gehören ins Wort, aber nicht an die markierte Stelle.",
        ],
        bullets: [
          "Kombiniere Positionsfilter mit Ausschlüssen für schnelle Ergebnisse.",
          "Teste Umlaute, wenn keine Standardvokale passen.",
        ],
      },
      {
        title: "Endspiel beschleunigen",
        paragraphs: [
          "Sobald 2-3 Buchstaben fix sind, reduziert die Suche die Optionen drastisch.",
          "So sparst du Versuche und sicherst die Lösung.",
        ],
      },
    ],
    faq: [
      {
        question: "Ist die Wortsuche kostenlos?",
        answer: "Ja, sie ist komplett kostenlos und ohne Limit verfügbar.",
      },
      {
        question: "Nutzen Tageswort und Endlos-Modus dieselbe Liste?",
        answer: "Beide nutzen die gleiche Wortliste, der Endlos-Modus wählt zufällig.",
      },
      {
        question: "Wie aktiviere ich den Umlaut-Modus?",
        answer: "Schalte oben auf der Seite auf 'mit Umlauten'.",
      },
    ],
  };
};
