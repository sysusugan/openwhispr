import assert from "node:assert/strict";
import test from "node:test";

import {
  assignSpeakerGroupName,
  buildTranscriptSpeakerBlocks,
  filterTranscriptSegmentsBySpeaker,
  getTranscriptSpeakerDisplay,
  getTranscriptSpeakerFilterOptions,
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

test("speaker filter options are deduped by effective speaker identity", () => {
  const segments = [
    { id: "seg-1", text: "first", source: "mic" as const, speaker: "you" },
    { id: "seg-2", text: "second", source: "system" as const, speaker: "speaker_0" },
    {
      id: "seg-3",
      text: "third",
      source: "system" as const,
      speaker: "speaker_0",
      speakerName: "Vicky",
    },
    { id: "seg-4", text: "fourth", source: "system" as const, speaker: "speaker_1" },
  ];

  const options = getTranscriptSpeakerFilterOptions(segments, { speaker_1: "苏金" }, labels);

  assert.deepEqual(options, [
    { key: "speaker:you", label: "你", colorKey: "you" },
    { key: "speaker:speaker_0", label: "Vicky", colorKey: "speaker_0" },
    { key: "speaker:speaker_1", label: "苏金", colorKey: "speaker_1" },
  ]);
});

test("speaker filter options ignore unresolved provisional placeholder speakers", () => {
  const segments = [
    { id: "seg-1", text: "first", source: "mic" as const, speaker: "you" },
    {
      id: "seg-2",
      text: "second",
      source: "system" as const,
      speaker: "speaker_91",
      speakerIsPlaceholder: true,
      speakerStatus: "provisional" as const,
    },
    {
      id: "seg-3",
      text: "third",
      source: "system" as const,
      speaker: "speaker_0",
      speakerStatus: "confirmed" as const,
    },
  ];

  const options = getTranscriptSpeakerFilterOptions(segments, {}, labels);

  assert.deepEqual(options, [
    { key: "speaker:you", label: "你", colorKey: "you" },
    { key: "speaker:speaker_0", label: "发言人 1", colorKey: "speaker_0" },
  ]);
});

test("speaker filtering only keeps selected effective speakers", () => {
  const segments = [
    { id: "seg-1", text: "first", source: "mic" as const, speaker: "you" },
    { id: "seg-2", text: "second", source: "system" as const, speaker: "speaker_0" },
    { id: "seg-3", text: "third", source: "system" as const, speaker: "speaker_1" },
  ];

  const filtered = filterTranscriptSegmentsBySpeaker(segments, new Set(["speaker:speaker_0"]));
  const none = filterTranscriptSegmentsBySpeaker(segments, new Set());
  const all = filterTranscriptSegmentsBySpeaker(segments, null);

  assert.deepEqual(
    filtered.map((segment) => segment.id),
    ["seg-2"]
  );
  assert.deepEqual(
    none.map((segment) => segment.id),
    []
  );
  assert.deepEqual(
    all.map((segment) => segment.id),
    ["seg-1", "seg-2", "seg-3"]
  );
});

test("transcript speaker blocks merge adjacent segments from the same effective speaker", () => {
  const segments = [
    { id: "seg-1", text: "第一句", source: "system" as const, speaker: "speaker_0", timestamp: 10 },
    { id: "seg-2", text: "第二句", source: "system" as const, speaker: "speaker_0", timestamp: 15 },
    { id: "seg-3", text: "第三句", source: "system" as const, speaker: "speaker_1", timestamp: 20 },
    { id: "seg-4", text: "第四句", source: "system" as const, speaker: "speaker_0", timestamp: 25 },
  ];

  const blocks = buildTranscriptSpeakerBlocks(segments, {}, labels);

  assert.deepEqual(
    blocks.map((block) => ({
      id: block.id,
      text: block.text,
      timestamp: block.timestamp,
      segmentIds: block.segments.map((segment) => segment.id),
      speakerLabel: block.speakerDisplay.label,
    })),
    [
      {
        id: "seg-1",
        text: "第一句 第二句",
        timestamp: 10,
        segmentIds: ["seg-1", "seg-2"],
        speakerLabel: "发言人 1",
      },
      {
        id: "seg-3",
        text: "第三句",
        timestamp: 20,
        segmentIds: ["seg-3"],
        speakerLabel: "发言人 2",
      },
      {
        id: "seg-4",
        text: "第四句",
        timestamp: 25,
        segmentIds: ["seg-4"],
        speakerLabel: "发言人 1",
      },
    ]
  );
});

test("transcript speaker blocks recompute when speaker names change", () => {
  const segments = [
    { id: "seg-1", text: "第一句", source: "system" as const, speaker: "speaker_0" },
    {
      id: "seg-2",
      text: "第二句",
      source: "system" as const,
      speaker: "speaker_1",
      speakerName: "苏金",
    },
  ];

  const before = buildTranscriptSpeakerBlocks(segments, {}, labels);
  const after = buildTranscriptSpeakerBlocks(segments, { speaker_0: "苏金" }, labels);

  assert.deepEqual(
    before.map((block) => block.text),
    ["第一句", "第二句"]
  );
  assert.deepEqual(
    after.map((block) => ({
      text: block.text,
      segmentIds: block.segments.map((segment) => segment.id),
      speakerLabel: block.speakerDisplay.label,
    })),
    [{ text: "第一句 第二句", segmentIds: ["seg-1", "seg-2"], speakerLabel: "苏金" }]
  );
});
