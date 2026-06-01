import assert from "node:assert/strict";
import test from "node:test";

import {
  assignSelectedTranscriptSegments,
  assignSpeakerGroupName,
  getTranscriptSpeakerDisplay,
} from "../../src/utils/speakerAssignment.ts";

const labels = { you: "你", speaker: (n: number) => `发言人 ${n}` };

test("manual speaker names override the default self label", () => {
  const display = getTranscriptSpeakerDisplay(
    {
      id: "seg-1",
      text: "hello",
      source: "mic",
      speaker: "you",
      speakerName: "Vicky",
    },
    {},
    labels
  );

  assert.equal(display.label, "Vicky");
  assert.equal(display.isSelf, false);
});

test("selected segment assignment only changes selected segments", () => {
  const segments = [
    { id: "seg-1", text: "first", source: "mic" as const, speaker: "you" },
    { id: "seg-2", text: "second", source: "mic" as const, speaker: "you" },
  ];

  const next = assignSelectedTranscriptSegments(segments, new Set(["seg-1"]), "Vicky");

  assert.equal(next[0].speakerName, "Vicky");
  assert.equal(next[0].speakerLocked, true);
  assert.equal(next[0].speakerLockSource, "user");
  assert.equal(next[1].speakerName, undefined);
  assert.equal(next[1].speakerLocked, undefined);
});

test("speaker group assignment renames every segment with the same speaker id", () => {
  const segments = [
    { id: "seg-1", text: "first", source: "system" as const, speaker: "speaker_0" },
    { id: "seg-2", text: "second", source: "system" as const, speaker: "speaker_1" },
    { id: "seg-3", text: "third", source: "system" as const, speaker: "speaker_0" },
  ];

  const next = assignSpeakerGroupName(segments, "speaker_0", "苏金");

  assert.equal(next[0].speakerName, "苏金");
  assert.equal(next[1].speakerName, undefined);
  assert.equal(next[2].speakerName, "苏金");
  assert.equal(next[0].speakerLocked, true);
  assert.equal(next[2].speakerLockSource, "user");
});
