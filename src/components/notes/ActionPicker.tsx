import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, ChevronDown, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { cn } from "../lib/utils";
import {
  useActions,
  initializeActions,
  getActionName,
  getActionDescription,
} from "../../stores/actionStore";
import type { ActionItem } from "../../types/electron";

interface ActionPickerProps {
  onRunAction: (action: ActionItem) => void;
  onManageActions: () => void;
  disabled?: boolean;
}

export default function ActionPicker({
  onRunAction,
  onManageActions,
  disabled,
}: ActionPickerProps) {
  const { t } = useTranslation();
  const actions = useActions();
  const [lastUsedId, setLastUsedId] = useState<number | null>(() => {
    const stored = localStorage.getItem("lastUsedActionId");
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    initializeActions();
  }, []);

  const activeAction = actions.find((a) => a.id === lastUsedId) ?? actions[0] ?? null;

  const handleRun = (action: ActionItem) => {
    setLastUsedId(action.id);
    localStorage.setItem("lastUsedActionId", String(action.id));
    onRunAction(action);
  };

  if (!activeAction || actions.length === 0) return null;

  return (
    <div className="flex min-w-0 max-w-full items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            aria-label={t("notes.actions.selectAction")}
            className={cn(
              "flex h-8 max-w-36 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border/70 px-3",
              "bg-background text-muted-foreground",
              "transition-colors duration-150",
              "hover:bg-muted/70 hover:text-foreground hover:border-border-hover",
              "disabled:opacity-75 disabled:pointer-events-none"
            )}
          >
            <Sparkles size={12} className="shrink-0" />
            <span className="truncate text-xs font-medium tracking-tight">
              {t("notes.sidebar.actions")}
            </span>
            <ChevronDown size={10} className="shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8} className="min-w-48">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleRun(action)}
              className={cn(
                "text-xs gap-2.5 rounded-md px-2.5 py-1.5",
                action.id === activeAction.id && "bg-muted"
              )}
            >
              <Sparkles size={12} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{getActionName(action, t)}</div>
                {action.description && (
                  <div className="text-xs text-muted-foreground/50 truncate">
                    {getActionDescription(action, t)}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onManageActions}
            className="text-xs gap-2.5 rounded-md px-2.5 py-1.5 text-muted-foreground/60"
          >
            <Settings2 size={12} />
            {t("notes.actions.manage")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
