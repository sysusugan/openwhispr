interface AssignableTranscriptSegment {
  id: string;
  text: string;
  source: "mic" | "system";
  timestamp?: number;
  speaker?: string;
  speakerName?: string;
  speakerIsPlaceholder?: boolean;
  suggestedName?: string;
  suggestedProfileId?: number;
  speakerStatus?: "provisional" | "confirmed" | "suggested" | "locked";
  speakerLocked?: boolean;
  speakerLockSource?: "user" | "diarization" | "suggestion";
}

interface SpeakerDisplayLabels {
  you: string;
  speaker: (n: number) => string;
}

export interface TranscriptSpeakerFilterOption {
  key: string;
  label: string;
  colorKey: string;
}

export interface TranscriptSpeakerBlock<T extends AssignableTranscriptSegment> {
  id: string;
  text: string;
  source: T["source"];
  timestamp?: number;
  speaker?: string;
  speakerName?: string;
  speakerDisplay: ReturnType<typeof getTranscriptSpeakerDisplay<T>>;
  segments: T[];
}

const getSpeakerNumber = (speakerId: string) => {
  const match = speakerId.match(/speaker_(\d+)/);
  return match ? Number(match[1]) + 1 : 1;
};

const getTranscriptSpeakerFilterKey = (segment: AssignableTranscriptSegment) =>
  segment.speaker ? `speaker:${segment.speaker}` : `source:${segment.source}`;

const getTranscriptSpeakerBlockKey = (
  segment: AssignableTranscriptSegment,
  speakerMappings: Record<string, string> = {}
) => {
  const mapped = segment.speaker ? speakerMappings[segment.speaker] : undefined;
  if (segment.speakerName) return `name:${segment.speakerName.toLowerCase()}`;
  if (mapped) return `name:${mapped.toLowerCase()}`;
  if (segment.speaker) return `speaker:${segment.speaker}`;
  return `source:${segment.source}`;
};

const isUnresolvedProvisionalPlaceholder = (segment: AssignableTranscriptSegment) =>
  segment.speakerIsPlaceholder === true &&
  segment.speakerStatus === "provisional" &&
  !segment.speakerName &&
  !segment.speakerLocked;

const stableManualSpeakerId = (segment: AssignableTranscriptSegment) =>
  `manual_${segment.id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

const lockSpeakerName = <T extends AssignableTranscriptSegment>(
  segment: T,
  displayName: string
): T => ({
  ...segment,
  speaker:
    !segment.speaker || segment.speaker === "you"
      ? stableManualSpeakerId(segment)
      : segment.speaker,
  speakerName: displayName,
  speakerIsPlaceholder: false,
  suggestedName: undefined,
  suggestedProfileId: undefined,
  speakerLocked: true,
  speakerStatus: "locked",
  speakerLockSource: "user",
});

export function getTranscriptSpeakerDisplay<T extends AssignableTranscriptSegment>(
  segment: T,
  speakerMappings: Record<string, string> = {},
  labels: SpeakerDisplayLabels
) {
  const mapped = segment.speaker ? speakerMappings[segment.speaker] : undefined;
  const label =
    segment.speakerName ||
    mapped ||
    (segment.speaker === "you"
      ? labels.you
      : segment.speaker
        ? labels.speaker(getSpeakerNumber(segment.speaker))
        : segment.source === "mic"
          ? labels.you
          : labels.speaker(1));

  return {
    label,
    isSelf:
      !segment.speakerName && !mapped && (segment.speaker === "you" || segment.source === "mic"),
  };
}

export function assignSpeakerGroupName<T extends AssignableTranscriptSegment>(
  segments: T[],
  speakerId: string,
  displayName: string
): T[] {
  return segments.map((segment) =>
    segment.speaker === speakerId ? lockSpeakerName(segment, displayName) : segment
  );
}

export function getTranscriptSpeakerFilterOptions<T extends AssignableTranscriptSegment>(
  segments: T[],
  speakerMappings: Record<string, string> = {},
  labels: SpeakerDisplayLabels
): TranscriptSpeakerFilterOption[] {
  const byKey = new Map<string, TranscriptSpeakerFilterOption>();

  for (const segment of segments) {
    if (isUnresolvedProvisionalPlaceholder(segment)) {
      continue;
    }

    const key = getTranscriptSpeakerFilterKey(segment);
    const display = getTranscriptSpeakerDisplay(segment, speakerMappings, labels);
    const option = {
      key,
      label: display.label,
      colorKey: segment.speaker || segment.source,
    };

    if (!byKey.has(key)) {
      byKey.set(key, option);
      continue;
    }

    if (segment.speakerName || (segment.speaker && speakerMappings[segment.speaker])) {
      byKey.set(key, option);
    }
  }

  return [...byKey.values()];
}

export function filterTranscriptSegmentsBySpeaker<T extends AssignableTranscriptSegment>(
  segments: T[],
  selectedSpeakerKeys: Set<string> | null
): T[] {
  if (!selectedSpeakerKeys) return segments;
  return segments.filter((segment) =>
    selectedSpeakerKeys.has(getTranscriptSpeakerFilterKey(segment))
  );
}

export function buildTranscriptSpeakerBlocks<T extends AssignableTranscriptSegment>(
  segments: T[],
  speakerMappings: Record<string, string> = {},
  labels: SpeakerDisplayLabels
): TranscriptSpeakerBlock<T>[] {
  const blocks: TranscriptSpeakerBlock<T>[] = [];

  for (const segment of segments) {
    const key = getTranscriptSpeakerBlockKey(segment, speakerMappings);
    const previous = blocks[blocks.length - 1];

    if (previous && getTranscriptSpeakerBlockKey(previous.segments[0], speakerMappings) === key) {
      previous.segments.push(segment);
      previous.text = previous.segments
        .map((item) => item.text.trim())
        .filter(Boolean)
        .join(" ");
      continue;
    }

    blocks.push({
      id: segment.id,
      text: segment.text.trim(),
      source: segment.source,
      timestamp: segment.timestamp,
      speaker: segment.speaker,
      speakerName: segment.speakerName,
      speakerDisplay: getTranscriptSpeakerDisplay(segment, speakerMappings, labels),
      segments: [segment],
    });
  }

  return blocks;
}
