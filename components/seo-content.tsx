"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Cell } from "./grid/Cell";
import { useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import { getLengthLandingEntries } from "@/lib/length-pages";
import { DEFAULT_SETTINGS } from "@/lib/words";
import { CreateGameModal } from "./modals/CreateGameModal";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import type { CharStatus } from "@/lib/statuses";

type FeatureHighlight = {
  title: string;
  description: string;
  keyword: string;
};

type ExampleRow = {
  word: string;
  statuses?: CharStatus[];
};

const baseExampleRows: ExampleRow[] = [
  { word: "STEIN", statuses: ["absent", "absent", "absent", "absent", "correct"] },
  { word: "BLUME", statuses: ["correct", "present", "absent", "absent", "absent"] },
  { word: "KLANG", statuses: ["correct", "correct", "correct", "absent", "correct"] },
  { word: "WORTE", statuses: ["correct", "correct", "correct", "correct", "correct"] },
];

const exampleBoardsByStep: { caption: string; rows: ExampleRow[] }[] = [
  { caption: "Erster Versuch", rows: [{ word: "STEIN" }] },
  { caption: "Hinweise lesen", rows: baseExampleRows.slice(0, 2) },
  { caption: "Möglichkeiten eingrenzen", rows: baseExampleRows.slice(0, 3) },
  { caption: "Gelöst!", rows: baseExampleRows },
];

export default function SEOContent() {
  const t = useTranslations("HomePage");
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const rawHighlights = t.raw('gameIntro.featureHighlights');
  const featureHighlights = Array.isArray(rawHighlights) ? (rawHighlights as FeatureHighlight[]) : [];
  const lengthEntries = useMemo(() => getLengthLandingEntries(), []);

  const rawFaq = t.raw('faq.questions');
  const faqEntries = Array.isArray(rawFaq) ? (rawFaq as { question: string; answer: string }[]) : [];
  const faqSchema = faqEntries.length
    ? {
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }
    : null;

  const rawSteps = t.raw('howToPlay.steps');
  const howToEntries = Array.isArray(rawSteps)
    ? (rawSteps as { title: string; description: string }[])
    : [];
  const howToSchema = howToEntries.length
    ? {
      '@type': 'HowTo',
      name: t('howToPlay.title'),
      description: t('howToPlay.subtitle'),
      step: howToEntries.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
    }
    : null;

  const structuredData = faqSchema || howToSchema
    ? {
      '@context': 'https://schema.org',
      '@graph': [faqSchema, howToSchema].filter(Boolean),
    }
    : null;

  return (
    <div className="w-full space-y-8">
      
      {/* Game Introduction Section */}
      <section className="text-center bg-[#ecf0e2] relative py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            {t("h1")}
          </h1>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              {t("gameIntro.title")}
            </h2>
            <p className="text-gray-700 mb-2 leading-relaxed max-w-2xl mx-auto">
              {t("gameIntro.description")}
            </p>
          </div>

          {featureHighlights.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/60 bg-white/80 p-6 text-left shadow-sm transition hover:border-primary-green/50 hover:shadow"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary-green">
                    {feature.keyword}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-800">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/wordle-anleitung"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-green/80"
          >
            Zur Wordle-Anleitung
          </Link>
        </div>


      </section>

      <div className="max-w-5xl mx-auto">
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lengthEntries.map(({ length, gamePath, accentedGamePath, finderPath }) => (
            <div
              key={length}
              className="flex flex-col justify-center items-center rounded-2xl border border-white/70 bg-gray-50 p-4 text-left shadow-sm transition hover:border-primary-green/40"
            >
              <p className="text-sm font-semibold text-gray-700">
                Wörter mit {length} Buchstaben
              </p>
              <div className="flex-col mt-3 flex flex-wrap gap-2 justify-center">
                <Link
                  href={gamePath}
                  className="w-40 inline-flex justify-center items-center rounded-full bg-primary-green px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary-green/80"
                >
                  Spiel ohne Umlaute
                </Link>
                <Link
                  href={accentedGamePath}
                  className="w-40 inline-flex justify-center items-center rounded-full border border-primary-green px-3 py-1 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
                >
                  Spiel mit Umlauten
                </Link>
                <Link
                  href={finderPath}
                  className="w-40 inline-flex justify-center items-center rounded-full border border-primary-green px-3 py-1 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
                >
                  Wortsuche
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Challenge Section */}
      <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            ✨ Erstelle deine eigene Challenge
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fordere Freunde mit einem eigenen Wort heraus und teile den Link.
          </p>
        </div>
      </section>

      {/* Additional SEO Content */}
      <section className="bg-yellow-50 p-8 md:p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Spiele Wortchamp jetzt – gratis & unbegrenzt!
        </h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
          Starte mit dem Wort des Tages und trainiere im Endlos-Modus. Wordle Deutsch findest du auf Wortchamp.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm mb-6">
          <h2 className="bg-yellow-200 text-yellow-600 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">Wortchamp</h2>
          <h2 className="bg-yellow-200 text-yellow-600 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            Wort des Tages
          </h2>
          <h2 className="bg-yellow-200 text-yellow-600 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            Endlos-Modus
          </h2>
          <h2 className="bg-yellow-200 text-yellow-600 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            Wordle Deutsch
          </h2>
        </div>
          <Link
            href="/"
            className="inline-block bg-primary-green text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Jetzt spielen
          </Link>
      </section>

      {/* How to Play Section */}
      <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t("howToPlay.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("howToPlay.subtitle")}
          </p>
        </div>

        <div className="relative mb-10">

          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="relative bg-white py-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="items-center text-center mb-3">
                  <div className="mx-auto w-10 h-10 bg-primary-green text-white rounded-full flex items-center justify-center font-bold text-lg z-10 relative">
                    {t(`howToPlay.steps.${i}.number`)}
                  </div>
                </div>

                <div className="pl-8 ml-auto text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t(`howToPlay.steps.${i}.title`)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-4">
                    {i === 1
                      ? t(`howToPlay.steps.${i}.description`).split(' | ').join('\n')
                      : t(`howToPlay.steps.${i}.description`)
                    }
                  </p>

                  <div className="flex justify-center">
                    <div className="space-y-2">
                      {exampleBoardsByStep[i]?.rows.map((row, rowIndex) => (
                        <div key={`${row.word}-${rowIndex}`} className="flex justify-center">
                          {row.word.split('').map((letter, letterIndex) => (
                            <Cell
                              key={`${row.word}-${rowIndex}-${letterIndex}`}
                              value={letter}
                              status={row.statuses?.[letterIndex]}
                            />
                          ))}
                        </div>
                      ))}
                      {exampleBoardsByStep[i]?.caption && (
                        <p className="text-sm text-gray-600 text-center">
                          {exampleBoardsByStep[i]?.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r bg-yellow-50 rounded-xl p-6 border border-yellow-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            {t("howToPlay.tips.title")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg"
              >
                <span className="text-yellow-600 font-bold text-lg">💡</span>
                <span className="text-gray-700 text-sm leading-relaxed">
                  {t(`howToPlay.tips.list.${i}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#ecf0e2] p-8 md:p-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {t("faq.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("faq.subtitle")}
            </p>
          </div>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  ?
                </span>
                {t(`faq.questions.${i}.question`)}
              </h3>
              <p className="text-gray-700 leading-relaxed ml-9">
                {t(`faq.questions.${i}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto p-8">
        <div className="space-y-6 text-left md:text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Ressourcen für Wordle Deutsch
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Kombiniere Tageswort, Endlos-Modus, Challenges und Statistiken, um besser zu werden.
          </p>
          <ul className="grid gap-4 md:grid-cols-2 text-sm leading-relaxed text-gray-700">
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-green block mb-1">Tageswort synchron</span>
              Jeden Tag um 00:00 Uhr ein offizielles Wort – inklusive Verlauf in den Statistiken.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-green block mb-1">Endlos-Modus</span>
              Unbegrenztes Training mit zufälligen Wörtern – perfekt zum Üben.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-green block mb-1">Eigene Challenges</span>
              Erstelle ein Geheimwort und teile den Link mit Freunden.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-green block mb-1">Transparenz & Datenschutz</span>
              Lies unsere Nutzungsbedingungen und Datenschutzhinweise für sichere Spiele.
            </li>
          </ul>
        </div>
      </section>

      {/* Create Game Modal */}
      <CreateGameModal
        isOpen={isCreateGameModalOpen}
        handleClose={() => setIsCreateGameModalOpen(false)}
        settings={DEFAULT_SETTINGS}
      />

      <PWAInstallPrompt />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </div>
  );
}







