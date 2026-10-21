#!/usr/bin/env python3
"""Filter word lists by Zipf frequency.

Defaults: allowed >=1.0, answers >=3.0.

Zipf values can come from the Python package "wordfreq" (recommended)
or from a local frequency file.

Frequency file format (TSV/CSV):
  word<TAB>zipf
  word,zipf
Comments (# ...) and blank lines are ignored.
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path
from typing import Callable, Dict, Iterable, Tuple

DEFAULT_DEPS_PATH = Path("dictionary") / ".deps"


def load_freq_table(freq_path: Path) -> Dict[str, float]:
    table: Dict[str, float] = {}
    with freq_path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "\t" in line:
                parts = line.split("\t")
            elif "," in line:
                parts = line.split(",")
            else:
                parts = line.split()
            if len(parts) < 2:
                continue
            word = parts[0].strip()
            try:
                value = float(parts[1])
            except ValueError:
                continue
            if not word:
                continue
            table[word.lower()] = value
    return table


def get_zipf_from_wordfreq(deps_path: Path | None = None) -> Callable[[str], float] | None:
    try:
        from wordfreq import zipf_frequency
    except Exception:
        if deps_path and deps_path.exists():
            sys.path.insert(0, str(deps_path.resolve()))
            try:
                from wordfreq import zipf_frequency  # type: ignore
            except Exception:
                return None
        else:
            return None

    def _zipf(word: str) -> float:
        return float(zipf_frequency(word, "de"))

    return _zipf


def get_zipf_from_table(table: Dict[str, float]) -> Callable[[str], float]:
    def _zipf(word: str) -> float:
        return float(table.get(word.lower(), 0.0))

    return _zipf


def read_word_list(path: Path) -> Tuple[str, ...]:
    return tuple(
        line.strip().lower()
        for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    )


def write_word_list(path: Path, words: Iterable[str]) -> None:
    payload = "\n".join(words) + "\n"
    path.write_text(payload, encoding="utf-8")


def filter_words(words: Iterable[str], min_zipf: float, zipf: Callable[[str], float]) -> Tuple[list[str], int]:
    kept: list[str] = []
    removed = 0
    for word in words:
        score = zipf(word)
        if score >= min_zipf:
            kept.append(word)
        else:
            removed += 1
    return kept, removed


def run() -> int:
    parser = argparse.ArgumentParser(description="Filter word lists by Zipf values.")
    parser.add_argument("--data-dir", default="data", help="Directory for allowed word lists (default: data)")
    parser.add_argument("--answers-dir", default="data/answers", help="Directory for answer word lists (default: data/answers)")
    parser.add_argument("--allowed", type=float, default=1.0, help="Minimum Zipf for allowed words")
    parser.add_argument("--answers", type=float, default=3.0, help="Minimum Zipf for answer words (default)")
    parser.add_argument(
        "--answers-short",
        type=float,
        default=None,
        help="Optional Zipf threshold for short words (<= short-max).",
    )
    parser.add_argument(
        "--answers-long",
        type=float,
        default=None,
        help="Optional Zipf threshold for long words (> short-max).",
    )
    parser.add_argument(
        "--short-max",
        type=int,
        default=5,
        help="Max length treated as short when using --answers-short/--answers-long.",
    )
    parser.add_argument("--freq-file", default=None, help="Path to a frequency file (TSV/CSV). Optional if wordfreq is installed.")
    parser.add_argument("--deps-path", default=str(DEFAULT_DEPS_PATH), help="Optional path to a local deps folder that contains wordfreq.")
    parser.add_argument("--dry-run", action="store_true", help="Print stats only, do not overwrite files.")

    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    answers_dir = Path(args.answers_dir)

    deps_path = Path(args.deps_path) if args.deps_path else None
    zipf_func = get_zipf_from_wordfreq(deps_path)
    table: Dict[str, float] | None = None

    if zipf_func is None:
        if not args.freq_file:
            print(
                "wordfreq is not installed and no --freq-file was provided.\n"
                "Options:\n"
                "1) install wordfreq (pip install wordfreq)\n"
                "2) provide a frequency file and pass --freq-file <path>.",
                file=sys.stderr,
            )
            return 1
        freq_path = Path(args.freq_file)
        if not freq_path.exists():
            print(f"Frequency file not found: {freq_path}", file=sys.stderr)
            return 1
        table = load_freq_table(freq_path)
        zipf_func = get_zipf_from_table(table)

    allowed_threshold = float(args.allowed)
    default_answers_threshold = float(args.answers)
    short_answers_threshold = float(args.answers_short) if args.answers_short is not None else None
    long_answers_threshold = float(args.answers_long) if args.answers_long is not None else None
    short_max = int(args.short_max)

    if not data_dir.exists() or not answers_dir.exists():
        print("Data directories are missing. Please generate word lists first.", file=sys.stderr)
        return 1

    total_removed_allowed = 0
    total_removed_answers = 0

    for length in range(3, 12):
        key = f"{length:02d}.txt"
        allow_path = data_dir / key
        answers_path = answers_dir / key

        if not allow_path.exists() or not answers_path.exists():
            print(f"Skipping {length}: files missing.")
            continue

        allowed_words = read_word_list(allow_path)
        answer_words = read_word_list(answers_path)

        if short_answers_threshold is not None or long_answers_threshold is not None:
            if length <= short_max:
                answers_threshold = short_answers_threshold if short_answers_threshold is not None else default_answers_threshold
            else:
                answers_threshold = long_answers_threshold if long_answers_threshold is not None else default_answers_threshold
        else:
            answers_threshold = default_answers_threshold

        filtered_allowed, removed_allowed = filter_words(allowed_words, allowed_threshold, zipf_func)
        filtered_answers, removed_answers = filter_words(answer_words, answers_threshold, zipf_func)

        # Ensure all answers stay in the allowed list.
        allowed_set = set(filtered_allowed)
        for word in filtered_answers:
            if word not in allowed_set:
                filtered_allowed.append(word)
                allowed_set.add(word)

        total_removed_allowed += removed_allowed
        total_removed_answers += removed_answers

        if args.dry_run:
            print(
                f"{length} letters: allowed {len(allowed_words)} -> {len(filtered_allowed)} "
                f"(removed {removed_allowed}), answers {len(answer_words)} -> {len(filtered_answers)} "
                f"(removed {removed_answers})"
            )
            continue

        write_word_list(allow_path, filtered_allowed)
        write_word_list(answers_path, filtered_answers)
        print(
            f"{length} letters: allowed {len(allowed_words)} -> {len(filtered_allowed)}, "
            f"answers {len(answer_words)} -> {len(filtered_answers)}"
        )

    if args.dry_run:
        print(f"Total removed: allowed={total_removed_allowed}, answers={total_removed_answers}")

    return 0


if __name__ == "__main__":
    raise SystemExit(run())
