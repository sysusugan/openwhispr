import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countMatches, replaceAllMatches } from "./transcriptFindReplace.ts";

describe("transcriptFindReplace", () => {
  it("counts case-insensitive matches by default", () => {
    assert.equal(countMatches("OpenWhispr openwhispr OPENWHISPR", "openwhispr"), 3);
  });

  it("can count case-sensitive matches", () => {
    assert.equal(
      countMatches("OpenWhispr openwhispr OPENWHISPR", "openwhispr", {
        ignoreCase: false,
      }),
      1
    );
  });

  it("replaces all matches while escaping plain-text search input", () => {
    assert.equal(
      replaceAllMatches("Use a.b and A.B carefully", "a.b", "term"),
      "Use term and term carefully"
    );
  });
});
