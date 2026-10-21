import type { Metadata } from "next";
import type { WordLength } from "@/constants/wordlist-metadata";
import { makeLengthGameMetadata, makeLengthGamePage } from "@/app/[locale]/length-page-helpers";

const WORD_LENGTH = 4 as WordLength;

export const generateMetadata = makeLengthGameMetadata({ wordLength: WORD_LENGTH }) satisfies (
  args: { params: Promise<{ locale: string }> }
) => Promise<Metadata>;

export default makeLengthGamePage({ wordLength: WORD_LENGTH });
