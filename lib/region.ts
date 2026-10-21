export type RegionMode = "standard" | "ch";

export const DEFAULT_REGION_MODE: RegionMode = "standard";
export const REGION_STORAGE_KEY = "wortchamp-region-mode";
export const REGION_COOKIE_KEY = "wc_region";

export const isRegionMode = (value: unknown): value is RegionMode =>
  value === "standard" || value === "ch";

export const normalizeRegionMode = (value: unknown, fallback: RegionMode = DEFAULT_REGION_MODE) =>
  isRegionMode(value) ? value : fallback;

const REGION_LANGUAGE_PREFIXES = ["de-ch", "gsw-ch"];

export const detectRegionFromLanguages = (languages: readonly string[] | undefined): RegionMode | null => {
  if (!languages || languages.length === 0) {
    return null;
  }
  for (const raw of languages) {
    const normalized = raw.toLowerCase();
    if (REGION_LANGUAGE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
      return "ch";
    }
  }
  return null;
};

export const detectRegionFromAcceptLanguage = (headerValue: string | null | undefined): RegionMode | null => {
  if (!headerValue) {
    return null;
  }
  const languages = headerValue
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean);
  return detectRegionFromLanguages(languages);
};

export const detectRegionFromTimeZone = (timeZone: string | null | undefined): RegionMode | null => {
  if (!timeZone) {
    return null;
  }
  return timeZone === "Europe/Zurich" ? "ch" : null;
};

export const detectRegionFromClient = (): RegionMode => {
  if (typeof window === "undefined") {
    return DEFAULT_REGION_MODE;
  }

  const languageRegion = detectRegionFromLanguages(navigator.languages ?? [navigator.language]);
  if (languageRegion) {
    return languageRegion;
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneRegion = detectRegionFromTimeZone(timeZone);
  if (timeZoneRegion) {
    return timeZoneRegion;
  }

  return DEFAULT_REGION_MODE;
};

export const resolveRegionFromRequest = ({
  cookieValue,
  acceptLanguage,
}: {
  cookieValue?: string | null;
  acceptLanguage?: string | null;
}): RegionMode => {
  if (cookieValue) {
    return normalizeRegionMode(cookieValue);
  }
  const detected = detectRegionFromAcceptLanguage(acceptLanguage);
  return detected ?? DEFAULT_REGION_MODE;
};
