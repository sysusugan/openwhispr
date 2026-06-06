const test = require("node:test");
const assert = require("node:assert/strict");

const {
  applyDictionaryCorrections,
  normalizeDictionaryAliases,
} = require("../../src/utils/dictionaryCorrectionCore.cjs");

test("applies explicit aliases before automatic dictionary matching", () => {
  const result = applyDictionaryCorrections("Antibus 跟 EnlightAI 是配合的关系。", {
    dictionary: ["EntVerse", "EnlightAI"],
    aliases: [{ from: "Antibus", to: "EntVerse" }],
  });

  assert.equal(result.text, "EntVerse 跟 EnlightAI 是配合的关系。");
  assert.deepEqual(result.replacements, [
    { from: "Antibus", to: "EntVerse", kind: "alias" },
  ]);
  assert.equal(result.changed, true);
});

test("normalizes dictionary casing for exact case-insensitive matches", () => {
  const result = applyDictionaryCorrections("entverse 和 Entverse 都要保留品牌写法。", {
    dictionary: ["EntVerse"],
  });

  assert.equal(result.text, "EntVerse 和 EntVerse 都要保留品牌写法。");
  assert.deepEqual(result.replacements, [
    { from: "entverse", to: "EntVerse", kind: "case" },
    { from: "Entverse", to: "EntVerse", kind: "case" },
  ]);
});

test("conservatively corrects near ASR spellings without changing unrelated words", () => {
  const result = applyDictionaryCorrections("Antibus is paired with EnlightAI, but universe stays.", {
    dictionary: ["EntVerse", "EnlightAI"],
  });

  assert.equal(result.text, "EntVerse is paired with EnlightAI, but universe stays.");
  assert.deepEqual(result.replacements, [
    { from: "Antibus", to: "EntVerse", kind: "fuzzy" },
  ]);
});

test("does not rewrite Chinese words or distant English candidates", () => {
  const result = applyDictionaryCorrections("安提巴斯 和 unrelated alpha remain unchanged.", {
    dictionary: ["EntVerse"],
  });

  assert.equal(result.text, "安提巴斯 和 unrelated alpha remain unchanged.");
  assert.deepEqual(result.replacements, []);
  assert.equal(result.changed, false);
});

test("normalizes aliases by trimming, deduping, and requiring dictionary targets", () => {
  assert.deepEqual(
    normalizeDictionaryAliases(
      [
        { from: " Antibus ", to: " EntVerse " },
        { from: "antibus", to: "EntVerse" },
        { from: "bad", to: "Unknown" },
        { from: "", to: "EntVerse" },
      ],
      ["EntVerse"]
    ),
    [{ from: "Antibus", to: "EntVerse" }]
  );
});
