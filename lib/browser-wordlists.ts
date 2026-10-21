import type { WordLength, WordListData, WordListStats } from "@/constants/wordlist-metadata";
import type { WordListBundle } from "@/lib/wordlist-types";

export type BrowserWordListBundle = WordListBundle & {
  readonly length: WordLength;
  readonly checksum: string;
  readonly version: string;
  readonly generatedAt: string;
};

type ManifestEntry = {
  readonly length: WordLength;
  readonly version: string;
  readonly checksum: string;
  readonly sizeBytes: number;
  readonly stats: WordListStats;
  readonly generatedAt: string;
};

type WordListManifest = {
  readonly generatedAt: string;
  readonly entries: ManifestEntry[];
};

type StoredBundleRecord = {
  readonly key: string;
  readonly version: string;
  readonly bundle: BrowserWordListBundle;
};

const DB_NAME = "wortchamp-wordlists";
const DB_VERSION = 1;
const STORE_NAME = "bundles";
const BUNDLE_KEY_PREFIX = "bundle:";

let databasePromise: Promise<IDBDatabase> | null = null;
let manifestPromise: Promise<WordListManifest> | null = null;

const supportsIndexedDb = () => typeof window !== "undefined" && "indexedDB" in window;

const makeKey = (wordLength: WordLength) => `${BUNDLE_KEY_PREFIX}${wordLength}`;

const openDatabase = (): Promise<IDBDatabase> => {
  if (!supportsIndexedDb()) {
    return Promise.reject(new Error("IndexedDB ist in dieser Umgebung nicht verfügbar."));
  }

  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB konnte nicht geöffnet werden."));
    };
  });

  return databasePromise;
};

const getStoredBundleRecord = async (
  wordLength: WordLength,
): Promise<StoredBundleRecord | null> => {
  if (!supportsIndexedDb()) {
    return null;
  }

  try {
    const db = await openDatabase();
    return await new Promise<StoredBundleRecord | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(makeKey(wordLength));

      request.onsuccess = () => {
        resolve((request.result as StoredBundleRecord | undefined) ?? null);
      };
      request.onerror = () => {
        reject(request.error ?? new Error("IndexedDB konnte nicht gelesen werden."));
      };
    });
  } catch (error) {
    console.warn(`[wordlists] Gespeichertes Bundle konnte nicht gelesen werden (${wordLength} Buchstaben).`, error);
    return null;
  }
};

const storeBundleRecord = async (record: StoredBundleRecord): Promise<void> => {
  if (!supportsIndexedDb()) {
    return;
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error("Bundle konnte nicht in IndexedDB gespeichert werden."));
    });
  } catch (error) {
    console.warn(`[wordlists] Bundle konnte nicht gespeichert werden (${record.key}).`, error);
  }
};

const fetchManifest = async (): Promise<WordListManifest> => {
  if (manifestPromise) {
    return manifestPromise;
  }

  manifestPromise = fetch("/wordlists/manifest.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Manifest request failed with status ${response.status}`);
      }
      return response.json() as Promise<WordListManifest>;
    })
    .catch((error) => {
      manifestPromise = null;
      throw error;
    });

  return manifestPromise;
};

const normalizeWordArray = (value: unknown, kind: string, wordLength: WordLength): string[] => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`Das Bundle ${wordLength} hat ein ungültiges '${kind}'-Array.`);
  }
  return value as string[];
};

const normalizeAccentMap = (accentMap: unknown, wordLength: WordLength): Record<string, string> => {
  if (!accentMap || typeof accentMap !== "object") {
    throw new Error(`Das Bundle ${wordLength} hat eine ungültige AccentMap.`);
  }
  const entries = Object.entries(accentMap as Record<string, unknown>);
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};

const normalizeStats = (stats: unknown, wordLength: WordLength): WordListStats => {
  if (!stats || typeof stats !== "object") {
    throw new Error(`Das Bundle ${wordLength} hat ungültige Statistiken.`);
  }
  const record = stats as Partial<WordListStats>;
  const answers = Number(record.answers);
  const allowed = Number(record.allowed);
  const unique = Number(record.unique);
  if (!Number.isFinite(answers) || !Number.isFinite(allowed) || !Number.isFinite(unique)) {
    throw new Error(`Das Bundle ${wordLength} enthält beschädigte Statistiken.`);
  }
  return { answers, allowed, unique };
};

const normalizeBundle = (raw: unknown, wordLength: WordLength): BrowserWordListBundle => {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Das Bundle ${wordLength} ist ungültig.`);
  }

  const record = raw as Partial<BrowserWordListBundle> & { length?: number };
  const lengthValue = record.length;
  if (typeof lengthValue !== "number" || lengthValue !== wordLength) {
    throw new Error(`Das geladene Bundle hat eine andere Länge (${lengthValue}).`);
  }

  const allowed = normalizeWordArray(record.allowed, "allowed", wordLength);
  const answers = normalizeWordArray(record.answers, "answers", wordLength);
  const accentMap = normalizeAccentMap(record.accentMap, wordLength);
  const stats = normalizeStats(record.stats, wordLength);

  if (typeof record.version !== "string" || typeof record.checksum !== "string") {
    throw new Error(`Das Bundle ${wordLength} enthält keine gültige Version oder Prüfsumme.`);
  }

  const generatedAt = typeof record.generatedAt === "string" ? record.generatedAt : new Date().toISOString();

  return {
    allowed,
    answers,
    accentMap,
    stats,
    length: wordLength,
    version: record.version,
    checksum: record.checksum,
    generatedAt,
  };
};

const fetchBundleFromNetwork = async (wordLength: WordLength): Promise<BrowserWordListBundle> => {
  const response = await fetch(`/wordlists/length-${wordLength}.json`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Word list bundle request failed with status ${response.status}`);
  }
  const payload = await response.json();
  return normalizeBundle(payload, wordLength);
};

const shouldRefreshBundle = (
  stored: StoredBundleRecord | null,
  manifestEntry: ManifestEntry | undefined,
): boolean => {
  if (!stored) {
    return true;
  }
  if (!manifestEntry) {
    return false;
  }
  return stored.version !== manifestEntry.version;
};

export const loadBrowserWordListBundle = async (
  wordLength: WordLength,
): Promise<BrowserWordListBundle> => {
  const storedRecord = await getStoredBundleRecord(wordLength);

  let manifestEntry: ManifestEntry | undefined;
  try {
    const manifest = await fetchManifest();
    manifestEntry = manifest.entries.find((entry) => entry.length === wordLength);
  } catch (error) {
    if (!storedRecord) {
      throw error;
    }
    console.warn(`[wordlists] Manifest konnte nicht geladen werden. Gespeicherte Kopie wird genutzt (${wordLength}).`, error);
    return storedRecord.bundle;
  }

  const needsRefresh = shouldRefreshBundle(storedRecord, manifestEntry);

  if (!needsRefresh && storedRecord) {
    return storedRecord.bundle;
  }

  try {
    const bundle = await fetchBundleFromNetwork(wordLength);
    await storeBundleRecord({
      key: makeKey(wordLength),
      version: bundle.version,
      bundle,
    });
    return bundle;
  } catch (error) {
    if (storedRecord) {
      console.warn(
        `[wordlists] Bundle konnte nicht aktualisiert werden (${wordLength}). Gespeicherte Kopie wird genutzt.`,
        error,
      );
      return storedRecord.bundle;
    }
    throw error;
  }
};

export const toWordListData = (bundle: BrowserWordListBundle): WordListData => ({
  allowed: bundle.allowed,
  answers: bundle.answers,
  accentMap: bundle.accentMap,
});
