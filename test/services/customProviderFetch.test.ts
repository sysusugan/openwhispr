import assert from "node:assert/strict";
import test from "node:test";

import {
  createCustomProviderFetch,
  patchDeepSeekThinkingForTools,
  shouldPatchDeepSeekThinkingForTools,
} from "../../src/services/ai/customProviderFetch.ts";

test("detects DeepSeek thinking models for custom tool requests", () => {
  assert.equal(
    shouldPatchDeepSeekThinkingForTools({
      baseURL: "https://api.deepseek.com/v1",
      model: "deepseek-v4-pro",
      hasTools: true,
    }),
    true
  );
});

test("does not patch non-DeepSeek custom providers", () => {
  assert.equal(
    shouldPatchDeepSeekThinkingForTools({
      baseURL: "https://example.com/v1",
      model: "gpt-compatible-model",
      hasTools: true,
    }),
    false
  );
});

test("does not patch custom requests when tools are not enabled", () => {
  assert.equal(
    shouldPatchDeepSeekThinkingForTools({
      baseURL: "https://api.deepseek.com/v1",
      model: "deepseek-v4-pro",
      hasTools: false,
    }),
    false
  );
});

test("patch adds disabled thinking mode and clears reasoning effort", () => {
  const body: Record<string, unknown> = {
    model: "deepseek-v4-pro",
    reasoning_effort: "high",
  };

  patchDeepSeekThinkingForTools(body);

  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.equal("reasoning_effort" in body, false);
});

test("custom provider fetch patches JSON request bodies", async () => {
  const fetchImpl = createCustomProviderFetch({
    baseURL: "https://api.deepseek.com/v1",
    model: "deepseek-v4-pro",
    hasTools: true,
    fetchImpl: async (_input, init) =>
      new Response(init?.body ?? "{}", {
        headers: { "content-type": "application/json" },
      }),
  });

  const response = await fetchImpl("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({ model: "deepseek-v4-pro", tools: [] }),
  });

  const body = await response.json();
  assert.deepEqual(body.thinking, { type: "disabled" });
});
