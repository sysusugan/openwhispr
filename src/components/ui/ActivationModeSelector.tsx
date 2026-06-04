import { MousePointerClick, MicVocal } from "lucide-react";
import { useTranslation } from "react-i18next";

type ActivationMode = "tap" | "push";

interface ActivationModeSelectorProps {
  value: ActivationMode;
  onChange: (mode: ActivationMode) => void;
  disabled?: boolean;
  /** Compact variant for inline use */
  variant?: "default" | "compact";
}

export function ActivationModeSelector({
  value,
  onChange,
  disabled = false,
  variant = "default",
}: ActivationModeSelectorProps) {
  const { t } = useTranslation();
  const isCompact = variant === "compact";

  return (
    <div
      className={`
        ow-segmented grid grid-cols-2
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("tap")}
        className={`
          ow-segmented-item w-full
          ${isCompact ? "px-2.5 py-1.5" : "px-3 py-2"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          ${value === "tap" ? "ow-segmented-item-active" : ""}
        `}
      >
        <MousePointerClick className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0`} />
        <span className={`truncate font-medium ${isCompact ? "text-xs" : "text-sm"}`}>
          {t("common.tap")}
        </span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("push")}
        className={`
          ow-segmented-item w-full
          ${isCompact ? "px-2.5 py-1.5" : "px-3 py-2"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          ${value === "push" ? "ow-segmented-item-active" : ""}
        `}
      >
        <MicVocal className={`${isCompact ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0`} />
        <span className={`truncate font-medium ${isCompact ? "text-xs" : "text-sm"}`}>
          {t("common.hold")}
        </span>
      </button>
    </div>
  );
}
