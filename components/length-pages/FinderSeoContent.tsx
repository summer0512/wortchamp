import Link from "next/link";
import type { FinderSeoContent, LengthPageStats } from "@/lib/length-seo-content";
import type { WordLength } from "@/constants/wordlist-metadata";
import { getGamePath } from "@/lib/length-pages";

type FinderSeoContentProps = {
  content: FinderSeoContent;
  stats: LengthPageStats;
  length: WordLength;
};

const numberFormatter = new Intl.NumberFormat("de-DE");

export function FinderSeoContentSection({ content, stats, length }: FinderSeoContentProps) {
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

  const lengthLabel = `${length} Buchstaben`;

  return (
    <section className="space-y-10 rounded-3xl border border-muted bg-background/60 p-8 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          So nutzt du die Wortsuche für {lengthLabel}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">{content.intro}</p>
        <p className="text-sm text-muted-foreground">{content.helper}</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-primary-green/30 bg-primary-green/5 p-4 text-center text-sm text-muted-foreground sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary-green/80">Offizielle Antworten</p>
          <p className="text-lg font-semibold text-primary-green/90">{numberFormatter.format(stats.answers)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary-green/80">Gesamttreffer</p>
          <p className="text-lg font-semibold text-primary-green/90">{numberFormatter.format(stats.unique)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary-green/80">Zusatzwörter</p>
          <p className="text-lg font-semibold text-primary-green/90">{numberFormatter.format(stats.allowed)}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
          Wichtigste Vorteile
        </p>
        <ul className="grid gap-3 md:grid-cols-3">
          {content.highlights.map((item) => (
            <li
              key={item}
              className="rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
            >
              {item}
            </li>
          ))}
        </ul>
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

      <div className="space-y-3 rounded-2xl border border-yellow-200/60 bg-yellow-50/70 p-6 text-sm leading-relaxed text-muted-foreground dark:border-yellow-900/40 dark:bg-yellow-950/30">
        <p className="text-base font-semibold text-yellow-700 dark:text-yellow-200">Schnellzugriffe</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={getGamePath(length, "plain")}
            className="inline-flex items-center rounded-full border border-primary-green px-4 py-1 font-semibold text-primary-green transition hover:bg-primary-green/10"
          >
            Spiel ohne Umlaute
          </Link>
          <Link
            href={getGamePath(length, "accented")}
            className="inline-flex items-center rounded-full border border-primary-green px-4 py-1 font-semibold text-primary-green transition hover:bg-primary-green/10"
          >
            Spiel mit Umlauten
          </Link>
          <Link
            href="/wordle-anleitung"
            className="inline-flex items-center rounded-full border border-primary-green px-4 py-1 font-semibold text-primary-green transition hover:bg-primary-green/10"
          >
            Komplettanleitung
          </Link>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </section>
  );
}
