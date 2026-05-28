interface DeepSeekThinkingPatchInput {
  baseURL?: string;
  model: string;
  hasTools: boolean;
}

interface CustomProviderFetchInput extends DeepSeekThinkingPatchInput {
  fetchImpl?: typeof fetch;
}

function isDeepSeekBaseURL(baseURL?: string): boolean {
  if (!baseURL) return false;
  try {
    return new URL(baseURL).hostname.toLowerCase().includes("deepseek");
  } catch {
    return baseURL.toLowerCase().includes("deepseek");
  }
}

function isDeepSeekThinkingModel(model: string): boolean {
  return /deepseek-(reasoner|v4)/i.test(model);
}

export function shouldPatchDeepSeekThinkingForTools({
  baseURL,
  model,
  hasTools,
}: DeepSeekThinkingPatchInput): boolean {
  return hasTools && (isDeepSeekBaseURL(baseURL) || isDeepSeekThinkingModel(model));
}

export function patchDeepSeekThinkingForTools(body: Record<string, unknown>): void {
  body.thinking = { type: "disabled" };
  delete body.reasoning_effort;
}

export function createCustomProviderFetch({
  baseURL,
  model,
  hasTools,
  fetchImpl = globalThis.fetch.bind(globalThis),
}: CustomProviderFetchInput): typeof fetch | undefined {
  if (!shouldPatchDeepSeekThinkingForTools({ baseURL, model, hasTools })) return undefined;

  return async (input, init) => {
    if (typeof init?.body !== "string") {
      return fetchImpl(input, init);
    }

    try {
      const body = JSON.parse(init.body) as Record<string, unknown>;
      patchDeepSeekThinkingForTools(body);
      return fetchImpl(input, { ...init, body: JSON.stringify(body) });
    } catch {
      return fetchImpl(input, init);
    }
  };
}
