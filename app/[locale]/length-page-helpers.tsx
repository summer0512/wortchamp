import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import type { WordLength } from "@/constants/wordlist-metadata";
import { getGameCopy, getGamePath, getFinderPath } from "@/lib/length-pages";
import { getGameSeoContent } from "@/lib/length-seo-content";
import { GameSeoContentSection } from "@/components/length-pages/GameSeoContent";
import Game from "@/components/game";
import { GameBrowserEntry } from "@/components/game-browser-entry";
import Footer from "@/components/footer";
import type { AccentMode } from "@/lib/words";
import { DEFAULT_ACCENT_MODE } from "@/lib/words";
import { getGamePageData } from "@/lib/wordlists.server";
import { REGION_COOKIE_KEY, resolveRegionFromRequest } from "@/lib/region";

const numberFormatter = new Intl.NumberFormat("de-DE");

const formatNumber = (value: number) => numberFormatter.format(value);

type LengthGameConfig = {
  wordLength: WordLength;
  accentMode?: AccentMode;
};

export const makeLengthGameMetadata =
  ({ wordLength, accentMode = DEFAULT_ACCENT_MODE }: LengthGameConfig) =>
    async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
      const { locale } = await params;
      const copy = getGameCopy(wordLength, accentMode);
      const pathname = getGamePath(wordLength, accentMode);

      return createMetadata({
        locale,
        pathname,
        title: copy.title,
        description: copy.description,
        keywords: copy.keywords,
      });
    };

export const makeLengthGamePage =
  ({ wordLength, accentMode = DEFAULT_ACCENT_MODE }: LengthGameConfig) =>
    async ({ params }: { params: Promise<{ locale: string }> }) => {
      const { locale } = await params;
      const cookieStore = await cookies();
      const headerStore = await headers();
      const copy = getGameCopy(wordLength, accentMode);
      const pathname = getGamePath(wordLength, accentMode);
      const finderPath = getFinderPath(wordLength);
      const regionMode = resolveRegionFromRequest({
        cookieValue: cookieStore.get(REGION_COOKIE_KEY)?.value,
        acceptLanguage: headerStore.get("accept-language"),
      });
      const { wordListData, stats, dailySolution, requiresBrowserBundle } = await getGamePageData(
        wordLength,
        regionMode,
        accentMode,
      );
      const gameKey = `${wordLength}-${accentMode}-${regionMode}`;
      const seoContent = getGameSeoContent(wordLength, accentMode, stats, formatNumber);

      if (!requiresBrowserBundle && !wordListData) {
        throw new Error(`Die Wortliste für ${wordLength} Buchstaben konnte nicht geladen werden.`);
      }

      const breadcrumb = createBreadcrumbStructuredData({
        locale,
        items: [
          { name: "Wortchamp", path: "/" },
          { name: copy.heading, path: pathname },
        ],
      });

      return (
        <>
          <div className="mx-auto w-full max-w-5xl space-y-10">
            <section className="bg-white/80 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
              {requiresBrowserBundle ? (
                <GameBrowserEntry
                  key={gameKey}
                  wordLength={wordLength}
                  initialAccentMode={accentMode}
                  initialRegionMode={regionMode}
                  initialDailySolution={dailySolution}
                />
              ) : (
                <Game
                  key={gameKey}
                  initialWordLength={wordLength}
                  initialAccentMode={accentMode}
                  initialRegionMode={regionMode}
                  wordListData={wordListData!}
                  initialDailySolution={dailySolution}
                />
              )}
            </section>
            <div className="space-y-4 text-center">
              <p className="text-xs uppercase tracking-wide text-primary-green">
                Wordle mit {wordLength} Buchstaben {accentMode === "accented" ? "mit Umlauten" : "ohne Umlaute"}
              </p>
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">{copy.heading}</h1>
              <p className="text-base text-muted-foreground sm:text-lg">{copy.subheading}</p>
              <div className="mt-4">
                <Link
                  href={finderPath}
                  className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
                >
                  Wortsuche für {wordLength} Buchstaben öffnen
                </Link>
              </div>
            </div>
            <GameSeoContentSection content={seoContent} stats={stats} length={wordLength} accentMode={accentMode} />
          </div>
          <Footer />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        </>
      );
    };
