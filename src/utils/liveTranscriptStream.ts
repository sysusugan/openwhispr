import type { TranscriptSegment } from "../stores/meetingRecordingStore";

export interface LiveTranscriptItem {
  id: string;
  text: string;
  pending: boolean;
}

export function stripRealtimeSpeakerMetadata(segment: TranscriptSegment): TranscriptSegment {
  const {
    speaker: _speaker,
    speakerName: _speakerName,
    speakerIsPlaceholder: _speakerIsPlaceholder,
    suggestedName: _suggestedName,
    suggestedProfileId: _suggestedProfileId,
    speakerStatus: _speakerStatus,
    speakerLocked: _speakerLocked,
    speakerLockSource: _speakerLockSource,
    ...rest
  } = segment;
  return rest;
}

export function buildLiveTranscriptItems(
  segments: TranscriptSegment[],
  micPartial?: string | null,
  systemPartial?: string | null
): LiveTranscriptItem[] {
  const items: LiveTranscriptItem[] = segments
    .filter((segment) => !!segment.text?.trim())
    .map((segment) => ({
      id: segment.id,
      text: segment.text,
      pending: false,
    }));

  [micPartial, systemPartial].forEach((text, index) => {
    if (!text?.trim()) return;
    items.push({
      id: `partial-${index}`,
      text,
      pending: true,
    });
  });

  return items;
}
