const test = require("node:test");
const assert = require("node:assert/strict");

const en = require("../../src/locales/en/translation.json");
const zhCN = require("../../src/locales/zh-CN/translation.json");

test("speech-to-text tab scope hints explain affected features", () => {
  assert.equal(
    en.settingsPage.speechToText.scopeHints.dictation,
    "Affects: hotkey dictation and file transcription on the Upload page."
  );
  assert.equal(
    en.settingsPage.speechToText.scopeHints.noteRecording,
    "Affects: note recordings; does not affect file transcription on the Upload page."
  );

  assert.equal(
    zhCN.settingsPage.speechToText.scopeHints.dictation,
    "影响：快捷键听写、上传页文件转录。"
  );
  assert.equal(
    zhCN.settingsPage.speechToText.scopeHints.noteRecording,
    "影响：笔记里的录音转写；不影响上传页文件转录。"
  );
});
