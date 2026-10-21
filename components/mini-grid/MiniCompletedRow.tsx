import { getGuessStatuses } from "../../lib/statuses";
import { MiniCell } from "./MiniCell";
import type { WordSettings } from "../../lib/words";

type Props = {
  guess: string;
  solution: string;
  settings: WordSettings;
};

export const MiniCompletedRow = ({ guess, solution, settings }: Props) => {
  const statuses = getGuessStatuses(guess, solution, settings);

  return (
    <div className="flex justify-center mb-1">
      {guess.split("").map((letter, i) => (
        <MiniCell key={i} status={statuses[i]} />
      ))}
    </div>
  );
};
