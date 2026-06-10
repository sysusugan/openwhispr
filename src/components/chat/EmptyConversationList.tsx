import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

interface EmptyConversationListProps {
  onNewChat: () => void;
}

export default function EmptyConversationList({ onNewChat }: EmptyConversationListProps) {
  const { t } = useTranslation();

  return (
    <div className="ow-empty-state h-full gap-2 px-4 select-none">
      <p className="ow-empty-state-description">{t("chat.noConversations")}</p>
      <button
        onClick={onNewChat}
        className={cn(
          "mt-1 flex items-center gap-1.5 h-7 px-2.5 rounded-md",
          "text-xs font-semibold text-foreground bg-card/70 hover:bg-muted border border-border/60",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30"
        )}
      >
        <Plus size={12} />
        {t("chat.newChat")}
      </button>
    </div>
  );
}
