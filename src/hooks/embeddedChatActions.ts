import type { Message, ToolCallInfo } from "../components/chat/types";

interface PendingRunNoteActionInput {
  actionId: number;
  actionName: string;
  noteId: number;
}

export function createPendingRunNoteActionToolCall({
  actionId,
  actionName,
  noteId,
}: PendingRunNoteActionInput): ToolCallInfo {
  return {
    id: crypto.randomUUID(),
    name: "run_note_action",
    arguments: JSON.stringify({ actionId }),
    status: "completed",
    result: `Confirm action: "${actionName}"`,
    metadata: {
      confirmationRequired: true,
      confirmationStatus: "pending",
      confirmationType: "run_note_action",
      payload: {
        actionId,
        noteId,
      },
    },
  };
}

export function getLastWritableAssistantContent(messages: Message[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "assistant" || message.isStreaming) continue;
    const content = message.content.trim();
    if (content) return content;
  }
  return null;
}

export function expireLoadedPendingConfirmations(toolCalls: ToolCallInfo[]): ToolCallInfo[] {
  let changed = false;
  const next = toolCalls.map((toolCall) => {
    const metadata = toolCall.metadata;
    if (
      metadata?.confirmationRequired !== true ||
      metadata.confirmationStatus !== "pending"
    ) {
      return toolCall;
    }

    changed = true;
    return {
      ...toolCall,
      metadata: {
        ...metadata,
        confirmationRequired: false,
        confirmationStatus: "expired",
      },
    };
  });

  return changed ? next : toolCalls;
}
