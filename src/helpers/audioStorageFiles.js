const RETAINED_AUDIO_EXTENSIONS = new Set([".webm", ".wav"]);

function formatTimestamp(timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${valid.getFullYear()}-${pad(valid.getMonth() + 1)}-${pad(valid.getDate())}`;
  const time = `${pad(valid.getHours())}-${pad(valid.getMinutes())}-${pad(valid.getSeconds())}`;
  return `${date}-${time}`;
}

function buildDictationAudioFilename(transcriptionId, timestamp) {
  if (timestamp) {
    return `OpenWhispr-${formatTimestamp(timestamp)}-${transcriptionId}.webm`;
  }
  return `OpenWhispr-${transcriptionId}.webm`;
}

function buildMeetingAudioFilename(noteId, timestamp) {
  return `OpenWhispr-meeting-${formatTimestamp(timestamp)}-${noteId}.wav`;
}

function isRetainedAudioFile(filename) {
  const lower = String(filename || "").toLowerCase();
  for (const ext of RETAINED_AUDIO_EXTENSIONS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function isDictationAudioFile(filename) {
  return String(filename || "")
    .toLowerCase()
    .endsWith(".webm");
}

module.exports = {
  buildDictationAudioFilename,
  buildMeetingAudioFilename,
  isDictationAudioFile,
  isRetainedAudioFile,
};
