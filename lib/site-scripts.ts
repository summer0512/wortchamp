export const PRODUCTION_HOSTNAME = "wortchamp.com";

export const SITE_SCRIPTS = {
  googleAnalytics: true,
  adsterraBanners: true,
  adsterraSocialBar: true,
  adsterraPopunder: true,
};

export const DESKTOP_RAIL_QUERY = "(min-width: 1440px) and (hover: hover) and (pointer: fine)";
export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";
export const SOCIALBAR_SCRIPT_SRC = "https://bicea.org/14/fae3d288091b6519ab6de2ac150f8ea3";
export const POPUNDER_SCRIPT_SRC = "https://afders.org/1/ef50185eb75fcdba551001576d642844";
export const BANNER_UNITS = {
  left: { key: "740b851a9ae267d8375d8d38a9dbad1c", width: 160, height: 300 },
  right: { key: "1ecc1b42a6bc8c68727d0eb5277a6dde", width: 160, height: 600 },
} as const;

export function isProductionSite(environment: string | undefined, hostname: string) {
  return environment === "production" && hostname === PRODUCTION_HOSTNAME;
}

export function canLoadProductionScripts() {
  return typeof window !== "undefined" && isProductionSite(process.env.NODE_ENV, window.location.hostname);
}
