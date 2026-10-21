import type { WordLength } from "@/constants/wordlist-metadata";
import type { AccentMode } from "@/lib/words";

export type StarterWordGroup = {
  title: string;
  words: string[];
  description: string;
};

type StarterWordSetByMode = {
  plain: StarterWordGroup[];
  accented: StarterWordGroup[];
};

const STARTER_WORD_SETS: Record<WordLength, StarterWordSetByMode> = {
  3: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["EIN", "AUS", "TOR"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["DIE", "UND", "ICH"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["TAG", "LOS", "NUR"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["HAT", "WAR", "DEM"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["ÄRA", "ÖDE", "FÜR"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["NÄH", "TÜR", "ÜBT"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["KÜR", "HÖR", "RÄT"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["SÜD", "LÖS", "MÜD"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  4: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["ARIE", "LOST", "KERN"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["HAUS", "KIND", "RAND"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["DAME", "KALT", "BROT"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["ZEIT", "MUND", "FERN"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["MÜDE", "ÖLEN", "BÜRO"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["HÖRT", "FÜHR", "BÖSE"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["TÜRE", "GÄBE", "LÖWE"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["RÄTE", "KÜRE", "NÖTE"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  5: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["AUDIO", "STERN", "KLANG"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["ALIEN", "KARTE", "CHROM"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["RASTE", "KLEIN", "PATER"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["RAUTE", "AGNES", "FALTE"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["NÖTIG", "BÖGEN", "KÜSTE"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["HÖREN", "LÖSEN", "BLÖDE"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["RÄTEN", "STÖRE", "TRÄNE"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["TÜREN", "SÄGEN", "BÄREN"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  6: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["PINSEL", "SORGEN", "TRAUEN"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["RASTEN", "PUBLIK", "JEDOCH"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["KLAREN", "ORIENT", "ANDERS"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["MANIER", "LINEAR", "ALTERN"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["FÜHREN", "NÄHERT", "DOMÄNE"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["PRÄMIE", "BLÖCKE", "ÜBRIGE"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["RÜSTEN", "STÖREN", "TÄLERN"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["KÜRTEN", "KÖNIGE", "NÖTIGE"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  7: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["INSERAT", "GELOHNT", "KUBANER"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["MUSTERN", "DAMPFEN", "LOGBUCH"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["SANIERT", "HALTERN", "ANTRIEB"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["SPARTEN", "EINTRAG", "EINTRAF"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["ANTRÄGE", "DÄMPFEN", "MUSTERN"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["STÄRKEN", "HÄUFIGE", "AUSÜBEN"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["LÄSTERN", "BRÜSTEN", "STRÖMEN"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["RÄTSELN", "GEHÖRST", "FÜHREND"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  8: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["RHEINTAL", "AUSTOBEN", "GRAFIKEN"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["BRISANTE", "KAMPFLOS", "DUSCHGEL"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["KANISTER", "STRAHLEN", "INTEGRAL"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["RELATION", "TREUHAND", "RISKANTE"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["ÜBRIGENS", "EINRÄUMT", "AUFLÖSEN"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["ÖRTLICHE", "AUFWÄRTS", "TÄGLICHE"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["ANGEHÖRT", "EINFÜHRT", "NÄCHSTER"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["VERÖDUNG", "AMÜSIERT", "ABRÜSTEN"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  9: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["RANGLISTE", "BAUERNHOF", "REDAKTION"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["BRAUCHTEN", "MITFAHREN", "TERMINALS"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["SCHRIFTEN", "GRABSTEIN", "STRAHLEND"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["UNIVERSAL", "ENTSPRACH", "STREAMING"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["BRÄUCHTEN", "MÄCHTIGEN", "REDAKTION"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["TÄGLICHEN", "ÄRZTLICHE", "SCHÄDIGEN"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["STÄNDIGER", "AKTIONÄRE", "ÖRTLICHEN"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["AUFRÜSTEN", "PRÄSIDENT", "RÄUMLICHE"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  10: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["AUSRICHTEN", "GESAMTBILD", "HINTERKOPF"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["TRAGISCHEN", "BLUMENTOPF", "PRODUKTIVE"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["SICHTBAREN", "ORDENTLICH", "ORGANISCHE"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["BEFRISTUNG", "GRAFISCHEN", "HUNDERTMAL"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["NATÜRLICHE", "AUFWÄNDIGE", "VERHÄLTNIS"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["EINSCHLÄGT", "KÜNSTLICHE", "SCHWÄGERIN"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["HUMANITÄRE", "BÖSARTIGEN", "ZUKÜNFTIGE"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["NÜTZLICHER", "FRÄNKISCHE", "PERSÖNLICH"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
  11: {
    plain: [
      {
        title: "Set A: Praxis-Start",
        words: ["ERSTAUNLICH", "VERSTOPFUNG", "GRUNDBESITZ"],
        description: "Datenbasierter Start mit hoher Buchstabenfrequenz und breiter Vokalabdeckung.",
      },
      {
        title: "Set B: Alternative Sequenz",
        words: ["VOLKSPARTEI", "SCHIMPFWORT", "MECHATRONIK"],
        description: "Alternative mit hoher Frequenzabdeckung, falls Set A wenig klare Treffer liefert.",
      },
      {
        title: "Set C: Konsonanten-Scan",
        words: ["UNSICHTBARE", "PRAKTISCHEN", "ALGORITHMEN"],
        description: "Erweitert den Ausschluss um zusätzliche Konsonantenfelder mit hoher Trefferchance.",
      },
      {
        title: "Set D: Muster-Check",
        words: ["LANDGERICHT", "ROMANTISCHE", "ABZUSICHERN"],
        description: "Stabilisiert die Positionsarbeit über häufige Muster und Endungen.",
      },
    ],
    accented: [
      {
        title: "Set A: Umlaut-Fokus",
        words: ["NATÜRLICHES", "EMPFÄNGLICH", "ZURÜCKHOLEN"],
        description: "Datenbasierter Umlaut-Start mit hoher Abdeckung für häufige Buchstaben.",
      },
      {
        title: "Set B: Umlaut-Balance",
        words: ["ÜBERWACHUNG", "PFÄLZISCHEN", "PRODUKTIVEN"],
        description: "Alternative Umlaut-Sequenz mit Fokus auf Vokale und Kernkonsonanten.",
      },
      {
        title: "Set C: Umlaut + Konsonanten",
        words: ["ZUKÜNFTIGER", "VERMÄCHTNIS", "FÜRSTLICHEN"],
        description: "Hilft nach den ersten Hinweisen beim gezielten Prüfen weiterer Buchstabenfelder.",
      },
      {
        title: "Set D: Positions-Check",
        words: ["KÜNSTLICHER", "RÜCKZAHLUNG", "NORDÖSTLICH"],
        description: "Hilft, gelbe Hinweise konsequent in konkrete Positionen zu überführen.",
      },
    ],
  },
};

export const getStarterWordGroups = (
  length: WordLength,
  accentMode: AccentMode,
): StarterWordGroup[] => STARTER_WORD_SETS[length][accentMode === "accented" ? "accented" : "plain"];

export const getCombinedStarterWordGroups = (length: WordLength): StarterWordGroup[] => [
  ...STARTER_WORD_SETS[length].plain.map((group) => ({
    ...group,
    title: `Ohne Umlaute · ${group.title}`,
  })),
  ...STARTER_WORD_SETS[length].accented.map((group) => ({
    ...group,
    title: `Mit Umlauten · ${group.title}`,
  })),
];
