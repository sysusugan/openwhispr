import { Globe, Download, Trash2, X, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import type { ColorScheme } from "../../utils/modelPickerStyles";
import { createExternalLinkHandler } from "../../utils/externalLinks";

export interface ModelCardOption {
  value: string;
  label: string;
  description?: string;
  specUrl?: string;
  icon?: string;
  invertInDark?: boolean;
  // Local model properties (optional)
  isDownloaded?: boolean;
  isDownloading?: boolean;
  recommended?: boolean;
}

interface ModelCardListProps {
  models: ModelCardOption[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  colorScheme?: ColorScheme;
  className?: string;
  // Local model actions (optional - when provided, enables local model UI)
  onDownload?: (modelId: string) => void;
  onDelete?: (modelId: string) => void;
  onCancelDownload?: () => void;
  isCancelling?: boolean;
}

const COLOR_CONFIG: Record<
  ColorScheme,
  {
    selected: string;
    default: string;
  }
> = {
  purple: {
    selected:
      "border-border-hover bg-foreground/[0.04] dark:bg-white/[0.05] dark:border-white/15 shadow-sm",
    default:
      "border-border bg-surface-1 hover:border-border-hover hover:bg-muted dark:border-white/5 dark:bg-white/3 dark:hover:border-white/20 dark:hover:bg-white/8",
  },
  blue: {
    selected:
      "border-border-hover bg-foreground/[0.04] dark:bg-white/[0.05] dark:border-white/15 shadow-sm",
    default:
      "border-border bg-surface-1 hover:border-border-hover hover:bg-muted dark:border-white/5 dark:bg-white/3 dark:hover:border-white/20 dark:hover:bg-white/8",
  },
};

export default function ModelCardList({
  models,
  selectedModel,
  onModelSelect,
  colorScheme = "purple",
  className = "",
  onDownload,
  onDelete,
  onCancelDownload,
  isCancelling = false,
}: ModelCardListProps) {
  const { t } = useTranslation();
  const styles = COLOR_CONFIG[colorScheme];
  const isLocalMode = Boolean(onDownload);

  if (models.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        {isLocalMode ? "No models available for this provider" : "No models available"}
      </p>
    );
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      {models.map((model) => {
        const isSelected = selectedModel === model.value;
        const isDownloaded = model.isDownloaded;
        const isDownloading = model.isDownloading;

        // For local models, click to select if downloaded
        const handleCardClick = () => {
          if (isLocalMode) {
            if (isDownloaded && !isSelected) {
              onModelSelect(model.value);
            }
          } else {
            onModelSelect(model.value);
          }
        };

        // Determine status dot color for local mode
        const getStatusDotClass = () => {
          if (!isLocalMode) {
            return isSelected
              ? "bg-foreground/60 shadow-sm"
              : "bg-muted-foreground/30";
          }
          if (isDownloaded) {
            return isSelected
              ? "bg-foreground/60 shadow-sm"
              : "bg-success shadow-[0_0_4px_rgba(34,197,94,0.5)]";
          }
          if (isDownloading) {
            return "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]";
          }
          return "bg-muted-foreground/20";
        };

        return (
          <div
            key={model.value}
            onClick={handleCardClick}
            className={`relative w-full p-2 rounded-md border text-left transition-colors duration-200 group overflow-hidden ${
              isSelected ? styles.selected : styles.default
            } ${!isLocalMode || (isDownloaded && !isSelected) ? "cursor-pointer" : ""}`}
          >
            <div className="flex items-center gap-1.5">
              {/* Status dot with LED glow */}
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotClass()} ${
                  isSelected && isDownloaded
                    ? "animate-[pulse-glow_2s_ease-in-out_infinite]"
                    : isDownloading
                      ? "animate-[spinner-rotate_1s_linear_infinite]"
                      : ""
                }`}
              />

              {/* Icon */}
              {model.icon ? (
                <img
                  src={model.icon}
                  alt=""
                  className={`w-3.5 h-3.5 shrink-0 ${model.invertInDark ? "icon-monochrome" : ""}`}
                  aria-hidden="true"
                />
              ) : (
                <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}

              {/* Model info - inline */}
              <span className="text-sm font-semibold text-foreground truncate tracking-tight">
                {model.label}
              </span>
              {model.description && (
                <span className="text-xs text-muted-foreground/50 tabular-nums shrink-0">
                  {model.description}
                </span>
              )}
              {model.specUrl && (
                <a
                  href={model.specUrl}
                  onClick={createExternalLinkHandler(model.specUrl)}
                  className="inline-flex items-center gap-0.5 text-xs text-foreground/55 hover:text-foreground transition-colors shrink-0"
                >
                  {t("models.learnMore")}
                  <ExternalLink size={9} />
                </a>
              )}

              {/* Recommended badge */}
              {model.recommended && (
                <span className="text-xs font-medium text-foreground/70 px-1.5 py-0.5 bg-foreground/[0.06] rounded-sm shrink-0">
                  Recommended
                </span>
              )}

              {/* Actions - right aligned */}
              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                {/* Selected/Active badge */}
                {isSelected && (
                  <span className="text-xs font-medium text-foreground/70 px-2 py-0.5 bg-foreground/[0.06] rounded-sm">
                    Active
                  </span>
                )}

                {/* Local model action buttons */}
                {isLocalMode && (
                  <>
                    {isDownloaded ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(model.value);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-[color,opacity,transform] active:scale-95"
                      >
                        <Trash2 size={12} />
                      </Button>
                    ) : isDownloading ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelDownload?.();
                        }}
                        disabled={isCancelling}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2.5 text-xs text-destructive border-destructive/25 hover:bg-destructive/8"
                      >
                        <X size={11} className="mr-0.5" />
                        {isCancelling ? "..." : "Cancel"}
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload?.(model.value);
                        }}
                        size="sm"
                        variant="outline"
                        className="h-6 px-2.5 text-xs"
                      >
                        <Download size={11} className="mr-1" />
                        Download
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
