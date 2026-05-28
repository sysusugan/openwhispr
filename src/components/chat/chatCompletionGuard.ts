interface MissingFinalAnswerInput {
  toolCalls?: Array<{ name: string }>;
  sawToolResult: boolean;
  contentAfterToolResult: string;
}

const TOOLS_REQUIRING_FINAL_ANSWER = new Set([
  "search_notes",
  "get_note",
  "web_search",
  "get_calendar_events",
]);

export function isMissingFinalAnswerAfterToolResult({
  toolCalls,
  sawToolResult,
  contentAfterToolResult,
}: MissingFinalAnswerInput): boolean {
  const requiresFinalAnswer =
    toolCalls?.some((toolCall) => TOOLS_REQUIRING_FINAL_ANSWER.has(toolCall.name)) ?? false;

  return requiresFinalAnswer && sawToolResult && contentAfterToolResult.trim().length === 0;
}
