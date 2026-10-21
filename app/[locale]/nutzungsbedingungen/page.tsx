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
  { key: "useOfService", paragraphs: 2 },
  { key: "userResponsibilities", paragraphs: 2, listKey: "items", listLength: 4 },
  { key: "accountAndData", paragraphs: 2 },
  { key: "adsense", paragraphs: 2, listKey: "items", listLength: 3 },
  { key: "intellectualProperty", paragraphs: 2 },
  { key: "acceptableUse", paragraphs: 1, listKey: "items", listLength: 5 },
  { key: "disclaimer", paragraphs: 2 },
  { key: "liability", paragraphs: 2 },
  { key: "thirdPartyLinks", paragraphs: 1 },
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
  const t = await getTranslations({ locale, namespace: "TermsPage" });

  return createMetadata({
    locale,
    pathname: "/nutzungsbedingungen",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default function TermsPage() {
  const t = useTranslations("TermsPage");
  const locale = useLocale();
  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "Wortchamp", path: "/" },
      { name: t("heading"), path: "/nutzungsbedingungen" },
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
          <p className="text-base leading-7">{t("acceptance")}</p>
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
