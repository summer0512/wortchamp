import Link from "next/link";
import type { AccentMode } from "@/lib/words";
import type { WordLength } from "@/constants/wordlist-metadata";
import type { GameSeoContent, LengthPageStats } from "@/lib/length-seo-content";
import { getGuessStatuses, type CharStatus } from "@/lib/statuses";
import { DEFAULT_REGION_MODE } from "@/lib/region";

type GameSeoContentProps = {
  content: GameSeoContent;
  stats: LengthPageStats;
  length: WordLength;
  accentMode: AccentMode;
};

const numberFormatter = new Intl.NumberFormat("de-DE");

const formatStat = (value: number) => numberFormatter.format(value);

const getCellClasses = (status?: CharStatus) => {
  const base = "flex h-10 w-10 items-center justify-center rounded border-2 text-sm font-semibold";
  if (!status) {
    return `${base} border-slate-200 bg-white text-foreground`;
  }

  if (status === "correct") {
    return `${base} border-primary-green bg-primary-green text-white`;
  }

  if (status === "present") {
    return `${base} border-primary-yellow bg-primary-yellow text-white`;
  }

  return `${base} border-primary-gray bg-primary-gray text-white`;
};

export function GameSeoContentSection({ content, stats, length, accentMode }: GameSeoContentProps) {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map((item, index) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
      position: index + 1,
    })),
  };

  const exampleSettings = { wordLength: length, accentMode, regionMode: DEFAULT_REGION_MODE };
  const exampleRows = content.example.steps.map((step) => ({
    ...step,
    statuses: getGuessStatuses(step.word, content.example.solution, exampleSettings),
  }));

  return (
    <section className="space-y-10 rounded-3xl border border-muted bg-background/60 p-8 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Strategien für Wordle mit {length} Buchstaben {accentMode === "accented" ? "mit Umlauten" : "ohne Umlaute"}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">{content.intro}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-primary-green/30 bg-primary-green/5 p-4 text-center text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-primary-green/80">Antworten</p>
            <p className="text-lg font-semibold text-primary-green/90">{formatStat(stats.answers)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-primary-green/80">Erlaubt</p>
            <p className="text-lg font-semibold text-primary-green/90">{formatStat(stats.allowed)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-primary-green/80">Gesamt</p>
            <p className="text-lg font-semibold text-primary-green/90">{formatStat(stats.unique)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Schnelltipps</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {content.keyTakeaways.map((takeaway) => (
            <li key={takeaway} className="rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
              {takeaway}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 rounded-2xl border border-sky-200/60 bg-sky-50/70 p-6 dark:border-sky-900/40 dark:bg-sky-950/30">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-sky-700 dark:text-sky-200">{content.example.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{content.example.description}</p>
          <p className="text-xs text-muted-foreground">
            Beispiellösung: <span className="font-semibold text-foreground">{content.example.solution}</span>
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {exampleRows.map((row) => (
            <div key={row.word} className="rounded-xl border border-white/70 bg-white/80 p-4 text-center shadow-sm dark:bg-white/10">
              <div className="flex justify-center gap-1">
                {Array.from(row.word).map((letter, letterIndex) => (
                  <div key={`${row.word}-${letterIndex}`} className={getCellClasses(row.statuses?.[letterIndex])}>
                    {letter}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{row.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-indigo-200/60 bg-indigo-50/70 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-200">{content.guide.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{content.guide.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.guide.groups.map((group) => (
            <div key={group.title} className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm dark:bg-white/10">
              <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.words.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-indigo-200/70 bg-indigo-100/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-900/30 dark:text-indigo-100"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{group.description}</p>
            </div>
          ))}
        </div>
        {content.guide.note ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{content.guide.note}</p>
        ) : null}
      </div>

      <div className="space-y-10">
        {content.sections.map((section) => (
          <article key={section.title} className="space-y-4 rounded-2xl border border-muted-foreground/10 bg-card/70 p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 24)} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary-green/70" aria-hidden />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-yellow-200/60 bg-yellow-50/70 p-6 dark:border-yellow-900/40 dark:bg-yellow-950/30">
        <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-200">Empfohlene Links</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {content.relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-white/60 bg-white/80 p-4 text-sm leading-relaxed text-muted-foreground transition hover:border-primary-green/40 hover:text-foreground dark:bg-white/10"
            >
              <span className="block text-sm font-semibold text-primary-green">{item.label}</span>
              <span className="mt-1 block">{item.description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-muted-foreground/10 bg-card/70 p-6">
        <h3 className="text-xl font-semibold text-foreground">Häufige Fragen</h3>
        <div className="space-y-3">
          {content.faq.map((item, index) => (
            <details key={item.question} className="group rounded-xl border border-muted-foreground/20 bg-background p-4">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                <span className="mr-2 text-primary-green">{index + 1}.</span>
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </section>
  );
}
