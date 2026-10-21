"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Game from "@/components/game";
import { GameLoadingPlaceholder } from "@/components/game-loading-placeholder";
import { Button } from "@/components/ui/button";
import { loadBrowserWordListBundle, toWordListData } from "@/lib/browser-wordlists";
import {
  registerWordList,
  type AccentMode,
  type WordLength,
  type WordListData,
  type RegionMode,
} from "@/lib/words";

type GameBrowserEntryProps = {
  wordLength: WordLength;
  initialDailySolution: string;
  initialAccentMode?: AccentMode;
  initialRegionMode?: RegionMode;
};

type LoadStatus = "idle" | "loading" | "ready" | "error";

export function GameBrowserEntry({
  wordLength,
  initialDailySolution,
  initialAccentMode,
  initialRegionMode,
}: GameBrowserEntryProps) {
  const [wordListData, setWordListData] = useState<WordListData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const isLoading = status === "loading";

  const runLoad = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const bundle = await loadBrowserWordListBundle(wordLength);
      const data = toWordListData(bundle);
      registerWordList(wordLength, data, "standard");

      if (requestIdRef.current !== requestId) {
        return;
      }

      setWordListData(data);
      setStatus("ready");
    } catch (error) {
      console.error("[game] Browser-Wörterliste konnte nicht geladen werden", error);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setWordListData(null);
      setStatus("error");
      setErrorMessage("Die Wörterliste konnte nicht geladen werden. Bitte versuche es in ein paar Sekunden erneut.");
    }
  }, [wordLength]);

  useEffect(() => {
    void runLoad();
  }, [runLoad]);

  if (status === "loading" || status === "idle") {
    return <GameLoadingPlaceholder wordLength={wordLength} />;
  }

  if (status === "error" || !wordListData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Wir laden deine Wörterliste
          </h2>
          <p className="text-base text-muted-foreground">
            {errorMessage ??
              "Die Wörterliste konnte nicht geladen werden. Prüfe deine Verbindung oder versuche es erneut."}
          </p>
        </div>
        <Button onClick={runLoad} disabled={isLoading}>
          Erneut versuchen
        </Button>
      </div>
    );
  }

  const gameKey = `${wordLength}-${initialAccentMode ?? "plain"}-${initialRegionMode ?? "standard"}`;

  return (
    <Game
      key={gameKey}
      wordListData={wordListData}
      initialWordLength={wordLength}
      initialAccentMode={initialAccentMode}
      initialRegionMode={initialRegionMode}
      initialDailySolution={initialDailySolution}
    />
  );
}
