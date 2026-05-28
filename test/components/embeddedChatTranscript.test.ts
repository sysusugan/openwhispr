import assert from "node:assert/strict";
import test from "node:test";

import { selectEmbeddedChatTranscript } from "../../src/components/notes/embeddedChatTranscript.ts";

test("embedded note chat uses live transcript before saved transcript", () => {
  assert.equal(
    selectEmbeddedChatTranscript({
      liveTranscript: "live transcript",
      meetingTranscript: "",
      savedTranscript: "saved transcript",
    }),
    "live transcript"
  );
});

test("embedded note chat falls back to meeting transcript before saved transcript", () => {
  assert.equal(
    selectEmbeddedChatTranscript({
      liveTranscript: "",
      meetingTranscript: "meeting transcript",
      savedTranscript: "saved transcript",
    }),
    "meeting transcript"
  );
});

test("embedded note chat falls back to saved transcript", () => {
  assert.equal(
    selectEmbeddedChatTranscript({
      liveTranscript: "",
      meetingTranscript: "",
      savedTranscript: "saved transcript",
    }),
    "saved transcript"
  );
});
