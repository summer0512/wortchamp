import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";
import type { WordSettings } from "../../lib/words";

type Props = {
  guesses: string[];
  currentGuess: string;
  revealingRowIndex?: number;
  solution: string;
  settings: WordSettings;
  wordLength: number;
  maxGuesses?: number;
  isGameOver: boolean;
};

const DEFAULT_MAX_GUESSES = 6;

export const Grid = ({
  guesses,
  currentGuess,
  revealingRowIndex,
  solution,
  settings,
  wordLength,
  maxGuesses = DEFAULT_MAX_GUESSES,
  isGameOver,
}: Props) => {
  const shouldShowCurrentRow = !isGameOver && guesses.length < maxGuesses;
  const remainingEmptyRows = shouldShowCurrentRow
    ? Math.max(0, maxGuesses - guesses.length - 1)
    : Math.max(0, maxGuesses - guesses.length);

  return (
    <div className="pb-6">
      {guesses.map((guess, i) => (
        <CompletedRow
          key={i}
          guess={guess}
          isRevealing={revealingRowIndex === i}
          solution={solution}
          settings={settings}
        />
      ))}
      {shouldShowCurrentRow && <CurrentRow guess={currentGuess} wordLength={wordLength} />}
      {Array.from({ length: remainingEmptyRows }).map((_, i) => (
        <EmptyRow key={i} wordLength={wordLength} />
      ))}
    </div>
  );
};
