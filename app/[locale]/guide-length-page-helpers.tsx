import type { Metadata } from "next";
import Link from "next/link";
import type { WordLength } from "@/constants/wordlist-metadata";
import { createMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { getGuideCopy, getLengthGuideContent } from "@/lib/length-guide-content";
import { getGuidePath } from "@/lib/length-pages";
import { LengthGuideContentSection } from "@/components/length-pages/LengthGuideContent";
import Footer from "@/components/footer";

type GuidePageConfig = {
  wordLength: WordLength;
};

export const makeGuideMetadata =
  ({ wordLength }: GuidePageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const copy = getGuideCopy(wordLength);
    const pathname = getGuidePath(wordLength);

    return createMetadata({
      locale,
      pathname,
      title: copy.title,
      description: copy.description,
      keywords: copy.keywords,
    });
  };

export const makeGuidePage =
  ({ wordLength }: GuidePageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const pathname = getGuidePath(wordLength);
    const copy = getGuideCopy(wordLength);
    const guideContent = getLengthGuideContent(wordLength);

    const breadcrumb = createBreadcrumbStructuredData({
      locale,
      items: [
        { name: "Wortchamp", path: "/" },
        { name: "Wordle-Anleitung", path: "/wordle-anleitung" },
        { name: copy.heading, path: pathname },
      ],
    });

    return (
      <>
        <div className="mx-auto w-full max-w-5xl space-y-10 py-10">
          <header className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-wide text-primary-green">
              Anleitung für {wordLength} Buchstaben
            </p>
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">{copy.heading}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{copy.subheading}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/wordle-anleitung"
                className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
              >
                Zur Übersicht
              </Link>
              <Link
                href={pathname}
                className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
              >
                Anleitung teilen
              </Link>
            </div>
          </header>

          <LengthGuideContentSection content={guideContent} />
        </div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      </>
    );
  };
