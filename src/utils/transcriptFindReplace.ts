interface FindReplaceOptions {
  ignoreCase?: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeFindPattern(findText: string, options: FindReplaceOptions = {}): RegExp | null {
  if (!findText) return null;
  return new RegExp(escapeRegExp(findText), options.ignoreCase === false ? "g" : "gi");
}

export function countMatches(
  content: string,
  findText: string,
  options: FindReplaceOptions = {}
): number {
  const pattern = makeFindPattern(findText, options);
  if (!pattern) return 0;
  return content.match(pattern)?.length ?? 0;
}

export function replaceAllMatches(
  content: string,
  findText: string,
  replaceText: string,
  options: FindReplaceOptions = {}
): string {
  const pattern = makeFindPattern(findText, options);
  if (!pattern) return content;
  return content.replace(pattern, replaceText);
}
