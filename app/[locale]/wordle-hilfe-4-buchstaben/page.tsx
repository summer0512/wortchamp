import type { Metadata } from "next";
import type { WordLength } from "@/constants/wordlist-metadata";
import { makeFinderMetadata, makeFinderPage } from "@/app/[locale]/finder-page-helpers";

const WORD_LENGTH = 4 as WordLength;

export const generateMetadata = makeFinderMetadata({ wordLength: WORD_LENGTH }) satisfies (
  args: { params: Promise<{ locale: string }> }
) => Promise<Metadata>;

export default makeFinderPage({ wordLength: WORD_LENGTH });
