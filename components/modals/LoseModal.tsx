import * as Dialog from "@radix-ui/react-dialog";
import { BarChart3, X } from "lucide-react";
import { normalizeWord, type WordSettings } from "../../lib/words";

const GERMAN_LOCALE = "de-DE";
const toUpperGerman = (value: string) =>
  Array.from(value)
    .map((char) => (char === "ß" ? "ẞ" : char.toLocaleUpperCase(GERMAN_LOCALE)))
    .join("");

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  guesses: string[];
  solution: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onShowStats: () => void;
  settings: WordSettings;
};

export const LoseModal = ({
  isOpen,
  handleClose,
  guesses: _guesses,
  solution,
  primaryActionLabel,
  onPrimaryAction,
  onShowStats,
  settings,
}: Props) => {
  const handlePrimaryAction = () => {
    onPrimaryAction();
    handleClose();
  };

  const handleShowStats = () => {
    handleClose();
    onShowStats();
  };

  const displaySolution = toUpperGerman(normalizeWord(solution, settings));

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
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <span className="text-2xl" aria-hidden="true">
                    😔
                  </span>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title className="text-lg leading-6 font-medium text-gray-900">
                    Leider verloren!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-3">Die Lösung war:</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 mb-4">
                      <span className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                        {displaySolution}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Was bedeutet dieses Wort?</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-green text-base font-medium text-white hover:bg-primary-green/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                >
                  {primaryActionLabel}
                </button>
                <button
                  onClick={handleShowStats}
                  className="inline-flex justify-center w-full items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Statistiken anzeigen</span>
                </button>
              </div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
