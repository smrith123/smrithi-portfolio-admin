import assert from "node:assert/strict";
import test from "node:test";
import { isBlankHeading, linesToText, textToLines } from "./heading.js";
import type { HeadingLine } from "./types.js";

/** The headings the site actually ships, straight from the seeded content. */
const realHeadings: HeadingLine[][] = [
  [[{ text: "Work that" }], [{ text: "hits different", accent: true }]],
  [[{ text: "on the " }, { text: "mic.", accent: true }]],
  [[{ text: "the" }], [{ text: "glow" }], [{ text: "up" }], [{ text: "timeline", accent: true }]],
  [
    [{ text: "Digital" }],
    [{ text: "Marketing", accent: "mobile" }],
    [{ text: "Team Leader", accent: true }],
    [{ text: "& Specialist", accent: true }],
  ],
];

test("every shipped heading survives a round trip through the editor", () => {
  for (const lines of realHeadings) {
    assert.deepEqual(textToLines(linesToText(lines)), lines);
  }
});

test("the asterisk and underscore markers map to the right colours", () => {
  assert.deepEqual(textToLines("let's *build* it"), [
    [{ text: "let's " }, { text: "build", accent: true }, { text: " it" }],
  ]);
  assert.deepEqual(textToLines("_Marketing_"), [[{ text: "Marketing", accent: "mobile" }]]);
  assert.equal(linesToText([[{ text: "a" }, { text: "b", accent: true }]]), "a*b*");
});

test("an empty line never produces an empty run list", () => {
  // A line with no parts would fail the backend's `.min(1)` validation.
  for (const line of textToLines("first\n\nthird")) assert.ok(line.length > 0);
  assert.equal(textToLines("solo").length, 1);
});

test("a heading is blank only when no line has visible text", () => {
  assert.equal(isBlankHeading(textToLines("")), true);
  assert.equal(isBlankHeading(textToLines("\n   \n")), true);
  assert.equal(isBlankHeading(textToLines("**")), false); // literal asterisks are visible text
  assert.equal(isBlankHeading(textToLines("\n*Platform*")), false);
  for (const lines of realHeadings) assert.equal(isBlankHeading(lines), false);
});

test("unpaired markers stay literal text rather than swallowing the line", () => {
  assert.deepEqual(textToLines("2 * 3 = 6"), [[{ text: "2 * 3 = 6" }]]);
});
