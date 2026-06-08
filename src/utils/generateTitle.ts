import reasoningService from "../services/ReasoningService";
import type { ReasoningConfig } from "../services/BaseReasoningService";
import { getSettings } from "../stores/settingsStore";
import { buildTitleSystemPrompt } from "./generateTitlePrompt";
import logger from "./logger";

export async function generateNoteTitle(
  text: string,
  modelId: string,
  customDictionary?: string[],
  uiLanguage?: string,
  config: ReasoningConfig = {}
): Promise<string> {
  try {
    const raw = await reasoningService.processText(text.slice(0, 2000), modelId, null, {
      ...config,
      systemPrompt: buildTitleSystemPrompt(customDictionary, uiLanguage),
      temperature: 0.3,
      disableThinking: config.disableThinking ?? getSettings().noteFormattingDisableThinking,
    });
    const cleaned = raw.trim().replace(/^["']|["']$/g, "");
    if (cleaned.length >= 100) {
      logger.warn(
        "Generated note title was rejected because it was too long",
        { length: cleaned.length },
        "notes"
      );
    }
    return cleaned.length > 0 && cleaned.length < 100 ? cleaned : "";
  } catch (err) {
    logger.warn(
      "Failed to generate note title",
      { error: err instanceof Error ? err.message : String(err) },
      "notes"
    );
    return "";
  }
}
