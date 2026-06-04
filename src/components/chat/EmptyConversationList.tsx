import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

interface EmptyConversationListProps {
  onNewChat: () => void;
}

export default function EmptyConversationList({ onNewChat }: EmptyConversationListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 px-4 select-none">
      <p className="ow-empty-text text-center">{t("chat.noConversations")}</p>
      <button
        onClick={onNewChat}
        className={cn(
          "flex items-center gap-1.5 h-7 px-2.5 rounded-md",
          "text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
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
