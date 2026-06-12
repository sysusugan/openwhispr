import type { TranscriptSegment } from "../stores/meetingRecordingStore";

const MIN_SEGMENT_GAP_SECONDS = 1;

function getRelativeSeconds(
  timestamp: number | null | undefined,
  recordingStartedAt?: number | null
) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) return undefined;
  if (timestamp <= 1_000_000_000) return Math.max(0, timestamp);
  if (!recordingStartedAt || !Number.isFinite(recordingStartedAt)) return undefined;
  return Math.max(0, (timestamp - recordingStartedAt) / 1000);
}

export function getTranscriptTimelineEndSeconds(segments: TranscriptSegment[]): number {
  return segments.reduce((max, segment) => {
    const timestamp = typeof segment.timestamp === "number" ? segment.timestamp : 0;
    return Number.isFinite(timestamp) ? Math.max(max, timestamp) : max;
  }, 0);
}

export function offsetAppendedTranscriptSegments(
  segments: TranscriptSegment[],
  seedSegments: TranscriptSegment[],
  recordingStartedAt?: number | null
): TranscriptSegment[] {
  if (segments.length === 0 || seedSegments.length === 0) return segments;

  const seedIds = new Set(seedSegments.map((segment) => segment.id));
  const seedEndSeconds = getTranscriptTimelineEndSeconds(seedSegments);
  const appended = segments.filter((segment) => !seedIds.has(segment.id));
  if (appended.length === 0) return segments;

  const appendedStartSeconds = appended.reduce((min, segment) => {
    const relative = getRelativeSeconds(segment.timestamp, recordingStartedAt);
    if (relative == null || !Number.isFinite(relative)) return min;
    return Math.min(min, relative);
  }, Number.POSITIVE_INFINITY);
  const baseOffset =
    seedEndSeconds +
    MIN_SEGMENT_GAP_SECONDS -
    (Number.isFinite(appendedStartSeconds) ? appendedStartSeconds : 0);

  return segments.map((segment) => {
    if (seedIds.has(segment.id)) return segment;
    const relative = getRelativeSeconds(segment.timestamp, recordingStartedAt);
    return {
      ...segment,
      timestamp: relative == null ? undefined : Math.max(0, relative + baseOffset),
    };
  });
}

export function resolveNoteActionTranscript(args: {
  isActiveNoteRecording: boolean;
  realtimeTranscript?: string | null;
  persistedTranscript?: string | null;
}): string | null {
  if (args.isActiveNoteRecording && args.realtimeTranscript?.trim()) {
    return args.realtimeTranscript;
  }
  return args.persistedTranscript || null;
}
