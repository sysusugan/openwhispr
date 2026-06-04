import { ChevronDown, FilePen, MessageSquareText, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import type { ActionItem } from "../../types/electron";
import { getActionDescription, getActionName } from "../../stores/actionStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

type WriteTarget = "content" | "enhanced_content";
type WriteMode = "overwrite" | "append";

interface EmbeddedChatActionStripProps {
  actions: ActionItem[];
  disabled?: boolean;
  writableContent?: string | null;
  onRequestRunAction?: (action: ActionItem) => void;
  onPromptSubmit?: (text: string) => void;
  onWriteAssistantMessage?: (content: string, target: WriteTarget, writeMode: WriteMode) => void;
}

const promptActionKeys = ["summarize", "todos", "risks"] as const;

export function EmbeddedChatActionStrip({
  actions,
  disabled,
  writableContent,
  onRequestRunAction,
  onPromptSubmit,
  onWriteAssistantMessage,
}: EmbeddedChatActionStripProps) {
  const { t } = useTranslation();
  const hasWritableContent = !!writableContent?.trim();

  return (
    <div className="shrink-0 border-t border-border/10 dark:border-white/5 px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "inline-flex h-8 max-w-full items-center gap-1.5 rounded-md border border-border/70 px-3",
              "bg-background text-xs font-medium text-muted-foreground shadow-sm",
              "transition-colors duration-150 hover:border-border-hover hover:bg-muted/70 hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-60"
            )}
          >
            <Sparkles size={12} className="shrink-0" />
            <span className="truncate">{t("embeddedChat.actions.label")}</span>
            <ChevronDown size={10} className="shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" sideOffset={8} className="min-w-56 max-w-72">
          {promptActionKeys.map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onPromptSubmit?.(t(`embeddedChat.actions.prompts.${key}.message`))}
              className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
            >
              <MessageSquareText size={12} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{t(`embeddedChat.actions.prompts.${key}.label`)}</span>
            </DropdownMenuItem>
          ))}

          {actions.length > 0 && <DropdownMenuSeparator />}
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => onRequestRunAction?.(action)}
              className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
            >
              <Sparkles size={12} className="shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{getActionName(action, t)}</div>
                {action.description && (
                  <div className="truncate text-[11px] text-muted-foreground">
                    {getActionDescription(action, t)}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          {hasWritableContent && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  onWriteAssistantMessage?.(writableContent, "enhanced_content", "append")
                }
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
              >
                <FilePen size={12} className="shrink-0 text-muted-foreground" />
                {t("embeddedChat.actions.write.appendEnhanced")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onWriteAssistantMessage?.(writableContent, "content", "append")}
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
              >
                <FilePen size={12} className="shrink-0 text-muted-foreground" />
                {t("embeddedChat.actions.write.appendNote")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onWriteAssistantMessage?.(writableContent, "enhanced_content", "overwrite")
                }
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
              >
                <FilePen size={12} className="shrink-0 text-muted-foreground" />
                {t("embeddedChat.actions.write.overwriteEnhanced")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onWriteAssistantMessage?.(writableContent, "content", "overwrite")}
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
              >
                <FilePen size={12} className="shrink-0 text-muted-foreground" />
                {t("embeddedChat.actions.write.overwriteNote")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
