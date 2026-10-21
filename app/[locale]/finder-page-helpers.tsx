import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import type { WordLength } from "@/constants/wordlist-metadata";
import { createMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { getFinderCopy, getFinderPath } from "@/lib/length-pages";
import { FinderSeoContentSection } from "@/components/length-pages/FinderSeoContent";
import WordFinderClient from "@/app/[locale]/wordle-hilfe/word-finder-client";
import Footer from "@/components/footer";
import { getFinderSeoContent } from "@/lib/length-seo-content";
import { FINDER_PREVIEW_LIMIT, getFinderPreviewData } from "@/lib/wordlists.server";
import { REGION_COOKIE_KEY, resolveRegionFromRequest } from "@/lib/region";

const numberFormatter = new Intl.NumberFormat("de-DE");
const formatNumber = (value: number) => numberFormatter.format(value);

type FinderPageConfig = {
  wordLength: WordLength;
};

export const makeFinderMetadata =
  ({ wordLength }: FinderPageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const cookieStore = await cookies();
    const headerStore = await headers();
    const regionMode = resolveRegionFromRequest({
      cookieValue: cookieStore.get(REGION_COOKIE_KEY)?.value,
      acceptLanguage: headerStore.get("accept-language"),
    });
    const { stats } = await getFinderPreviewData(wordLength, regionMode);
    const copy = getFinderCopy(wordLength, stats.unique);
    const pathname = getFinderPath(wordLength);

    return createMetadata({
      locale,
      pathname,
      title: copy.title,
      description: copy.description,
      keywords: copy.keywords,
    });
  };

export const makeFinderPage =
  ({ wordLength }: FinderPageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const cookieStore = await cookies();
    const headerStore = await headers();
    const regionMode = resolveRegionFromRequest({
      cookieValue: cookieStore.get(REGION_COOKIE_KEY)?.value,
      acceptLanguage: headerStore.get("accept-language"),
    });
    const pathname = getFinderPath(wordLength);
    const { preview, stats } = await getFinderPreviewData(wordLength, regionMode);
    const copy = getFinderCopy(wordLength, stats.unique);
    const seoContent = getFinderSeoContent(wordLength, "accented", stats, formatNumber);

    const breadcrumb = createBreadcrumbStructuredData({
      locale,
      items: [
        { name: "Wortchamp", path: "/" },
        { name: copy.heading, path: pathname },
      ],
    });

    return (
      <>
        <div className="mx-auto w-full max-w-5xl space-y-10 py-5">
          <WordFinderClient
            wordLength={wordLength}
            initialWords={preview}
            initialTotalMatches={stats.unique}
            resultsPageSize={FINDER_PREVIEW_LIMIT}
            initialRegionMode={regionMode}
            heroTitle={copy.heading}
            heroSubtitle={copy.subheading}
            heroHelper={`Wörter mit ${wordLength} Buchstaben mit und ohne Umlaute.`}
          />

          <FinderSeoContentSection content={seoContent} stats={stats} length={wordLength} />
        </div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      </>
    );
  };
