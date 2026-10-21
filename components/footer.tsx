'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { WORD_LENGTH_VARIANTS, getGuidePath } from '@/lib/length-pages';

export default function Footer() {
  const t = useTranslations('Footer');

  const partnerLinks = [
    // { name: 'Morse Code Kit', href: 'https://morsecodekit.com/', follow: true },
    // { name: 'PrintableGen', href: 'https://printablegen.com/', follow: true },
    // { name: 'Generate Org Chart', href: 'https://generateorgchart.com/', follow: true },
    // { name: 'Size Chart Kit', href: 'https://sizechartkit.com/', follow: true },
    // { name: 'Device Test Tools', href: 'https://devicetesttools.com/', follow: true },
    // { name: 'IBAN Tools', href: 'https://ibantools.net/', follow: true },
    // { name: 'Randlyx', href: 'https://randlyx.com/', follow: true },
    // { name: 'Subnautica Hub', href: 'https://subnauticahub.com/', follow: true },
    // { name: 'Test Score Hub', href: 'https://testscorehub.com/', follow: true },
    // { name: 'EasyPdfNow', href: 'https://easypdfnow.com/', follow: true },
    // { name: 'Solarpunk Hub', href: 'https://solarpunkhub.com/', follow: true },
    // { name: "GAG2Hub", href: "https://gag2hub.com/", follow: true },
    { name: 'SudokuAgora', href: 'https://sudokuagora.com/', follow: true },
    { name: 'SudokuDefi', href: 'https://sudokudefi.com/', follow: true },
  ];

  return (
    <footer className="border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">{t('copyright')}</p>
          <p className="text-gray-500 text-xs">{t('source')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/wordle-anleitung"
              className="text-green-600 hover:text-green-700 text-sm transition-colors"
            >
              {t('guide')}
            </Link>
            <Link
              href="/ueber-uns"
              className="text-green-600 hover:text-green-700 text-sm transition-colors"
            >
              {t('about')}
            </Link>
            <Link
              href="/datenschutz"
              className="text-green-600 hover:text-green-700 text-sm transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/nutzungsbedingungen"
              className="text-green-600 hover:text-green-700 text-sm transition-colors"
            >
              {t('terms')}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-gray-600">Empfohlene Links:</span>
            {partnerLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel={item.follow ? 'noopener noreferrer' : 'nofollow noopener noreferrer'}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            {WORD_LENGTH_VARIANTS.map((length) => (
              <Link
                key={length}
                href={getGuidePath(length)}
                className="rounded-full border border-gray-200 px-2 py-1 text-gray-600 transition-colors hover:border-green-500 hover:text-green-700"
              >
                Anleitung {length}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
