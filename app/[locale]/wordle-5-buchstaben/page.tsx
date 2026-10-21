import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
import { createMetadata } from "@/lib/seo";

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
    index: false,
    follow: false,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const destination = locale === "de" ? "/" : `/${locale}`;
  permanentRedirect(destination);
}
