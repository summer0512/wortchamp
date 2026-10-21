import type { WordLength } from "@/constants/wordlist-metadata";
import { formatLengthLabel, getFinderPath, getGamePath } from "@/lib/length-pages";
import { getCombinedStarterWordGroups } from "@/lib/starter-word-sets";

export type GuideOpeningGroup = {
  title: string;
  words: string[];
  description: string;
};

export type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type LengthGuideContent = {
  title: string;
  description: string;
  openingTitle: string;
  openingIntro: string;
  openingGroups: GuideOpeningGroup[];
  sections: GuideSection[];
  faq: GuideFaq[];
  links: Array<{ href: string; label: string; description: string }>;
};

export const getGuideCopy = (length: WordLength) => {
  const lengthLabel = formatLengthLabel(length);
  return {
    title: `Wordle Anleitung ${lengthLabel} | Wortchamp`,
    description: `Strategien und Startwörter für Wordle Deutsch mit ${lengthLabel}.`,
    keywords: [
      `wordle anleitung ${lengthLabel}`,
      `wordle deutsch ${lengthLabel}`,
      `wordle tipps ${lengthLabel}`,
      `wordle hilfe ${lengthLabel}`,
    ],
    heading: `Wordle Anleitung für ${lengthLabel}`,
    subheading: `Klare Strategien, Startwörter und Endspiel-Tipps für ${lengthLabel}.`,
  };
};

export const getLengthGuideContent = (length: WordLength): LengthGuideContent => {
  const lengthLabel = formatLengthLabel(length);
  const finderPath = getFinderPath(length);
  const gamePath = getGamePath(length, "plain");
  const openingGroups = getCombinedStarterWordGroups(length);

  return {
    title: `Strategie-Guide für ${lengthLabel}`,
    description: `So meisterst du Wordle Deutsch mit ${lengthLabel}: Start, Analyse und Endspiel.`,
    openingTitle: `Startwörter für ${lengthLabel}`,
    openingIntro:
      "Nutze feste Starter-Sets als klaren Ablauf: zuerst Abdeckung, dann Musterprüfung, danach gezielte Positionslösung.",
    openingGroups,
    sections: [
      {
        title: "Muster erkennen",
        paragraphs: [
          `Mit ${lengthLabel} gewinnst du vor allem über Musterarbeit: Endungen, Präfixe, feste Positionen und Doppelbuchstaben.`,
          "Sobald 2-3 Buchstaben sicher sind, wechselst du vom Vollscan in konkrete Wortstrukturen.",
        ],
        bullets: [
          "Wenn Vokale knapp sind, prüfe gezielt Wörter mit Doppelbuchstaben (NN, LL, SS, TT).",
          "Nutze gelbe Hinweise aktiv: derselbe Buchstabe an mehreren Positionen testen.",
          "Arbeite mit typischen Mustern wie -EN, -ER, GE-, VER- und häufigen Endungen je Wortlänge.",
        ],
      },
      {
        title: "Umlaute und ß",
        paragraphs: [
          "Im Umlaut-Modus gelten Ä, Ö und Ü als eigene Buchstaben. Deshalb ist ein gezielter Umlaut-Testzug oft sinnvoll.",
          "Das ß ist im DE/AT-Modus gültig; im CH-Modus wird es nicht verwendet.",
        ],
        bullets: [
          "Ohne Umlaute zählen Ä/Ö/Ü wie A/O/U.",
          "Mit Umlauten können Ä/Ö/Ü komplett andere Wortfamilien öffnen.",
        ],
      },
      {
        title: "Endspiel",
        paragraphs: [
          "Wenn nur noch ein oder zwei Felder offen sind, entscheidet sauberes Filtern die Runde.",
          `Nutze ${finderPath}, um Kandidaten nach Positionen und Ausschlüssen zu reduzieren und den letzten Versuch zu sichern.`,
        ],
        bullets: [
          "Erst Ausschlüsse setzen, dann Positionsfelder ergänzen.",
          "Bei mehreren Treffern zuerst Kandidaten mit den wahrscheinlichsten Endungen spielen.",
        ],
      },
    ],
    faq: [
      {
        question: "Wie viele Versuche habe ich?",
        answer: "Du hast 6 Versuche, um das Wort zu erraten.",
      },
      {
        question: "Gibt es einen Endlos-Modus?",
        answer: "Ja. Neben dem Tageswort kannst du unbegrenzt im Endlos-Modus spielen.",
      },
      {
        question: "Wie hilft die Wortsuche?",
        answer: "Sie filtert nach Positionen, Pflichtbuchstaben und Ausschlüssen – ideal im Endspiel.",
      },
      {
        question: "Wann sollte ich Doppelbuchstaben testen?",
        answer: "Sobald nach 2-3 Zügen nur wenige Vokale oder nur noch wenige offene Slots übrig sind.",
      },
    ],
    links: [
      {
        href: gamePath,
        label: `Wordle ${lengthLabel} spielen`,
        description: "Direkt zum Spiel mit täglichem Wort und Endlos-Modus.",
      },
      {
        href: finderPath,
        label: `Wortsuche ${lengthLabel}`,
        description: "Filtere Wörter nach Positionen, Pflicht- und Ausschlussbuchstaben.",
      },
    ],
  };
};
