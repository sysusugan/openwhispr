import assert from "node:assert/strict";
import test from "node:test";

import {
  errorToMessage,
  formatToolErrorStreamChunk,
  formatToolResultStreamChunk,
} from "../../src/services/agentToolStream.ts";

test("formats wrapped tool output with display text instead of Done", () => {
  const chunk = formatToolResultStreamChunk({
    toolCallId: "call-1",
    toolName: "search_notes",
    output: {
      success: true,
      data: [{ id: 7, title: "Budget note" }],
      displayText: 'Found 1 note for "budget"',
    },
  });

  assert.deepEqual(chunk, {
    type: "tool_result",
    callId: "call-1",
    toolName: "search_notes",
    displayText: 'Found 1 note for "budget"',
  });
});

test("exposes object tool output data as metadata for note cards", () => {
  const chunk = formatToolResultStreamChunk({
    toolCallId: "call-2",
    toolName: "get_note",
    output: {
      success: true,
      data: { id: 12, title: "Meeting note" },
      displayText: 'Retrieved note: "Meeting note"',
    },
  });

  assert.deepEqual(chunk, {
    type: "tool_result",
    callId: "call-2",
    toolName: "get_note",
    displayText: 'Retrieved note: "Meeting note"',
    metadata: { id: 12, title: "Meeting note" },
  });
});

test("formats tool errors as error tool results", () => {
  const chunk = formatToolErrorStreamChunk({
    toolCallId: "call-3",
    toolName: "search_notes",
    error: new Error("Search backend unavailable"),
  });

  assert.deepEqual(chunk, {
    type: "tool_result",
    callId: "call-3",
    toolName: "search_notes",
    displayText: "Search backend unavailable",
    isError: true,
  });
});

test("normalizes stream errors", () => {
  assert.equal(
    errorToMessage(new Error("Provider rejected tool result")),
    "Provider rejected tool result"
  );
  assert.equal(errorToMessage("plain error"), "plain error");
});
