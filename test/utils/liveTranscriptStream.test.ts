import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLiveTranscriptItems,
  stripRealtimeSpeakerMetadata,
} from "../../src/utils/liveTranscriptStream.ts";

test("live transcript items only expose text and pending state", () => {
  const items = buildLiveTranscriptItems(
    [
      {
        id: "seg-1",
        text: "第一句已经识别",
        source: "system" as const,
        timestamp: 14,
        speaker: "speaker_0",
        speakerName: "苏金",
      },
    ],
    "麦克风实时片段",
    "系统实时片段"
  );

  assert.deepEqual(items, [
    { id: "seg-1", text: "第一句已经识别", pending: false },
    { id: "partial-0", text: "麦克风实时片段", pending: true },
    { id: "partial-1", text: "系统实时片段", pending: true },
  ]);
  assert.equal("speaker" in items[0], false);
  assert.equal("speakerName" in items[0], false);
});

test("realtime transcript segments strip speaker metadata until final diarization", () => {
  const segment = stripRealtimeSpeakerMetadata({
    id: "seg-1",
    text: "实时识别文本",
    source: "system",
    timestamp: 19,
    speaker: "speaker_0",
    speakerName: "你",
    speakerIsPlaceholder: true,
    speakerStatus: "provisional",
    speakerLocked: true,
    speakerLockSource: "user",
    suggestedName: "候选人",
    suggestedProfileId: 42,
  });

  assert.deepEqual(segment, {
    id: "seg-1",
    text: "实时识别文本",
    source: "system",
    timestamp: 19,
  });
});
