import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cookies, headers } from "next/headers";
import Game from "@/components/game";
import SEOContent from "@/components/seo-content";
import Footer from "@/components/footer";
import { createMetadata } from "@/lib/seo";
import { DEFAULT_ACCENT_MODE, DEFAULT_WORD_LENGTH } from "@/lib/words";
import { getGamePageData } from "@/lib/wordlists.server";
import { REGION_COOKIE_KEY, resolveRegionFromRequest } from "@/lib/region";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return createMetadata({
    locale,
    pathname: "/",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  });
}

export default async function Home() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const regionMode = resolveRegionFromRequest({
    cookieValue: cookieStore.get(REGION_COOKIE_KEY)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const { wordListData, dailySolution, requiresBrowserBundle } = await getGamePageData(
    DEFAULT_WORD_LENGTH,
    regionMode,
    DEFAULT_ACCENT_MODE,
  );
  const gameKey = `${DEFAULT_WORD_LENGTH}-${DEFAULT_ACCENT_MODE}-${regionMode}`;

  if (!wordListData || requiresBrowserBundle) {
    throw new Error("Die Standard-Wortliste konnte nicht geladen werden.");
  }

  return (
    <div>
      <main>
        <Game
          key={gameKey}
          wordListData={wordListData}
          initialDailySolution={dailySolution}
          initialRegionMode={regionMode}
        />
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
}
