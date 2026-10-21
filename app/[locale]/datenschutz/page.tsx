import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";

type SectionConfig = {
  key: string;
  paragraphs: number;
  listKey?: string;
  listLength?: number;
};

const sectionConfig: SectionConfig[] = [
  { key: "dataCollection", paragraphs: 2, listKey: "items", listLength: 4 },
  { key: "adsense", paragraphs: 2, listKey: "items", listLength: 3 },
  { key: "cookies", paragraphs: 2, listKey: "items", listLength: 3 },
  { key: "thirdParties", paragraphs: 2 },
  { key: "rights", paragraphs: 1, listKey: "items", listLength: 6 },
  { key: "security", paragraphs: 2 },
  { key: "children", paragraphs: 1 },
  { key: "changes", paragraphs: 1 }
];

const hasListItems = (
  section: SectionConfig
): section is SectionConfig & { listKey: string; listLength: number } =>
  typeof section.listKey === "string" && typeof section.listLength === "number";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PrivacyPage" });

  return createMetadata({
    locale,
    pathname: "/datenschutz",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");
  const locale = useLocale();
  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "Wortchamp", path: "/" },
      { name: t("heading"), path: "/datenschutz" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-10 text-gray-800">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t("heading")}</h1>
          <p className="text-sm text-gray-500">{t("lastUpdated")}</p>
          <p className="text-base leading-7">{t("intro")}</p>
        </header>
        {sectionConfig.map((section) => (
          <section key={section.key} className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t(`sections.${section.key}.title`)}
            </h2>
            {Array.from({ length: section.paragraphs }).map((_, index) => (
              <p key={`${section.key}-paragraph-${index}`} className="text-base leading-7">
                {t(`sections.${section.key}.paragraphs.${index}`)}
              </p>
            ))}
            {hasListItems(section) ? (
              <ul className="list-disc pl-6 space-y-2 text-base leading-7">
                {Array.from({ length: section.listLength }).map((_, index) => (
                  <li key={`${section.key}-item-${index}`}>
                    {t(`sections.${section.key}.${section.listKey}.${index}`)}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("contact.title")}
          </h2>
          <p className="text-base leading-7">{t("contact.description")}</p>
          <p className="text-base leading-7">
            <span className="font-semibold">{t("contact.emailLabel")} </span>
            <a className="text-primary-green hover:underline" href={`mailto:${t("contact.email")}`}>
              {t("contact.email")}
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
