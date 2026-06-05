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

const { hasNoteAssetImage, selectNoteExportContent } = require("../../src/helpers/noteAssetExport");

Module._load = originalLoad;

test("detects note asset images embedded inside markdown content", () => {
  const content =
    "纪要\n\n主题: demo\n\n![image.png](openwhispr-note-asset://asset-id)会议背景";
  const enhancedContent = "### 摘要\n\n没有图片的增强内容";

  assert.equal(hasNoteAssetImage(content), true);
  assert.equal(hasNoteAssetImage(enhancedContent), false);
  assert.equal(selectNoteExportContent({ content, enhanced_content: enhancedContent }), content);
});
