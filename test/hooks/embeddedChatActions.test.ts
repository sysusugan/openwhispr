import assert from "node:assert/strict";
import test from "node:test";

import {
  createPendingRunNoteActionToolCall,
  expireLoadedPendingConfirmations,
  getLastWritableAssistantContent,
} from "../../src/hooks/embeddedChatActions.ts";
import type { Message } from "../../src/components/chat/types.ts";

test("action button creates a pending run_note_action tool call for the current note", () => {
  const toolCall = createPendingRunNoteActionToolCall({
    actionId: 12,
    actionName: "总结会议",
    noteId: 34,
  });

  assert.equal(toolCall.name, "run_note_action");
  assert.equal(toolCall.status, "completed");
  assert.equal(toolCall.result, 'Confirm action: "总结会议"');
  assert.deepEqual(toolCall.metadata, {
    confirmationRequired: true,
    confirmationStatus: "pending",
    confirmationType: "run_note_action",
    payload: {
      actionId: 12,
      noteId: 34,
    },
  });
});

test("write shortcuts use the last completed assistant message only", () => {
  const messages: Message[] = [
    { id: "u1", role: "user", content: "question", isStreaming: false },
    { id: "a1", role: "assistant", content: "first answer", isStreaming: false },
    { id: "a2", role: "assistant", content: "streaming answer", isStreaming: true },
    { id: "a3", role: "assistant", content: "final answer", isStreaming: false },
  ];

  assert.equal(getLastWritableAssistantContent(messages), "final answer");
});

test("write shortcuts ignore empty and streaming assistant messages", () => {
  const messages: Message[] = [
    { id: "a1", role: "assistant", content: " ", isStreaming: false },
    { id: "a2", role: "assistant", content: "in progress", isStreaming: true },
  ];

  assert.equal(getLastWritableAssistantContent(messages), null);
});

test("loaded pending confirmation tool calls expire instead of staying actionable", () => {
  const pending = createPendingRunNoteActionToolCall({
    actionId: 12,
    actionName: "总结会议",
    noteId: 34,
  });

  const [expired] = expireLoadedPendingConfirmations([pending]);

  assert.notEqual(expired, pending);
  assert.equal(expired.metadata?.confirmationStatus, "expired");
  assert.equal(expired.metadata?.confirmationRequired, false);
});

test("loaded non-pending confirmation tool calls are preserved", () => {
  const pending = createPendingRunNoteActionToolCall({
    actionId: 12,
    actionName: "总结会议",
    noteId: 34,
  });
  const confirmed = {
    ...pending,
    metadata: {
      ...pending.metadata,
      confirmationStatus: "confirmed",
    },
  };

  const [loaded] = expireLoadedPendingConfirmations([confirmed]);

  assert.equal(loaded, confirmed);
});
