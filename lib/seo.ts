import type { Metadata } from "next";
import { languages } from "@/i18n/config";

const DEFAULT_SITE_URL = "https://wortchamp.com";
const DEFAULT_IMAGE_PATH = "/icon.png";
const SITE_NAME = "Wortchamp";
const SITE_DESCRIPTION =
  "Spiele Wortchamp, das Wordle auf Deutsch: tägliches Wort, Endlos-Modus, Wortsuche und Statistiken.";

const getSiteUrl = () => {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!env) {
    return DEFAULT_SITE_URL;
  }
  return env.endsWith("/") ? env.slice(0, -1) : env;
};

const toLocaleTag = (locale: string) => (locale === "de" ? "de-DE" : locale);

const normalizePathname = (pathname?: string) => {
  if (!pathname || pathname === "/" || pathname === "") {
    return "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
};

const buildLocalizedPath = (locale: string, pathname?: string) => {
  const normalized = normalizePathname(pathname);
  if (locale === "de") {
    return normalized;
  }
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
};

const buildLanguageAlternates = (pathname?: string) => {
  const baseUrl = getSiteUrl();
  const map: Record<string, string> = {};

  languages.forEach(({ value }) => {
    const localizedPath = buildLocalizedPath(value, pathname);
    const absoluteUrl = `${baseUrl}${localizedPath}`;
    map[value] = absoluteUrl;
    if (value === "de") {
      map["x-default"] = absoluteUrl;
    }
  });

  return map;
};

const toKeywordArray = (input?: string | string[]) => {
  if (!input) {
    return undefined;
  }
  if (Array.isArray(input)) {
    return input;
  }
  return input
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
};

export const createMetadata = ({
  locale,
  pathname,
  title,
  description,
  keywords,
  index = true,
  follow = true,
}: {
  locale: string;
  pathname?: string;
  title: string;
  description: string;
  keywords?: string | string[];
  index?: boolean;
  follow?: boolean;
}): Metadata => {
  const baseUrl = getSiteUrl();
  const localizedPath = buildLocalizedPath(locale, pathname);
  const canonicalUrl = `${baseUrl}${localizedPath}`;
  const alternates = buildLanguageAlternates(pathname);

  return {
    title,
    description,
    keywords: toKeywordArray(keywords),
    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: SITE_NAME,
      locale: toLocaleTag(locale),
      images: [
        {
          url: `${baseUrl}${DEFAULT_IMAGE_PATH}`,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}${DEFAULT_IMAGE_PATH}`],
    },
    robots: {
      index,
      follow,
    },
  };
};

export const createSiteStructuredData = (locale: string) => {
  const baseUrl = getSiteUrl();
  const inLanguage = toLocaleTag(locale);

  const website = {
    '@type': 'WebSite',
    '@id': `${baseUrl}#website`,
    url: baseUrl,
    name: SITE_NAME,
    inLanguage,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organization = {
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: SITE_NAME,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}${DEFAULT_IMAGE_PATH}`,
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [website, organization],
  };
};

export const createBreadcrumbStructuredData = ({
  locale,
  items,
}: {
  locale: string;
  items: Array<{ name: string; path?: string }>;
}) => {
  const baseUrl = getSiteUrl();

    const itemListElement = items.map((item, index) => {
        const relativePath = item.path ?? (index === 0 ? "/" : undefined);
        const localizedPath = relativePath ? buildLocalizedPath(locale, relativePath) : buildLocalizedPath(locale);
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${localizedPath}`,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
};
