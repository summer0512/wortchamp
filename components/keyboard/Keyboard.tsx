import { KeyValue } from "../../lib/keyboard";
import { getStatuses } from "../../lib/statuses";
import { Key } from "./Key";
import type { WordSettings } from "../../lib/words";

type Props = {
  onChar: (value: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  guesses: string[];
  solution: string;
  settings: WordSettings;
};

const FIRST_ROW: KeyValue[] = ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"];
const SECOND_ROW_STANDARD: KeyValue[] = ["A", "S", "D", "F", "G", "H", "J", "K", "L", "\u1e9e"];
const SECOND_ROW_CH: KeyValue[] = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const THIRD_ROW: KeyValue[] = ["Y", "X", "C", "V", "B", "N", "M"];
const ACCENT_ROW: KeyValue[] = ["\u00c4", "\u00d6", "\u00dc"];

export const Keyboard = ({ onChar, onDelete, onEnter, guesses, solution, settings }: Props) => {
  const charStatuses = getStatuses(guesses, solution, settings);
  const secondRow = settings.regionMode === "ch" ? SECOND_ROW_CH : SECOND_ROW_STANDARD;

  const onClick = (value: KeyValue) => {
    if (value === "ENTER") {
      onEnter();
      return;
    }
    if (value === "DELETE") {
      onDelete();
      return;
    }
    onChar(value);
  };

  const renderKey = (value: KeyValue) => (
    <Key key={value} value={value} onClick={onClick} status={charStatuses[value]} />
  );

  return (
    <div className="px-1">
      {settings.accentMode === "accented" && (
        <div className="flex justify-center mb-1">
          {ACCENT_ROW.map(renderKey)}
        </div>
      )}
      <div className="flex justify-center mb-1">
        {FIRST_ROW.map(renderKey)}
      </div>
      <div className="flex justify-center mb-1">
        {secondRow.map(renderKey)}
      </div>
      <div className="flex justify-center">
        <Key width={65.4} value="ENTER" onClick={onClick}>
          Enter
        </Key>
        {THIRD_ROW.map(renderKey)}
        <Key width={65.4} value="DELETE" onClick={onClick}>
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" data-testid="icon-backspace">
            <path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
          </svg>
        </Key>
      </div>
    </div>
  );
};
