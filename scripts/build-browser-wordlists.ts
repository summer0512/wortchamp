import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";
import { WORD_LENGTHS } from "../constants/wordlist-metadata";
import type { WordLength, WordListData, WordListStats } from "../constants/wordlist-metadata";
import { getLocalWordList } from "../lib/wordlists.local";

const OUTPUT_DIR = path.resolve(process.cwd(), "public", "wordlists");

type BrowserWordListBundle = WordListData & {
  readonly length: WordLength;
  readonly stats: WordListStats;
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

type Manifest = {
  readonly generatedAt: string;
  readonly entries: ManifestEntry[];
};

const deriveStats = (data: WordListData): WordListStats => {
  const answers = data.answers.length;
  const allowed = data.allowed.length;
  const unique = new Set([
    ...data.allowed,
    ...data.answers,
    ...Object.keys(data.accentMap),
    ...Object.values(data.accentMap),
  ]).size;

  return { answers, allowed, unique };
};

const buildChecksum = (payload: object): { checksum: string; version: string } => {
  const json = JSON.stringify(payload);
  const hash = createHash("sha256").update(json).digest("hex");
  const short = hash.slice(0, 16);
  return { checksum: hash, version: short };
};

async function writeBundle(bundle: BrowserWordListBundle): Promise<number> {
  const filePath = path.join(OUTPUT_DIR, `length-${bundle.length}.json`);
  const json = JSON.stringify(bundle);
  await fs.writeFile(filePath, json, "utf8");
  return Buffer.byteLength(json, "utf8");
}

async function ensureOutputDirectory(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function buildBundles(): Promise<void> {
  await ensureOutputDirectory();

  const manifestEntries: ManifestEntry[] = [];
  const generatedAt = new Date().toISOString();

  for (const length of WORD_LENGTHS) {
    const data = await getLocalWordList(length);
    const stats = deriveStats(data);
    const basePayload = {
      length,
      allowed: data.allowed,
      answers: data.answers,
      accentMap: data.accentMap,
      stats,
      generatedAt,
    };

    const { checksum, version } = buildChecksum(basePayload);
    const bundle: BrowserWordListBundle = {
      ...basePayload,
      checksum,
      version,
    };

    const sizeBytes = await writeBundle(bundle);

    manifestEntries.push({
      length,
      version,
      checksum,
      sizeBytes,
      stats,
      generatedAt,
    });

    const sizeKiB = (sizeBytes / 1024).toFixed(2);
    console.log(`Generated bundle length-${length}.json (${sizeKiB} KiB) version=${version}`);
  }

  const manifest: Manifest = {
    generatedAt,
    entries: manifestEntries,
  };

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest), "utf8");
  console.log(`Wrote manifest.json with ${manifestEntries.length} entries.`);
}

buildBundles().catch((error) => {
  console.error("Failed to build browser word list bundles:", error);
  process.exitCode = 1;
});
