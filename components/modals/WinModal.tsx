import * as Dialog from "@radix-ui/react-dialog";
import { BarChart3, Share2, Copy, X, Download } from "lucide-react";
import { useState } from "react";
import { generateShareText, generateTwitterShareUrl, copyToClipboard } from "../../lib/share";
import { generateGameImage } from "../../lib/imageGenerator";
import type { WordSettings } from "../../lib/words";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  guesses: string[];
  solution: string;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onShowStats: () => void;
  settings: WordSettings;
  maxGuesses: number;
};

export const WinModal = ({
  isOpen,
  handleClose,
  guesses,
  solution,
  primaryActionLabel,
  onPrimaryAction,
  onShowStats,
  settings,
  maxGuesses,
}: Props) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handlePrimaryAction = () => {
    onPrimaryAction();
    handleClose();
  };

  const handleShowStats = () => {
    handleClose();
    onShowStats();
  };

  const getScoreText = (guessCount: number) => {
    switch (guessCount) {
      case 1:
        return "Unglaublich! 🎉";
      case 2:
        return "Exzellent! 🎊";
      case 3:
        return "Sehr gut! 👏";
      case 4:
        return "Gut gemacht! 👍";
      case 5:
        return "Stark gespielt! 💪";
      case 6:
        return "Geschafft! 🎯";
      default:
        return "Glückwunsch! 🎉";
    }
  };

  const buildShareText = () => generateShareText(guesses, solution, true, settings, maxGuesses);

  const handleShareToTwitter = () => {
    const shareText = buildShareText();
    const twitterUrl = generateTwitterShareUrl(shareText);
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyResult = async () => {
    const shareText = buildShareText();
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await generateGameImage(guesses, solution, settings, { maxAttempts: maxGuesses });
    } catch (error) {
      console.error('Bild konnte nicht erstellt werden:', error);
    }
  };

  return (
    <>
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
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title className="text-lg leading-6 font-medium text-gray-900">
                      Du hast gewonnen!
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-3">{getScoreText(guesses.length)}</p>
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
                  <button
                    onClick={handleShareToTwitter}
                    className="inline-flex justify-center w-full items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Auf X teilen</span>
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="inline-flex justify-center w-full items-center space-x-2 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Bild herunterladen</span>
                  </button>
                  <button
                    onClick={handleCopyResult}
                    className="inline-flex justify-center w-full items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copySuccess ? "Kopiert!" : "Kopieren"}</span>
                  </button>
                </div>
              </Dialog.Description>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
