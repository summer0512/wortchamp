import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
import { languages } from '@/i18n/config';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: languages.map((language) => language.value),
 
  // Used when no locale matches
  defaultLocale: 'de',

  localePrefix: 'as-needed',
});
 
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
