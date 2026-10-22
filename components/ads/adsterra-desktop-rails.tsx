"use client";

import { usePathname } from "next/navigation";
import { useMediaQuery, useProductionSite } from "@/hooks/use-site-runtime";
import { isGameOrFinderPath } from "@/lib/ad-routes";
import { BANNER_UNITS, DESKTOP_RAIL_QUERY, SITE_SCRIPTS } from "@/lib/site-scripts";

function Banner({ placement, production }: { placement: keyof typeof BANNER_UNITS; production: boolean }) {
  const unit = BANNER_UNITS[placement];
  // Isolate parser-inserted scripts and each banner's atOptions global.
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>atOptions=${JSON.stringify({ ...unit, format: "iframe", params: {} })};</script><script src="https://bicea.org/22/${unit.key}"></script></body></html>`;
  return <aside aria-label="Werbung" data-ad-placement={placement} style={{ width: unit.width }}>
    {production ? <iframe title={`Werbung ${unit.width}×${unit.height}`} width={unit.width} height={unit.height} srcDoc={srcDoc}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms" referrerPolicy="strict-origin-when-cross-origin" className="block border-0" /> :
      <div data-ad-placeholder style={{ width: unit.width, height: unit.height }} className="flex items-center justify-center rounded border border-dashed bg-muted text-xs text-muted-foreground">Werbung · {unit.width}×{unit.height}</div>}
  </aside>;
}

export function AdsterraDesktopRails() {
  const production = useProductionSite();
  const desktop = useMediaQuery(DESKTOP_RAIL_QUERY);
  const pathname = usePathname();
  if (!SITE_SCRIPTS.adsterraBanners || !desktop || !isGameOrFinderPath(pathname ?? "/")) return null;

  return <div className="pointer-events-none fixed inset-x-0 top-[20px] z-10 print:hidden">
    <div className="pointer-events-auto absolute right-[calc(50%+532px)] top-0"><Banner placement="left" production={production} /></div>
    <div className="pointer-events-auto absolute left-[calc(50%+532px)] top-0"><Banner placement="right" production={production} /></div>
  </div>;
}
