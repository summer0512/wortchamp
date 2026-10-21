"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wortchamp-dismiss-install";
const DISMISS_DURATION_DAYS = 7;

const getDismissUntil = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? Number(raw) : 0;
};

const setDismissUntil = (timestamp: number) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, String(timestamp));
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        // In development, ensure stale SW/caches do not interfere with HMR and routing.
        void navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            void registration.unregister();
          });
        });
        if ("caches" in window) {
          void caches.keys().then((keys) => {
            keys.forEach((key) => {
              void caches.delete(key);
            });
          });
        }
        return;
      }

      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          /* noop */
        });
    }

    const dismissUntil = getDismissUntil();
    const now = Date.now();
    if (dismissUntil > now) {
      return;
    }

    const handler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPrompt = event;
      setIsSupported(true);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") {
      setIsVisible(false);
      setDismissUntil(Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissUntil(Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);
  };

  if (!isVisible || !isSupported) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:w-80">
      <div className="rounded-2xl border border-primary-green/30 bg-white/95 p-4 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <p className="text-sm font-semibold text-gray-900">Wortchamp zum Startbildschirm hinzufügen</p>
        <p className="mt-1 text-xs text-gray-600">
          Greife wie in einer App auf das Tageswort, den Endlos-Modus und eigene Challenges zu.
        </p>
        <div className="mt-3 flex items-center justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
          >
            Jetzt nicht
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-full bg-primary-green px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-green/80"
          >
            Installieren
          </button>
        </div>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
