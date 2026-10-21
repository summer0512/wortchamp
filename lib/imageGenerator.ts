import html2canvas from 'html2canvas';
import { getGuessStatuses, type CharStatus } from './statuses';
import { normalizeWord, type WordSettings } from './words';

const DEFAULT_MAX_ATTEMPTS = 6;
const GERMAN_LOCALE = 'de-DE';

const getColorForStatus = (status?: CharStatus) => {
  switch (status) {
    case 'correct':
      return '#79b851';
    case 'present':
      return '#f3c237';
    case 'absent':
      return '#a4aec4';
    default:
      return '#ffffff';
  }
};

const getBorderColorForStatus = (status?: CharStatus) => {
  switch (status) {
    case 'correct':
      return '#79b851';
    case 'present':
      return '#f3c237';
    case 'absent':
      return '#a4aec4';
    default:
      return '#e2e8f0';
  }
};

const getTextColorForStatus = (status?: CharStatus) => {
  return status ? '#ffffff' : '#000000';
};

type RenderContext = {
  wordLength: number;
};

const getCellSize = (wordLength: number) => {
  if (wordLength >= 10) {
    return 44;
  }
  if (wordLength >= 8) {
    return 50;
  }
  return 56;
};

const createCellElement = (letter: string, status: CharStatus | undefined, context: RenderContext): HTMLDivElement => {
  const size = getCellSize(context.wordLength);
  const cell = document.createElement('div');
  cell.style.width = `${size}px`;
  cell.style.height = `${size}px`;
  cell.style.border = '2px solid';
  cell.style.borderColor = getBorderColorForStatus(status);
  cell.style.backgroundColor = getColorForStatus(status);
  cell.style.color = getTextColorForStatus(status);
  cell.style.display = 'inline-flex';
  cell.style.alignItems = 'center';
  cell.style.justifyContent = 'center';
  cell.style.margin = '0 2px';
  cell.style.fontSize = `${Math.max(20, size - 30)}px`;
  cell.style.fontWeight = 'bold';
  cell.style.borderRadius = '4px';
  cell.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  cell.textContent = letter;
  return cell;
};

const createRowElement = (guess: string, solution: string, settings: WordSettings, context: RenderContext): HTMLDivElement => {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'center';
  row.style.marginBottom = '4px';

  const statuses = getGuessStatuses(guess, solution, settings);
  const displayWord = normalizeWord(guess, settings).toLocaleUpperCase(GERMAN_LOCALE);

  Array.from(displayWord).forEach((letter, i) => {
    const cell = createCellElement(letter, statuses[i], context);
    row.appendChild(cell);
  });

  return row;
};

const createEmptyRowElement = (settings: WordSettings, context: RenderContext): HTMLDivElement => {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'center';
  row.style.marginBottom = '4px';

  for (let i = 0; i < context.wordLength; i++) {
    const cell = createCellElement('', undefined, context);
    row.appendChild(cell);
  }

  return row;
};

export const generateGameImage = async (
  guesses: string[],
  solution: string,
  settings: WordSettings,
  options?: { maxAttempts?: number }
): Promise<void> => {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const context: RenderContext = {
    wordLength: settings.wordLength,
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '20px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  container.style.textAlign = 'center';

  const title = document.createElement('div');
  title.style.fontSize = '24px';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '20px';
  title.style.color = '#1f2937';
  title.textContent = 'WORTCHAMP';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.style.paddingBottom = '10px';

  guesses.forEach((guess) => {
    const row = createRowElement(guess, solution, settings, context);
    grid.appendChild(row);
  });

  const emptyRowsCount = Math.max(0, maxAttempts - guesses.length);
  for (let i = 0; i < emptyRowsCount; i++) {
    grid.appendChild(createEmptyRowElement(settings, context));
  }

  container.appendChild(grid);

  const attempts = guesses.length;
  const attemptText = attempts === 1 ? 'Versuch' : 'Versuche';
  const footer = document.createElement('div');
  footer.style.marginTop = '16px';
  footer.style.fontSize = '16px';
  footer.style.color = '#374151';
  footer.style.fontWeight = '500';
  footer.textContent = `Geschafft in ${attempts} ${attemptText}. Und du?`;
  container.appendChild(footer);

  const link = document.createElement('div');
  link.style.marginTop = '10px';
  link.style.fontSize = '14px';
  link.style.color = '#6b7280';
  link.style.paddingTop = '10px';
  link.style.borderTop = '1px solid #e5e7eb';
  const siteUrl = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://wortchamp.com');
  link.textContent = siteUrl;
  container.appendChild(link);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const linkElement = document.createElement('a');
    linkElement.download = `wortchamp-${new Date().toISOString().split('T')[0]}.png`;
    linkElement.href = canvas.toDataURL('image/png');
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  } catch (error) {
    console.error('Failed to generate image:', error);
  } finally {
    document.body.removeChild(container);
  }
};
