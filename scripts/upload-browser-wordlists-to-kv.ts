import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import type { WordLength } from "../constants/wordlist-metadata";
import { WORD_LENGTHS } from "../constants/wordlist-metadata";

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

const bundleKeyPrefix = process.env.WORDLIST_BUNDLE_KV_KEY_PREFIX?.trim() || "wordlists-bundle:";
const wordlistsDir = path.resolve(process.cwd(), "public", "wordlists");

interface UploadResult {
  key: string;
  success: boolean;
  status: number;
  error?: string;
  sizeBytes?: number;
}

const endpointForKey = (key: string): URL =>
  new URL(
    `/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    "https://api.cloudflare.com",
  );

const toKey = (length: WordLength) => `${bundleKeyPrefix}${length}`;

async function readBundleFile(length: WordLength): Promise<{ body: string; sizeBytes: number }> {
  const filePath = path.join(wordlistsDir, `length-${length}.json`);
  const body = await fs.readFile(filePath, "utf8");
  const sizeBytes = Buffer.byteLength(body, "utf8");
  return { body, sizeBytes };
}

async function uploadBundle(length: WordLength): Promise<UploadResult> {
  const key = toKey(length);
  const { body, sizeBytes } = await readBundleFile(length);

  const response = await fetch(endpointForKey(key), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return { key, status: response.status, success: false, error: errorBody, sizeBytes };
  }

  return { key, status: response.status, success: true, sizeBytes };
}

async function main(): Promise<void> {
  const results: UploadResult[] = [];

  for (const length of WORD_LENGTHS) {
    try {
      const result = await uploadBundle(length);
      results.push(result);
    } catch (error) {
      results.push({
        key: toKey(length),
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  let failures = 0;
  for (const result of results) {
    if (result.success) {
      const sizeLabel =
        result.sizeBytes !== undefined ? `${(result.sizeBytes / 1024).toFixed(2)} KiB` : "unknown size";
      console.log(`Uploaded ${result.key} (${sizeLabel})`);
    } else {
      failures += 1;
      console.error(
        `Failed to upload ${result.key} (${result.status})${result.error ? `: ${result.error}` : ""}`,
      );
    }
  }

  if (failures > 0) {
    console.error(`${failures} bundle uploads failed.`);
    process.exitCode = 1;
  } else {
    console.log("All browser word list bundles uploaded successfully.");
  }
}

main().catch((error) => {
  console.error("Unexpected error while uploading bundles to KV:", error);
  process.exitCode = 1;
});
