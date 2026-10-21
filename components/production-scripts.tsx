"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useMediaQuery, useProductionSite } from "@/hooks/use-site-runtime";
import { isGameOrFinderPath } from "@/lib/ad-routes";
import { MOBILE_MEDIA_QUERY, SITE_SCRIPTS, SOCIALBAR_SCRIPT_SRC } from "@/lib/site-scripts";

export function ProductionScripts() {
  const production = useProductionSite();
  const mobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const pathname = usePathname();
  if (!production) return null;

  return <>
    {SITE_SCRIPTS.adsterraSocialBar && !(mobile && isGameOrFinderPath(pathname ?? "/")) ?
      <Script id="adsterra-socialbar" data-cfasync="false" strategy="afterInteractive" src={SOCIALBAR_SCRIPT_SRC} /> : null}
    {SITE_SCRIPTS.googleAnalytics ? <>
      <Script strategy="lazyOnload" src="https://www.googletagmanager.com/gtag/js?id=G-1NDFB4ERNK" />
      <Script id="google-analytics" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-1NDFB4ERNK');
      ` }} />
    </> : null}
  </>;
}
