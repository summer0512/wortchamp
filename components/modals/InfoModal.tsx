import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Cell } from "../grid/Cell";
import type { WordSettings } from "../../lib/words";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  settings: WordSettings;
};

const CHARS = {
  A_UMLAUT: "\u00C4",
  O_UMLAUT: "\u00D6",
  U_UMLAUT: "\u00DC",
  ESZETT: "\u1E9E",
};

export const InfoModal = ({ isOpen, handleClose, settings }: Props) => {
  const isAccented = settings.accentMode === "accented";
  const modeNote = isAccented
    ? settings.regionMode === "ch"
      ? `Im CH-Modus sind ${CHARS.A_UMLAUT}/${CHARS.O_UMLAUT}/${CHARS.U_UMLAUT} eigene Buchstaben; ${CHARS.ESZETT} ist deaktiviert (häufig als SS geschrieben).`
      : `Im DE/AT-Modus sind ${CHARS.A_UMLAUT}/${CHARS.O_UMLAUT}/${CHARS.U_UMLAUT} eigene Buchstaben, ${CHARS.ESZETT} bleibt verfügbar.`
    : `Ohne Umlaute zählen ${CHARS.A_UMLAUT}/${CHARS.O_UMLAUT}/${CHARS.U_UMLAUT} wie A/O/U und werden entsprechend ausgewertet.`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Dialog.Description className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <div>
                <div className="text-center">
                  <Dialog.Title className="text-lg leading-6 font-medium text-gray-900">So spielst du</Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Errate das Wort in 6 Versuchen. Nach jedem Versuch zeigen die Farben,
                      wie nah du am richtigen Wort bist.
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value={isAccented ? CHARS.A_UMLAUT : "A"} status="correct" />
                      <Cell value={isAccented ? "R" : "M"} />
                      <Cell value={isAccented ? "G" : "P"} />
                      <Cell value={isAccented ? "E" : "E"} />
                      <Cell value={isAccented ? "R" : "L"} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {isAccented
                        ? `Der Buchstabe ${CHARS.A_UMLAUT} ist korrekt und an der richtigen Stelle.`
                        : "Der Buchstabe A ist korrekt und an der richtigen Stelle."}
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value={isAccented ? "B" : "R"} />
                      <Cell value={isAccented ? CHARS.O_UMLAUT : "A"} status="present" />
                      <Cell value={isAccented ? "G" : "D"} />
                      <Cell value={isAccented ? "E" : "I"} />
                      <Cell value={isAccented ? "N" : "O"} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {isAccented
                        ? `Der Buchstabe ${CHARS.O_UMLAUT} ist im Wort, aber an der falschen Stelle.`
                        : "Der Buchstabe A ist im Wort, aber an der falschen Stelle."}
                    </p>

                    <div className="flex justify-center mb-1 mt-4">
                      <Cell value={isAccented ? "F" : "K"} status="absent" />
                      <Cell value={isAccented ? CHARS.U_UMLAUT : "U"} />
                      <Cell value="N" />
                      <Cell value={isAccented ? "F" : "S"} />
                      <Cell value="T" />
                    </div>
                    <p className="text-sm text-gray-500">
                      {isAccented
                        ? "Der Buchstabe F kommt im Wort nicht vor."
                        : "Der Buchstabe K kommt im Wort nicht vor."}
                    </p>
                    <p className="mt-4 text-xs text-gray-500">{modeNote}</p>
                  </div>
                </div>
              </div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
