import fs from "fs";
import path from "path";
import readline from "readline";

const INPUT_PATH =
  process.env.WIKTIONARY_XML?.trim() ||
  path.resolve(
    process.cwd(),
    "dictionary",
    "dewiktionary-latest-pages-articles.xml",
    "dewiktionary-latest-pages-articles.xml"
  );

const OUTPUT_DIR = path.resolve(process.cwd(), "data");
const ANSWERS_DIR = path.join(OUTPUT_DIR, "answers");

const MIN_LEN = 3;
const MAX_LEN = 11;
const VALID_WORD = /^[A-Za-zÄÖÜäöüßẞ]+$/u;

const collator = new Intl.Collator("de", { sensitivity: "base", usage: "sort" });

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">" );

const hasGermanMarker = (line: string) =>
  line.includes("== Deutsch ==") ||
  line.includes("{{Sprache|Deutsch}}") ||
  line.includes("{{Sprache|de}}") ||
  line.includes("{{Sprache|DE}}") ||
  line.includes("{{Sprache|Deutsch|");

const toLowerGerman = (value: string) => value.toLocaleLowerCase("de-DE");

const wordBuckets = new Map<number, Set<string>>();
for (let len = MIN_LEN; len <= MAX_LEN; len += 1) {
  wordBuckets.set(len, new Set());
}

const ensureOutputDirs = async () => {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.promises.mkdir(ANSWERS_DIR, { recursive: true });
};

const writeWordList = async (length: number, words: string[]) => {
  const prefix = length.toString().padStart(2, "0");
  const allowedPath = path.join(OUTPUT_DIR, `${prefix}.txt`);
  const answersPath = path.join(ANSWERS_DIR, `${prefix}.txt`);
  const payload = words.join("\n") + "\n";
  await Promise.all([
    fs.promises.writeFile(allowedPath, payload, "utf8"),
    fs.promises.writeFile(answersPath, payload, "utf8"),
  ]);
};

async function run() {
  await ensureOutputDirs();

  const stream = fs.createReadStream(INPUT_PATH, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let inPage = false;
  let inText = false;
  let title = "";
  let ns = "";
  let isGerman = false;

  const resetPage = () => {
    title = "";
    ns = "";
    isGerman = false;
    inText = false;
  };

  for await (const line of rl) {
    if (line.includes("<page>")) {
      inPage = true;
      resetPage();
      continue;
    }

    if (!inPage) {
      continue;
    }

    if (line.includes("</page>")) {
      if (ns === "0" && isGerman && title) {
        const decoded = decodeEntities(title);
        if (VALID_WORD.test(decoded)) {
          const word = toLowerGerman(decoded);
          const length = Array.from(word).length;
          if (length >= MIN_LEN && length <= MAX_LEN) {
            wordBuckets.get(length)?.add(word);
          }
        }
      }
      inPage = false;
      resetPage();
      continue;
    }

    if (!title) {
      const titleMatch = line.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        title = titleMatch[1];
        continue;
      }
    }

    if (!ns) {
      const nsMatch = line.match(/<ns>(\d+)<\/ns>/);
      if (nsMatch) {
        ns = nsMatch[1];
        continue;
      }
    }

    if (line.includes("<text")) {
      inText = true;
      if (hasGermanMarker(line)) {
        isGerman = true;
      }
      if (line.includes("</text>")) {
        inText = false;
      }
      continue;
    }

    if (inText) {
      if (!isGerman && hasGermanMarker(line)) {
        isGerman = true;
      }
      if (line.includes("</text>")) {
        inText = false;
      }
    }
  }

  for (let length = MIN_LEN; length <= MAX_LEN; length += 1) {
    const words = Array.from(wordBuckets.get(length) ?? []);
    words.sort((a, b) => collator.compare(a, b));
    await writeWordList(length, words);
    console.log(`Länge ${length}: ${words.length} Wörter`);
  }

  console.log("Fertig. Wortlisten liegen in data/ und data/answers/.");
}

run().catch((error) => {
  console.error("Fehler beim Extrahieren der Wortlisten:", error);
  process.exitCode = 1;
});
