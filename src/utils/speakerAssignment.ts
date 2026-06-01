interface AssignableTranscriptSegment {
  id: string;
  text: string;
  source: "mic" | "system";
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

const getSpeakerNumber = (speakerId: string) => {
  const match = speakerId.match(/speaker_(\d+)/);
  return match ? Number(match[1]) + 1 : 1;
};

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

export function assignSelectedTranscriptSegments<T extends AssignableTranscriptSegment>(
  segments: T[],
  selectedSegmentIds: Set<string>,
  displayName: string
): T[] {
  return segments.map((segment) =>
    selectedSegmentIds.has(segment.id) ? lockSpeakerName(segment, displayName) : segment
  );
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
