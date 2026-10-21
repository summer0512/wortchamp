const BERLIN_TIME_ZONE = "Europe/Berlin";
const DAY_MS = 24 * 60 * 60 * 1000;

const berlinDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BERLIN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const getBerlinDateString = (date: Date = new Date()): string => {
  return berlinDateFormatter.format(date);
};

export const getBerlinDayNumber = (date: Date = new Date()): number => {
  const [year, month, day] = getBerlinDateString(date)
    .split("-")
    .map((value) => Number.parseInt(value, 10));
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
};

export const getDaysSinceBerlinEpoch = (
  epoch: { year: number; month: number; day: number },
  date: Date = new Date(),
): number => {
  const epochDay = Math.floor(Date.UTC(epoch.year, epoch.month - 1, epoch.day) / DAY_MS);
  return getBerlinDayNumber(date) - epochDay;
};
