"use client";

import { useCallback, useRef } from "react";
import { canLoadProductionScripts, POPUNDER_SCRIPT_SRC, SITE_SCRIPTS } from "@/lib/site-scripts";

const ROUNDS_KEY = "wortchamp-popunder-completed-rounds";
const SESSION_KEY = "wortchamp-popunder-session-shown-count";
const LAST_SHOWN_KEY = "wortchamp-popunder-last-shown-at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function useAdsterraPopunder() {
  const pending = useRef<string | null>(null);
  const recorded = useRef(new Set<string>());
  const fallback = useRef<Record<string, number>>({});
  const read = useCallback((storage: "localStorage" | "sessionStorage", key: string) => {
    let value = fallback.current[key] ?? 0;
    try {
      const stored = Number(window[storage].getItem(key));
      if (Number.isFinite(stored) && stored >= 0) value = Math.max(value, stored);
    } catch { /* Storage may be unavailable; retain the in-memory count. */ }
    return value;
  }, []);
  const write = useCallback((storage: "localStorage" | "sessionStorage", key: string, value: number) => {
    fallback.current[key] = value;
    try { window[storage].setItem(key, String(value)); } catch { /* Optional storage. */ }
  }, []);
  const eligible = useCallback(() => {
    return read("localStorage", ROUNDS_KEY) >= 1 &&
      read("sessionStorage", SESSION_KEY) < 1 &&
      (read("localStorage", LAST_SHOWN_KEY) === 0 || Date.now() - read("localStorage", LAST_SHOWN_KEY) >= COOLDOWN_MS);
  }, [read]);

  const resetPendingPopunder = useCallback(() => { pending.current = null; }, []);
  const recordCompletedRound = useCallback((roundKey: string) => {
    if (!SITE_SCRIPTS.adsterraPopunder || !canLoadProductionScripts() || recorded.current.has(roundKey)) return;
    recorded.current.add(roundKey);
    write("localStorage", ROUNDS_KEY, read("localStorage", ROUNDS_KEY) + 1);
    pending.current = eligible() ? roundKey : null;
  }, [eligible, read, write]);

  const triggerPendingPopunder = useCallback(() => {
    if (!pending.current || !SITE_SCRIPTS.adsterraPopunder || !canLoadProductionScripts() || !eligible()) return;
    document.querySelector('script[data-adsterra-popunder="true"]')?.remove();
    const script = document.createElement("script");
    script.src = POPUNDER_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.setAttribute("data-adsterra-popunder", "true");
    document.body.appendChild(script);
    write("sessionStorage", SESSION_KEY, read("sessionStorage", SESSION_KEY) + 1);
    write("localStorage", LAST_SHOWN_KEY, Date.now());
    pending.current = null;
  }, [eligible, read, write]);

  return { recordCompletedRound, triggerPendingPopunder, resetPendingPopunder };
}
