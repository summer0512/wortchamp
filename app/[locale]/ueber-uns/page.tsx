import type { Metadata } from "next";
import { useLocale } from "next-intl";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createMetadata({
    locale,
    pathname: "/ueber-uns",
    title: "Über uns | Wortchamp",
    description: "Lerne das Team hinter Wortchamp kennen und warum es diese Wordle-Deutsch-Seite gibt.",
    keywords: "über uns, wortchamp, wordle deutsch",
  });
}

export default function AboutPage() {
  const locale = useLocale();
  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "Wortchamp", path: "/" },
      { name: "Über uns", path: "/ueber-uns" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-10 text-gray-800">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-green">Wortchamp</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Über uns</h1>
          <p className="text-base leading-7">
            Hinter Wortchamp steht ein unabhängiger Entwickler, der Wordle liebt und eine saubere,
            hilfreiche deutsche Version bauen wollte – mit Wortsuche, Tipps und klaren Modi.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Warum es Wortchamp gibt</h2>
          <p className="text-base leading-7">
            Ziel war ein Wordle auf Deutsch, das sich gut anfühlt: tägliches Wort, Endlos-Modus,
            klare Wortsuche und Guides, die wirklich weiterhelfen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Wortliste & Quellen</h2>
          <p className="text-base leading-7">
            Unsere Wortlisten basieren auf Wiktionary-Daten. Wir filtern sie automatisch, um extrem
            seltene oder ungeeignete Einträge zu entfernen und eine faire Spielbarkeit zu sichern.
          </p>
          <p className="text-base leading-7">
            Die Listen werden regelmäßig aktualisiert und dienen sowohl dem Spiel als auch der Wortsuche.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Kontakt</h2>
          <p className="text-base leading-7">
            Feedback, Vorschläge oder Fehlerhinweise? Schreib gern direkt.
          </p>
          <p className="text-base leading-7">
            <span className="font-semibold">E-Mail: </span>
            <a className="text-primary-green hover:underline" href="mailto:hallo@wortchamp.com">
              hallo@wortchamp.com
            </a>
          </p>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbStructuredDataJson }}
      />
    </div>
  );
}
