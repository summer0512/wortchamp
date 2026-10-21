import { MiniCompletedRow } from "./MiniCompletedRow";
import type { WordSettings } from "../../lib/words";

type Props = {
  guesses: string[];
  solution: string;
  settings: WordSettings;
};

export const MiniGrid = ({ guesses, solution, settings }: Props) => {
  return (
    <div className="pb-6">
      {guesses.map((guess, i) => (
        <MiniCompletedRow key={i} guess={guess} solution={solution} settings={settings} />
      ))}
    </div>
  );
};
