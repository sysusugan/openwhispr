import assert from "node:assert/strict";
import test from "node:test";

import { buildNoteActionInput } from "../../src/components/notes/noteActionInput.ts";

test("treats any raw transcript as meeting note even without speaker segments", () => {
  const result = buildNoteActionInput({
    noteContent: "",
    rawTranscript: "我们讨论了 Universe 和 Navy",
    speakerLabels: { you: "You", them: "Them" },
  });

  assert.equal(result?.isMeetingNote, true);
  assert.match(result?.content ?? "", /## Meeting Transcript/);
  assert.match(result?.content ?? "", /Universe/);
  assert.notEqual(result?.contentHash, "0-");
});

test("formats structured transcript segments with speaker labels", () => {
  const result = buildNoteActionInput({
    noteContent: "manual note",
    rawTranscript: JSON.stringify([
      { source: "mic", text: "我的观点" },
      { source: "system", text: "对方回应" },
    ]),
    speakerLabels: { you: "You", them: "Them" },
  });

  assert.equal(result?.isMeetingNote, true);
  assert.match(result?.content ?? "", /manual note/);
  assert.match(result?.content ?? "", /You: 我的观点/);
  assert.match(result?.content ?? "", /Them: 对方回应/);
  assert.equal(result?.contentHash, `${result?.content.length}-${result?.content.slice(0, 50)}`);
});

test("includes all structured transcript segments from appended recordings", () => {
  const result = buildNoteActionInput({
    noteContent: "",
    rawTranscript: JSON.stringify([
      { source: "system", text: "第一段两小时会议内容", timestamp: 162 },
      { source: "system", text: "第二段几十秒补充内容", timestamp: 163 },
    ]),
    speakerLabels: { you: "You", them: "Them" },
  });

  assert.match(result?.content ?? "", /第一段两小时会议内容/);
  assert.match(result?.content ?? "", /第二段几十秒补充内容/);
});

test("action content hash changes when transcript changes even if note content is empty", () => {
  const first = buildNoteActionInput({
    noteContent: "",
    rawTranscript: "第一段会议转录",
    speakerLabels: { you: "You", them: "Them" },
  });
  const second = buildNoteActionInput({
    noteContent: "",
    rawTranscript: "第二段会议转录",
    speakerLabels: { you: "You", them: "Them" },
  });

  assert.notEqual(first?.contentHash, second?.contentHash);
});

test("returns null without note content or transcript", () => {
  assert.equal(
    buildNoteActionInput({
      noteContent: "",
      rawTranscript: "",
      speakerLabels: { you: "You", them: "Them" },
    }),
    null
  );
});
