const DEFAULT_NOTE_TITLES = new Set([
  "",
  "Untitled",
  "Untitled Note",
  "New note",
  "无标题",
  "无标题笔记",
]);

export function shouldAutoGenerateActionTitle(title: string | null | undefined): boolean {
  return DEFAULT_NOTE_TITLES.has((title ?? "").trim());
}
