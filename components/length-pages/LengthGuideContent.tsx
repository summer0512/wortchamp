import Link from "next/link";
import type { LengthGuideContent } from "@/lib/length-guide-content";

type LengthGuideContentProps = {
  content: LengthGuideContent;
};

export function LengthGuideContentSection({ content }: LengthGuideContentProps) {
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

  return (
    <section className="space-y-10 rounded-3xl border border-muted bg-background/60 p-8 shadow-sm">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{content.title}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{content.description}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-primary-green/30 bg-primary-green/5 p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-primary-green">{content.openingTitle}</h3>
          <p className="text-sm text-muted-foreground">{content.openingIntro}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {content.openingGroups.map((group) => (
            <div key={group.title} className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm dark:bg-white/10">
              <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.words.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-primary-green/30 bg-primary-green/10 px-3 py-1 text-xs font-semibold text-primary-green"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{group.description}</p>
            </div>
          ))}
        </div>
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
        <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-200">Nützliche Links</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {content.links.map((item) => (
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
