import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type GameMode = "daily" | "infinite" | "challenge";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  currentMode: GameMode;
};

export const ModeInfoModal = ({ isOpen, handleClose, currentMode }: Props) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Dialog.Description className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
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
                <Dialog.Title className="text-lg leading-6 font-medium text-gray-900 text-center">
                  Modi & Einstellungen
                </Dialog.Title>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Aktiver Modus: {currentMode === "daily" && "Tagesmodus"}
                  {currentMode === "infinite" && "Endlos-Modus"}
                  {currentMode === "challenge" && "Challenge"}
                </p>

                <div className="mt-4 text-sm text-gray-600 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Spielmodi</p>
                    <p>
                      Tagesmodus: Ein Wort pro Tag für alle. Fortschritt bleibt lokal bis 00:00 Uhr (Mitteleuropäische Zeit).
                    </p>
                    <p className="mt-2">
                      Endlos-Modus: Unbegrenzt viele Zufallswörter. Jede Runde startet neu, ohne Verlauf.
                    </p>
                    <p className="mt-2">
                      Challenge: Jemand hat ein Wort gewählt und dir den Link geschickt. Dein Fortschritt bleibt im Browser, bis du fertig bist.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Regionen-Modus</p>
                    <p>
                      DE/AT: Standarddeutsch mit ß als eigenem Buchstaben.
                    </p>
                    <p className="mt-2">
                      CH: Schweizer Schreibweise ohne ß; die Tastatur blendet ß aus.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Umlaut-Modus</p>
                    <p>
                      Ohne Umlaute zählen Ä/Ö/Ü wie A/O/U. Mit Umlauten sind Ä/Ö/Ü eigene Buchstaben.
                    </p>
                  </div>
                </div>

                {currentMode !== "challenge" && (
                  <p className="mt-6 text-xs text-gray-400 text-center">
                    Nutze die Schalter oben, um zwischen den Modi zu wechseln.
                  </p>
                )}
              </div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
