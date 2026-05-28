export function getNoteContextInstruction(): string {
  return (
    "Below is the current note context. If the user's question is about this note, " +
    "the current meeting, or the current transcript, answer from this context first. " +
    "Use search_notes only when the user asks about other notes, past meetings, " +
    "or broader note history not covered by the current note context."
  );
}
