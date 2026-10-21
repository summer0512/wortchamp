import type { AccentMode, WordLength } from "@/lib/words";

export const WORD_LENGTH_VARIANTS: WordLength[] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

export const formatLengthLabel = (length: WordLength) => `${length} Buchstaben`;

const accentModeSuffix = (accentMode: AccentMode): string =>
  accentMode === "accented" ? "-mit-umlauten" : "";

const accentModeLabel = (accentMode: AccentMode): string =>
  accentMode === "accented" ? "mit Umlauten" : "ohne Umlaute";

export const getGameSlug = (length: WordLength, accentMode: AccentMode = "plain") =>
  `wordle-${length}-buchstaben${accentModeSuffix(accentMode)}`;

export const getGamePath = (length: WordLength, accentMode: AccentMode = "plain") =>
  `/${getGameSlug(length, accentMode)}`;

export const getFinderSlug = (length: WordLength) => `wordle-hilfe-${length}-buchstaben`;
export const getFinderPath = (length: WordLength) => `/${getFinderSlug(length)}`;

export const getGuideSlug = (length: WordLength) => `wordle-anleitung-${length}-buchstaben`;
export const getGuidePath = (length: WordLength) => `/${getGuideSlug(length)}`;

const buildTitle = (lengthLabel: string, accentMode: AccentMode) =>
  `Wordle ${lengthLabel} ${accentModeLabel(accentMode)} | Wortchamp`;

const buildDescription = (lengthLabel: string, accentMode: AccentMode) =>
  accentMode === "accented"
    ? `Spiele Wordle mit ${lengthLabel} und Umlauten: täglich, im Endlos-Modus oder als eigenes Rätsel.`
    : `Spiele Wordle Deutsch mit ${lengthLabel} ohne Umlaute: tägliches Wort, Endlos-Modus und eigene Challenges.`;

export const getGameCopy = (length: WordLength, accentMode: AccentMode = "plain") => {
  const label = formatLengthLabel(length);
  const accentLabel = accentModeLabel(accentMode);
  return {
    title: buildTitle(label, accentMode),
    description: buildDescription(label, accentMode),
    keywords: [
      `wordle deutsch ${label}`,
      `wordle ${label} buchstaben`,
      `wordle ${label} ${accentLabel}`,
      `wordle deutsch spielen`,
      `wortle ${label} ${accentLabel}`,
    ],
    heading: `Wordle mit ${label} ${accentLabel}`,
    subheading:
      accentMode === "accented"
        ? `Errate Wörter mit ${label} und Umlauten im Tagesmodus, Endlos-Modus oder als Challenge.`
        : `Errate Wörter mit ${label} ohne Umlaute im Tagesmodus, Endlos-Modus oder als Challenge.`,
  };
};

export const getFinderCopy = (length: WordLength, totalWords?: number) => {
  const label = formatLengthLabel(length);
  const total = totalWords ? new Intl.NumberFormat("de-DE").format(totalWords) : null;
  return {
    title: `Wordle Hilfe: Wörter mit ${label} | Wortchamp`,
    description: `Finde Wörter mit ${label} für Wordle Deutsch: Filter für Positionen, Pflichtbuchstaben und Ausschlüsse.`,
    keywords: [
      `wordle hilfe ${label}`,
      `wortsuche ${label}`,
      `wordle deutsch ${label}`,
      `wort mit ${label}`,
    ],
    heading: `Wordle Hilfe für ${label}`,
    subheading: total
      ? `Durchsuche ${total} Wörter mit ${label} für deine nächsten Züge.`
      : `Entdecke tausende Wörter mit ${label} für Wordle Deutsch.`,
  };
};

export const getLengthLandingEntries = () =>
  WORD_LENGTH_VARIANTS.map((length) => ({
    length,
    gamePath: getGamePath(length, "plain"),
    accentedGamePath: getGamePath(length, "accented"),
    finderPath: getFinderPath(length),
  }));
