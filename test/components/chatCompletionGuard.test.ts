import assert from "node:assert/strict";
import test from "node:test";

import { isMissingFinalAnswerAfterToolResult } from "../../src/components/chat/chatCompletionGuard.ts";

test("flags a tool call that never receives final content after the tool result", () => {
  assert.equal(
    isMissingFinalAnswerAfterToolResult({
      toolCalls: [{ name: "search_notes" }],
      sawToolResult: true,
      contentAfterToolResult: "",
    }),
    true
  );
});

test("allows a tool call when the model answers after the tool result", () => {
  assert.equal(
    isMissingFinalAnswerAfterToolResult({
      toolCalls: [{ name: "search_notes" }],
      sawToolResult: true,
      contentAfterToolResult: "这里是基于笔记的会议纪要。",
    }),
    false
  );
});

test("does not flag ordinary empty responses without tool results", () => {
  assert.equal(
    isMissingFinalAnswerAfterToolResult({
      toolCalls: [],
      sawToolResult: false,
      contentAfterToolResult: "",
    }),
    false
  );
});

test("does not flag action-only tools whose result is the final user-visible outcome", () => {
  for (const name of ["copy_to_clipboard", "create_note", "update_note"]) {
    assert.equal(
      isMissingFinalAnswerAfterToolResult({
        toolCalls: [{ name }],
        sawToolResult: true,
        contentAfterToolResult: "",
      }),
      false,
      name
    );
  }
});
