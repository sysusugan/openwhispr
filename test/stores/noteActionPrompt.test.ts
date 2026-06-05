import assert from "node:assert/strict";
import test from "node:test";

import { buildNoteActionSystemPrompt } from "../../src/stores/noteActionPrompt.ts";

test("ordinary note actions include dictionary instructions", () => {
  const prompt = buildNoteActionSystemPrompt("Clean this note.", {
    isMeetingNote: false,
    customDictionary: ["Universe"],
    uiLanguage: "en",
  });

  assert.match(prompt, /note enhancement assistant/i);
  assert.match(prompt, /Universe/);
  assert.match(prompt, /ASR/i);
});

test("meeting note actions keep action prompt in control of output structure", () => {
  const prompt = buildNoteActionSystemPrompt("Generate transcript chapters.", {
    isMeetingNote: true,
    customDictionary: ["Navy"],
    uiLanguage: "en",
  });

  assert.match(prompt, /dual-speaker transcript/i);
  assert.match(prompt, /Generate transcript chapters/);
  assert.doesNotMatch(prompt, /Key Discussion Points/i);
  assert.doesNotMatch(prompt, /Decisions Made/i);
  assert.doesNotMatch(prompt, /Action Items/i);
  assert.match(prompt, /Navy/);
});
