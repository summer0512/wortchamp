import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { WordLength } from "@/constants/wordlist-metadata";
import { DEFAULT_ACCENT_MODE, isSupportedWordLength, type AccentMode } from "@/lib/words";
import { getDailySolution, getRandomSolution } from "@/lib/wordlists.server";
import { DEFAULT_REGION_MODE, type RegionMode } from "@/lib/region";

type SolutionMode = "daily" | "infinite";

const isSolutionMode = (value: string | null): value is SolutionMode => {
  return value === "daily" || value === "infinite";
};

const isAccentMode = (value: string | null): value is AccentMode => {
  return value === "plain" || value === "accented";
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ length: string }> }) {
  const { length } = await params;
  const lengthValue = Number.parseInt(length, 10);

  if (!isSupportedWordLength(lengthValue)) {
    return NextResponse.json({ error: "Wortlänge nicht unterstützt" }, { status: 400 });
  }

  const wordLength = lengthValue as WordLength;
  const modeParam = request.nextUrl.searchParams.get("mode");
  const mode: SolutionMode = isSolutionMode(modeParam) ? modeParam : "daily";
  const regionParam = request.nextUrl.searchParams.get("region");
  const region: RegionMode = regionParam === "ch" ? "ch" : DEFAULT_REGION_MODE;
  const accentParam = request.nextUrl.searchParams.get("accent");
  const accentMode: AccentMode = isAccentMode(accentParam) ? accentParam : DEFAULT_ACCENT_MODE;

  try {
    const solution =
      mode === "daily"
        ? await getDailySolution(wordLength, region, accentMode)
        : await getRandomSolution(wordLength, region);

    return NextResponse.json(
      { solution, mode },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to resolve game solution:", error);
    return NextResponse.json({ error: "Lösung konnte nicht erzeugt werden" }, { status: 500 });
  }
}
