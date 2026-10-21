import { Cell } from "./Cell";

type Props = {
  guess: string;
  wordLength: number;
};

export const CurrentRow = ({ guess, wordLength }: Props) => {
  const splitGuess = Array.from(guess);
  const emptyCells = Math.max(0, wordLength - splitGuess.length);

  return (
    <div className="flex justify-center mb-1">
      {splitGuess.map((letter, i) => (
        <Cell key={i} value={letter} />
      ))}
      {Array.from({ length: emptyCells }).map((_, i) => (
        <Cell key={`empty-${i}`} />
      ))}
    </div>
  );
};
