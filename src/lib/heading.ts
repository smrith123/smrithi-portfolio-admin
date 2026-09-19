import type { HeadingLine } from "./types";

/**
 * Display headings are structured (lines of text runs, some painted pink), but
 * nobody wants to edit nested arrays. The admin shows one line per row and
 * marks a pink run with *asterisks*; _underscores_ mark a run that is pink on
 * mobile only, which one career card needs.
 */
export function linesToText(lines: HeadingLine[]): string {
  return lines
    .map((line) =>
      line
        .map((part) => (part.accent === true ? `*${part.text}*` : part.accent === "mobile" ? `_${part.text}_` : part.text))
        .join(""),
    )
    .join("\n");
}

export function textToLines(value: string): HeadingLine[] {
  return value
    .split("\n")
    .map((row) => row.trimEnd())
    .filter((row, i, all) => row.length > 0 || i < all.length - 1)
    .map((row) => {
      const parts: HeadingLine = [];
      // Split on *pink* and _mobile-pink_ runs, keeping the delimiters.
      for (const chunk of row.split(/(\*[^*]+\*|_[^_]+_)/g)) {
        if (!chunk) continue;
        if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2) {
          parts.push({ text: chunk.slice(1, -1), accent: true });
        } else if (chunk.startsWith("_") && chunk.endsWith("_") && chunk.length > 2) {
          parts.push({ text: chunk.slice(1, -1), accent: "mobile" });
        } else {
          parts.push({ text: chunk });
        }
      }
      return parts.length ? parts : [{ text: "" }];
    })
    .filter((line) => line.length > 0);
}

/** Mirrors the backend's "The heading can't be empty" rule, so the form can say so before saving. */
export const isBlankHeading = (lines: HeadingLine[]) => !lines.some((line) => line.some((part) => part.text.trim()));

/** Stable ids for newly added list items. */
export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : String(Date.now());
