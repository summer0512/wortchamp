import type { WordListData, WordListStats } from "@/constants/wordlist-metadata";

export type WordListBundle = WordListData & {
  readonly stats: WordListStats;
  readonly version?: string;
  readonly checksum?: string;
  readonly generatedAt?: string;
};
