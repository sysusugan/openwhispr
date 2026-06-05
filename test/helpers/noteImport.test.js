const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  buildImportedNoteUpdates,
  readImportedNoteFile,
  shouldReplaceNoteTitle,
} = require("../../src/helpers/noteImport");

test("imported note updates replace default titles and clear stale enhanced content", () => {
  const updates = buildImportedNoteUpdates(
    { title: "Untitled Note", transcript: "existing transcript" },
    { title: "Imported Title", content: "# Imported Title\n\nBody" }
  );

  assert.deepEqual(updates, {
    title: "Imported Title",
    content: "# Imported Title\n\nBody",
    enhanced_content: null,
    enhancement_prompt: null,
    enhanced_at_content_hash: null,
  });
});

test("imported note updates preserve non-default titles", () => {
  const updates = buildImportedNoteUpdates(
    { title: "客户会议" },
    { title: "Imported Title", content: "Body" }
  );

  assert.equal(updates.title, undefined);
  assert.equal(updates.content, "Body");
});

test("readImportedNoteFile reads markdown and derives heading title", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ow-note-import-"));
  const filePath = path.join(dir, "fallback-name.md");
  fs.writeFileSync(filePath, "# Heading Title\n\nBody", "utf8");

  const imported = await readImportedNoteFile(null, 1, filePath);

  assert.equal(imported.title, "Heading Title");
  assert.equal(imported.content, "# Heading Title\n\nBody");
  assert.equal(imported.imageCount, 0);
});

test("shouldReplaceNoteTitle only allows default titles", () => {
  assert.equal(shouldReplaceNoteTitle(""), true);
  assert.equal(shouldReplaceNoteTitle("New note"), true);
  assert.equal(shouldReplaceNoteTitle("无标题笔记"), true);
  assert.equal(shouldReplaceNoteTitle("無題のノート"), true);
  assert.equal(shouldReplaceNoteTitle("正式会议标题"), false);
});
