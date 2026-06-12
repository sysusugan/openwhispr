import assert from "node:assert/strict";
import test from "node:test";

import {
  offsetAppendedTranscriptSegments,
  resolveNoteActionTranscript,
} from "../../src/utils/meetingTranscriptTimeline.ts";

test("resolved action transcript uses persisted transcript after recording stops", () => {
  const result = resolveNoteActionTranscript({
    isActiveNoteRecording: false,
    realtimeTranscript: "last short recording",
    persistedTranscript: '[{"text":"full transcript"}]',
  });

  assert.equal(result, '[{"text":"full transcript"}]');
});

test("resolved action transcript uses realtime transcript only for active recording", () => {
  const result = resolveNoteActionTranscript({
    isActiveNoteRecording: true,
    realtimeTranscript: "live transcript",
    persistedTranscript: '[{"text":"old transcript"}]',
  });

  assert.equal(result, "live transcript");
});

test("offsets appended recording segments after the existing timeline", () => {
  const seedSegments = [{ id: "old-1", text: "old", source: "system" as const, timestamp: 162 }];
  const recordingStartedAt = 1_800_000_000_000;
  const segments = [
    ...seedSegments,
    {
      id: "new-1",
      text: "new one",
      source: "system" as const,
      timestamp: recordingStartedAt + 6000,
    },
    {
      id: "new-2",
      text: "new two",
      source: "system" as const,
      timestamp: recordingStartedAt + 12000,
    },
  ];

  const result = offsetAppendedTranscriptSegments(segments, seedSegments, recordingStartedAt);

  assert.equal(result[0].timestamp, 162);
  assert.equal(result[1].timestamp, 163);
  assert.equal(result[2].timestamp, 169);
});
