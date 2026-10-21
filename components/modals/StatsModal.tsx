import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { StoredStats } from "@/lib/stats";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  stats: StoredStats;
};

const getWinPercentage = (stats: StoredStats): number => {
  if (stats.totalGames === 0) return 0;
  return Math.round((stats.victories / stats.totalGames) * 100);
};

const ATTEMPTS = ['1', '2', '3', '4', '5', '6'];

export const StatsModal = ({ isOpen, handleClose, stats }: Props) => {
  const winPercentage = getWinPercentage(stats);
  const maxDistribution = Math.max(
    ...ATTEMPTS.map((attempt) => stats.guessDistribution[attempt] ?? 0),
    stats.failCount,
    1,
  );

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
                  Statistiken
                </Dialog.Title>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalGames}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Spiele
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {winPercentage}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Gewinnquote %
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.currentStreak}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Aktuelle Serie
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.maxStreak}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Beste Serie
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                    Versuchsverteilung
                  </h3>
                  <div className="space-y-2">
                    {ATTEMPTS.map((attempt) => {
                      const count = stats.guessDistribution[attempt] ?? 0;
                      const width = Math.max((count / maxDistribution) * 100, count > 0 ? 18 : 10);

                      return (
                        <div key={attempt} className="flex items-center gap-2 text-sm">
                          <span className="w-5 font-semibold text-gray-600">
                            {attempt}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded">
                            <div
                              className={`flex items-center justify-end pr-2 rounded ${count > 0 ? 'bg-primary-green text-white' : 'bg-gray-200 text-gray-500'}`}
                              style={{ width: `${width}%` }}
                            >
                              <span className="text-xs font-semibold">
                                {count}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-5 font-semibold text-gray-600">
                        X
                      </span>
                      <div className="flex-1 bg-gray-100 rounded">
                        <div
                          className={`flex items-center justify-end pr-2 rounded ${stats.failCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                          style={{ width: `${Math.max((stats.failCount / maxDistribution) * 100, stats.failCount > 0 ? 18 : 10)}%` }}
                        >
                          <span className="text-xs font-semibold">
                            {stats.failCount}
                          </span>
                        </div>
                      </div>
                    </div>
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
