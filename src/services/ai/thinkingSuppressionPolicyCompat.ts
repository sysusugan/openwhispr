export function applyThinkingSuppressionFields(
  requestBody: Record<string, unknown>,
  providerKey: string
): void {
  if (providerKey === "local" || providerKey === "lan") {
    requestBody.think = false;
  }

  requestBody.chat_template_kwargs = { enable_thinking: false };
}

export function getGroqProviderOptions(needsDisableThinking: boolean): undefined {
  if (!needsDisableThinking) return undefined;
  return undefined;
}
