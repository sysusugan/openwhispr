export const IDLE_UPLOAD_TRANSCRIPTION_STATE = Object.freeze({
  state: "idle",
  file: null,
  result: null,
  noteId: null,
  error: null,
  progress: 0,
  chunkProgress: null,
  selectedFolderId: "",
});

export function createInitialUploadTranscriptionState(overrides = {}) {
  return {
    ...IDLE_UPLOAD_TRANSCRIPTION_STATE,
    ...overrides,
  };
}

export function startUploadTask(current, file, options = {}) {
  return {
    ...current,
    state: "transcribing",
    file,
    result: null,
    noteId: null,
    error: null,
    progress: 0,
    chunkProgress: null,
    selectedFolderId: options.folderId ?? current.selectedFolderId ?? "",
  };
}

export function selectUploadFile(current, file) {
  return {
    ...current,
    state: "selected",
    file,
    result: null,
    noteId: null,
    error: null,
    progress: 0,
    chunkProgress: null,
  };
}

export function completeUploadTask(current, options) {
  return {
    ...current,
    state: "complete",
    result: options.result,
    noteId: options.noteId,
    error: null,
    progress: 100,
    chunkProgress: null,
    selectedFolderId: options.folderId ?? current.selectedFolderId ?? "",
  };
}

export function failUploadTask(current, error) {
  return {
    ...current,
    state: "error",
    error,
    progress: 0,
    chunkProgress: null,
  };
}

export function resetUploadTask(_current, options = {}) {
  return createInitialUploadTranscriptionState({
    selectedFolderId: options.defaultFolderId ?? "",
  });
}

function normalizeUploadTranscriptSegment(segment, index) {
  const text = String(segment?.text || "").trim();
  if (!text) return null;
  const timestamp = Number(segment?.timestamp ?? segment?.start ?? segment?.startTime ?? 0);
  const source = segment?.source === "mic" ? "mic" : "system";
  const speaker = String(segment?.speaker || "speaker_0");

  const normalized = {
    id: String(segment?.id || `upload-${index}`),
    text,
    source,
    timestamp: Number.isFinite(timestamp) ? timestamp : 0,
    speaker,
    speakerIsPlaceholder:
      typeof segment?.speakerIsPlaceholder === "boolean" ? segment.speakerIsPlaceholder : true,
  };
  if (segment?.speakerName) normalized.speakerName = segment.speakerName;
  return normalized;
}

export function buildUploadTranscriptSegments(transcriptText, options = {}) {
  const sourceSegments = Array.isArray(options.segments) ? options.segments : [];
  const normalizedSegments = sourceSegments
    .map((segment, index) => normalizeUploadTranscriptSegment(segment, index))
    .filter(Boolean);
  if (normalizedSegments.length > 0) return normalizedSegments;

  const text = String(transcriptText || "").trim();
  if (!text) return [];

  return [
    {
      id: "upload-0",
      text,
      source: "system",
      timestamp: 0,
      speaker: "speaker_0",
      speakerIsPlaceholder: true,
    },
  ];
}

export function buildUploadNoteSaveArgs({ title, transcript, fileName, folderId, segments }) {
  const transcriptSegments = buildUploadTranscriptSegments(transcript, { segments });
  return {
    title,
    content: transcript,
    noteType: "upload",
    sourceFile: fileName,
    audioDuration: null,
    folderId,
    transcript: JSON.stringify(transcriptSegments),
  };
}

export default {
  IDLE_UPLOAD_TRANSCRIPTION_STATE,
  createInitialUploadTranscriptionState,
  selectUploadFile,
  startUploadTask,
  completeUploadTask,
  failUploadTask,
  resetUploadTask,
  buildUploadTranscriptSegments,
  buildUploadNoteSaveArgs,
};
