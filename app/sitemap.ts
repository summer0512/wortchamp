import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { languages } from '@/i18n/config'
import { WORD_LENGTH_VARIANTS, getGameSlug, getFinderSlug, getGuideSlug } from '@/lib/length-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://wortchamp.com";
  const currentDate = new Date().toISOString()

  const getFileLastModified = (relativePath: string) => {
    try {
      return fs.statSync(path.join(process.cwd(), relativePath)).mtime.toISOString()
    } catch {
      return currentDate
    }
  }

  const guideLastModified = getFileLastModified('app/[locale]/wordle-anleitung/page.tsx')
  const aboutLastModified = getFileLastModified('app/[locale]/ueber-uns/page.tsx')
  const privacyLastModified = getFileLastModified('app/[locale]/datenschutz/page.tsx')
  const termsLastModified = getFileLastModified('app/[locale]/nutzungsbedingungen/page.tsx')

  const pages = [
    {
      url: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
      lastModified: currentDate,
    },
    {
      url: 'wordle-anleitung',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      lastModified: guideLastModified,
    },
    {
      url: 'datenschutz',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
      lastModified: privacyLastModified,
    },
    {
      url: 'ueber-uns',
      priority: 0.4,
      changeFrequency: 'yearly' as const,
      lastModified: aboutLastModified,
    },
    {
      url: 'nutzungsbedingungen',
      priority: 0.3,
      changeFrequency: 'yearly' as const,
      lastModified: termsLastModified,
    },
  ] as Array<{
    url: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    lastModified?: string;
  }>;

  WORD_LENGTH_VARIANTS.forEach((length) => {
    pages.push({
      url: getGameSlug(length),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
      lastModified: currentDate,
    });
    pages.push({
      url: getGameSlug(length, 'accented'),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
      lastModified: currentDate,
    });
    pages.push({
      url: getFinderSlug(length),
      priority: 0.7,
      changeFrequency: 'weekly' as const,
      lastModified: currentDate,
    });
    pages.push({
      url: getGuideSlug(length),
      priority: 0.65,
      changeFrequency: 'monthly' as const,
      lastModified: currentDate,
    });
  });

  const sitemap: MetadataRoute.Sitemap = []

  pages.forEach((page) => {
    languages.forEach((language) => {
      let url: string

      if (page.url === '') {
        if (language.value === 'de') {
          url = baseUrl
        } else {
          url = `${baseUrl}/${language.value}`
        }
      } else {
        if (language.value === 'de') {
          url = `${baseUrl}/${page.url}`
        } else {
          url = `${baseUrl}/${language.value}/${page.url}`
        }
      }

      sitemap.push({
        url,
        lastModified: page.lastModified ?? currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    })
  })

  return sitemap
}
