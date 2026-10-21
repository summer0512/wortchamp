import "dotenv/config";
import type {
  AllowedWordListPayload,
  AnswerWordListPayload,
  WordLength,
  WordListData,
  WordListStats,
} from "../constants/wordlist-metadata";
import { WORD_LENGTHS } from "../constants/wordlist-metadata";
import { getLocalWordList } from "../lib/wordlists.local";

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

const allowedKeyPrefix = process.env.WORDLIST_ALLOWED_KV_KEY_PREFIX?.trim() || "wordlists-allow:";
const answerKeyPrefix = process.env.WORDLIST_ANSWER_KV_KEY_PREFIX?.trim() || "wordlists-answer:";
const legacyKeyPrefix = process.env.WORDLIST_KV_KEY_PREFIX?.trim() || "wordlists:";

interface UploadResult {
  key: string;
  action: "put" | "delete";
  success: boolean;
  status: number;
  error?: string;
  sizeBytes?: number;
}

const buildStats = (wordList: WordListData): WordListStats => {
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

const toAllowedKey = (length: WordLength) => `${allowedKeyPrefix}${length}`;
const toAnswerKey = (length: WordLength) => `${answerKeyPrefix}${length}`;
const toLegacyKey = (length: WordLength) => `${legacyKeyPrefix}${length}`;

const endpointForKey = (key: string): URL =>
  new URL(
    `/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    "https://api.cloudflare.com",
  );

async function putKey(key: string, body: string): Promise<UploadResult> {
  const response = await fetch(endpointForKey(key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const sizeBytes = Buffer.byteLength(body, "utf8");

  if (!response.ok) {
    const errorBody = await response.text();
    return { key, action: "put", success: false, status: response.status, error: errorBody, sizeBytes };
  }

  return { key, action: "put", success: true, status: response.status, sizeBytes };
}

async function deleteKey(key: string): Promise<UploadResult> {
  const response = await fetch(endpointForKey(key), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text();
    return { key, action: "delete", success: false, status: response.status, error: errorBody };
  }

  return { key, action: "delete", success: true, status: response.status };
}

async function uploadWordList(length: WordLength): Promise<UploadResult[]> {
  const wordList = await getLocalWordList(length);
  const stats = buildStats(wordList);

  const allowedPayload: AllowedWordListPayload = {
    allowed: wordList.allowed,
    accentMap: wordList.accentMap,
    stats,
  };

  const answerPayload: AnswerWordListPayload = {
    answers: wordList.answers,
  };

  const results: UploadResult[] = [];

  const allowedResult = await putKey(toAllowedKey(length), JSON.stringify(allowedPayload));
  results.push(allowedResult);

  const answerResult = await putKey(toAnswerKey(length), JSON.stringify(answerPayload));
  results.push(answerResult);

  const legacyResult = await deleteKey(toLegacyKey(length));
  results.push(legacyResult);

  return results;
}

async function main(): Promise<void> {
  const allResults: UploadResult[] = [];

  for (const length of WORD_LENGTHS) {
    const results = await uploadWordList(length);
    allResults.push(...results);
  }

  let failures = 0;
  for (const result of allResults) {
    if (result.success) {
      if (result.action === "put") {
        console.log(
          `Uploaded ${result.key} (${((result.sizeBytes ?? 0) / 1024).toFixed(2)} KiB)`,
        );
      } else {
        console.log(`Deleted legacy key ${result.key}`);
      }
    } else {
      failures += 1;
      console.error(
        `Failed to ${result.action} ${result.key} (${result.status})${result.error ? `: ${result.error}` : ""}`,
      );
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    console.error(`${failures} operations failed.`);
  } else {
    console.log("All word list entries uploaded successfully.");
  }
}

main().catch((error) => {
  console.error("Unexpected error while uploading word lists to KV:", error);
  process.exitCode = 1;
});
