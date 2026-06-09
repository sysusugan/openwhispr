const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createInitialUploadTranscriptionState,
  startUploadTask,
  completeUploadTask,
  failUploadTask,
  resetUploadTask,
  buildUploadTranscriptSegments,
  buildUploadNoteSaveArgs,
} = require("../../src/stores/uploadTranscriptionCore");

test("upload transcription task state survives view remounts until reset", () => {
  const initial = createInitialUploadTranscriptionState();
  const file = {
    name: "meeting.mp3",
    path: "/tmp/meeting.mp3",
    size: "3.2 MB",
    sizeBytes: 3355443,
  };

  const running = startUploadTask(initial, file, { folderId: "7" });
  assert.equal(running.state, "transcribing");
  assert.deepEqual(running.file, file);
  assert.equal(running.selectedFolderId, "7");

  const completed = completeUploadTask(running, {
    result: "hello world",
    noteId: 42,
    folderId: "7",
  });

  const remountedViewState = { ...completed };
  assert.equal(remountedViewState.state, "complete");
  assert.equal(remountedViewState.result, "hello world");
  assert.equal(remountedViewState.noteId, 42);
  assert.deepEqual(remountedViewState.file, file);

  const reset = resetUploadTask(remountedViewState, { defaultFolderId: "1" });
  assert.equal(reset.state, "idle");
  assert.equal(reset.file, null);
  assert.equal(reset.selectedFolderId, "1");
});

test("upload transcription failures preserve selected file for retry", () => {
  const file = {
    name: "lecture.wav",
    path: "/tmp/lecture.wav",
    size: "9.1 MB",
    sizeBytes: 9542041,
  };

  const running = startUploadTask(createInitialUploadTranscriptionState(), file);
  const failed = failUploadTask(running, "whisper-server request timed out");

  assert.equal(failed.state, "error");
  assert.equal(failed.error, "whisper-server request timed out");
  assert.deepEqual(failed.file, file);
  assert.equal(failed.progress, 0);
});

test("upload plain text transcript is converted to a structured timeline segment", () => {
  assert.deepEqual(buildUploadTranscriptSegments("raw uploaded transcript"), [
    {
      id: "upload-0",
      text: "raw uploaded transcript",
      source: "system",
      timestamp: 0,
      speaker: "speaker_0",
      speakerIsPlaceholder: true,
    },
  ]);
});

test("upload transcript builder preserves provider segment timestamps when available", () => {
  assert.deepEqual(
    buildUploadTranscriptSegments("fallback text", {
      segments: [
        { text: "first speaker", timestamp: 12.5, speaker: "speaker_2" },
        { text: "second speaker", start: 18, speakerName: "Ada" },
      ],
    }),
    [
      {
        id: "upload-0",
        text: "first speaker",
        source: "system",
        timestamp: 12.5,
        speaker: "speaker_2",
        speakerIsPlaceholder: true,
      },
      {
        id: "upload-1",
        text: "second speaker",
        source: "system",
        timestamp: 18,
        speaker: "speaker_0",
        speakerName: "Ada",
        speakerIsPlaceholder: true,
      },
    ]
  );
});

test("upload note save args keep content plain and transcript structured", () => {
  const args = buildUploadNoteSaveArgs({
    title: "Meeting title",
    transcript: "raw uploaded transcript",
    fileName: "meeting.mp3",
    folderId: 3,
  });

  assert.deepEqual(args, {
    title: "Meeting title",
    content: "raw uploaded transcript",
    noteType: "upload",
    sourceFile: "meeting.mp3",
    audioDuration: null,
    folderId: 3,
    transcript: JSON.stringify([
      {
        id: "upload-0",
        text: "raw uploaded transcript",
        source: "system",
        timestamp: 0,
        speaker: "speaker_0",
        speakerIsPlaceholder: true,
      },
    ]),
  });
});

test("upload note save args use provider segments when provided", () => {
  const args = buildUploadNoteSaveArgs({
    title: "Segmented upload",
    transcript: "fallback text",
    segments: [{ text: "timed text", startTime: 7, speaker: "speaker_3" }],
    fileName: "meeting.wav",
    folderId: 4,
  });

  assert.equal(args.content, "fallback text");
  assert.equal(args.noteType, "upload");
  assert.deepEqual(JSON.parse(args.transcript), [
    {
      id: "upload-0",
      text: "timed text",
      source: "system",
      timestamp: 7,
      speaker: "speaker_3",
      speakerIsPlaceholder: true,
    },
  ]);
});
