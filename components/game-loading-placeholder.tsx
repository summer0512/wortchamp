import type { WordLength } from "@/constants/wordlist-metadata";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { cn } from "@/lib/utils";

type GameLoadingPlaceholderProps = {
  wordLength: WordLength;
};

const buildArray = (length: number) => Array.from({ length });

export function GameLoadingPlaceholder({ wordLength }: GameLoadingPlaceholderProps) {
  const guessRows = buildArray(6);
  const tiles = buildArray(wordLength);

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-10 px-4 py-6 sm:py-10">
      <LoadingIndicator
        label={`Wörterliste für ${wordLength} Buchstaben wird geladen…`}
        size="lg"
        className="text-base text-gray-600 dark:text-gray-300"
        showProgressBar
      />
      <div className="flex flex-col items-center gap-8 text-muted-foreground">
        <div className="flex flex-col gap-3 animate-pulse">
          {guessRows.map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex justify-center gap-2 px-2"
              aria-hidden
            >
              {tiles.map((_, colIndex) => (
                <div
                  key={`tile-${rowIndex}-${colIndex}`}
                  className="h-12 w-12 rounded-md border border-border/70 bg-muted/60 shadow-sm sm:h-14 sm:w-14"
                />
              ))}
            </div>
          ))}
        </div>
        <KeyboardSkeleton />
      </div>
    </div>
  );
}

const keyboardRows: Array<{ count: number; wideKeys?: number[] }> = [
  { count: 10 },
  { count: 9, wideKeys: [0, 8] },
  { count: 7, wideKeys: [0, 6] },
];

const KeyboardSkeleton = () => (
  <div className="flex flex-col items-center gap-2 animate-pulse">
    {keyboardRows.map((row, rowIndex) => (
      <div key={`kbd-${rowIndex}`} className="flex justify-center gap-2">
        {buildArray(row.count).map((_, keyIndex) => (
          <div
            key={`kbd-key-${rowIndex}-${keyIndex}`}
            className={cn(
              "h-10 rounded-md bg-muted/60 shadow-sm sm:h-11",
              row.wideKeys?.includes(keyIndex) ? "w-14 sm:w-16" : "w-10 sm:w-11",
            )}
          />
        ))}
      </div>
    ))}
  </div>
);
