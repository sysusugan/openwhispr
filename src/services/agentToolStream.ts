export interface AgentToolResultChunk {
  type: "tool_result";
  callId: string;
  toolName: string;
  displayText: string;
  metadata?: Record<string, unknown>;
  isError?: boolean;
}

interface ToolResultLikeChunk {
  toolCallId: string;
  toolName: string;
  output: unknown;
}

interface ToolErrorLikeChunk {
  toolCallId: string;
  toolName: string;
  error: unknown;
}

const MAX_FALLBACK_DISPLAY_LENGTH = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function errorToMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (isRecord(error) && typeof error.message === "string") return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function summarizeOutput(output: unknown): string {
  if (typeof output === "string") return output;
  try {
    const json = JSON.stringify(output);
    if (!json) return "Tool completed";
    return json.length > MAX_FALLBACK_DISPLAY_LENGTH
      ? `${json.slice(0, MAX_FALLBACK_DISPLAY_LENGTH)}...`
      : json;
  } catch {
    return String(output);
  }
}

export function formatToolResultStreamChunk({
  toolCallId,
  toolName,
  output,
}: ToolResultLikeChunk): AgentToolResultChunk {
  if (!isRecord(output)) {
    return {
      type: "tool_result",
      callId: toolCallId,
      toolName,
      displayText: summarizeOutput(output),
    };
  }

  const outputError = output.error;
  const displayText =
    typeof output.displayText === "string"
      ? output.displayText
      : outputError != null
        ? errorToMessage(outputError)
        : summarizeOutput(output.data ?? output);
  const metadata = isRecord(output.data) ? output.data : undefined;
  const isError = output.success === false || outputError != null;

  return {
    type: "tool_result",
    callId: toolCallId,
    toolName,
    displayText,
    ...(metadata ? { metadata } : {}),
    ...(isError ? { isError: true } : {}),
  };
}

export function formatToolErrorStreamChunk({
  toolCallId,
  toolName,
  error,
}: ToolErrorLikeChunk): AgentToolResultChunk {
  return {
    type: "tool_result",
    callId: toolCallId,
    toolName,
    displayText: errorToMessage(error),
    isError: true,
  };
}
