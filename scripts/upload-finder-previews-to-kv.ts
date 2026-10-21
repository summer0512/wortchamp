import "dotenv/config";
import type { WordLength, WordListData } from "../constants/wordlist-metadata";
import { WORD_LENGTHS } from "../constants/wordlist-metadata";
import { getLocalWordList } from "../lib/wordlists.local";
import { getUppercaseWordList, registerWordList } from "../lib/words";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const namespaceId = process.env.WORDLIST_KV_NAMESPACE_ID ?? process.env.CLOUDFLARE_KV_NAMESPACE_ID;

if (!accountId) {
  throw new Error("Missing CLOUDFLARE_ACCOUNT_ID environment variable.");
}

if (!apiToken) {
  throw new Error("Missing CLOUDFLARE_API_TOKEN environment variable.");
}

if (!namespaceId) {
  throw new Error("Missing WORDLIST_KV_NAMESPACE_ID environment variable.");
}

const PREVIEW_LIMIT = Number.parseInt(process.env.FINDER_PREVIEW_LIMIT ?? "300", 10);

type FinderPreviewStats = {
  answers: number;
  allowed: number;
  unique: number;
};

type FinderPreviewPayload = {
  preview: readonly string[];
  stats: FinderPreviewStats;
};

const buildStats = (wordList: WordListData): FinderPreviewStats => {
  const answers = wordList.answers.length;
  const allowed = wordList.allowed.length;
  const unique = new Set([
    ...wordList.allowed,
    ...wordList.answers,
    ...Object.keys(wordList.accentMap),
    ...Object.values(wordList.accentMap),
  ]).size;

  return { answers, allowed, unique };
};

const toKey = (length: WordLength) => `wordlists-finder:${length}`;

async function uploadPreview(length: WordLength): Promise<void> {
  const wordListData = await getLocalWordList(length);
  registerWordList(length, wordListData);

  const uppercaseWordList = getUppercaseWordList(length);
  const preview = uppercaseWordList.slice(0, PREVIEW_LIMIT);

  const stats = buildStats(wordListData);

  const payload: FinderPreviewPayload = {
    preview,
    stats,
  };

  const body = JSON.stringify(payload);

  const url = new URL(
    `/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(toKey(length))}`,
    "https://api.cloudflare.com"
  );

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to upload preview for length ${length}: ${response.status} ${errorBody}`);
  }

  const sizeKiB = (Buffer.byteLength(body, "utf8") / 1024).toFixed(2);
  console.log(`Uploaded ${toKey(length)} (${sizeKiB} KiB, preview ${preview.length} words, unique ${stats.unique}).`);
}

async function main(): Promise<void> {
  for (const length of WORD_LENGTHS) {
    await uploadPreview(length);
  }
}

main().catch((error) => {
  console.error("Failed to upload finder previews:", error);
  process.exitCode = 1;
});
