const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildMeetingAudioFilename,
  isRetainedAudioFile,
} = require("../../src/helpers/audioStorageFiles");

test("buildMeetingAudioFilename namespaces meeting note audio", () => {
  const filename = buildMeetingAudioFilename(42, new Date(2026, 4, 28, 6, 7, 8));

  assert.match(filename, /^OpenWhispr-meeting-2026-05-28-06-07-08-42\.wav$/);
});

test("isRetainedAudioFile includes dictation webm and meeting wav files", () => {
  assert.equal(isRetainedAudioFile("OpenWhispr-2026-05-28-06-07-08-1.webm"), true);
  assert.equal(isRetainedAudioFile("OpenWhispr-meeting-2026-05-28-06-07-08-42.wav"), true);
  assert.equal(isRetainedAudioFile("notes.txt"), false);
});
