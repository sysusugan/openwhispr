interface EmbeddedChatTranscriptInput {
  liveTranscript?: string | null;
  meetingTranscript?: string | null;
  savedTranscript?: string | null;
}

export function selectEmbeddedChatTranscript({
  liveTranscript,
  meetingTranscript,
  savedTranscript,
}: EmbeddedChatTranscriptInput): string {
  return liveTranscript || meetingTranscript || savedTranscript || "";
}
