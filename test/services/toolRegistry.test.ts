import assert from "node:assert/strict";
import test from "node:test";

import { ToolRegistry } from "../../src/services/tools/ToolRegistry.ts";

test("AI SDK tool wrapper preserves displayText for successful tool results", async () => {
  const registry = new ToolRegistry();
  registry.register({
    name: "search_notes",
    description: "Search notes",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    readOnly: true,
    execute: async () => ({
      success: true,
      data: [{ id: 1, title: "Budget" }],
      displayText: 'Found 1 note for "budget"',
    }),
  });

  const tools = registry.toAISDKFormat();
  const output = await (tools.search_notes as any).execute({});

  assert.deepEqual(output, {
    success: true,
    data: [{ id: 1, title: "Budget" }],
    displayText: 'Found 1 note for "budget"',
  });
});

test("AI SDK tool wrapper preserves displayText for failed tool results", async () => {
  const registry = new ToolRegistry();
  registry.register({
    name: "search_notes",
    description: "Search notes",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    readOnly: true,
    execute: async () => ({
      success: false,
      data: null,
      displayText: "Search failed",
    }),
  });

  const tools = registry.toAISDKFormat();
  const output = await (tools.search_notes as any).execute({});

  assert.deepEqual(output, {
    success: false,
    data: null,
    displayText: "Search failed",
    error: "Search failed",
  });
});
