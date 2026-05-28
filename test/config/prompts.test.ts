import assert from "node:assert/strict";
import test from "node:test";

import { getNoteContextInstruction } from "../../src/config/agentPromptContext.ts";

test("agent prompt prioritizes current note context before searching other notes", () => {
  const prompt = getNoteContextInstruction();

  assert.match(prompt, /current note context/i);
  assert.match(prompt, /Use search_notes only when the user asks about other notes/i);
});
