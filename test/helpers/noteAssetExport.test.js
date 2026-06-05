const assert = require("node:assert/strict");
const Module = require("node:module");
const test = require("node:test");

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "electron") {
    return {
      app: { getPath: () => "/tmp/openwhispr-test-user-data" },
      net: {},
      protocol: {},
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const {
  appendUnreferencedNoteAssets,
  hasNoteAssetImage,
  markdownToHtml,
  selectNoteExportContent,
} = require("../../src/helpers/noteAssetExport");

Module._load = originalLoad;

test("detects note asset images embedded inside markdown content", () => {
  const content = "纪要\n\n主题: demo\n\n![image.png](openwhispr-note-asset://asset-id)会议背景";
  const enhancedContent = "### 摘要\n\n没有图片的增强内容";

  assert.equal(hasNoteAssetImage(content), true);
  assert.equal(hasNoteAssetImage(enhancedContent), false);
  assert.equal(selectNoteExportContent({ content, enhanced_content: enhancedContent }), content);
});

test("appends note assets when editor markdown lost image references", () => {
  const content = "纪要\n\n会议背景";
  const databaseManager = {
    getNoteAssets: () => [
      { id: "asset-a", filename: "image.png" },
      { id: "asset-b", filename: "diagram.png" },
    ],
  };

  const result = appendUnreferencedNoteAssets(content, databaseManager, 34);

  assert.match(result, /!\[image\.png\]\(openwhispr-note-asset:\/\/asset-a\)/);
  assert.match(result, /!\[diagram\.png\]\(openwhispr-note-asset:\/\/asset-b\)/);
});

test("renders pipe tables to HTML tables for note export", () => {
  const html = markdownToHtml(
    ["## 进度", "", "| 项目 | 状态 |", "| --- | ---: |", "| A | 完成 |", "| B | 进行中 |"].join(
      "\n"
    ),
    "Demo"
  );

  assert.match(html, /<table>/);
  assert.match(html, /<th>项目<\/th>/);
  assert.match(html, /<th style="text-align:right">状态<\/th>/);
  assert.match(html, /<td>A<\/td>/);
  assert.match(html, /<td style="text-align:right">完成<\/td>/);
});
