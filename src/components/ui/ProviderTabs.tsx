import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ProviderIcon } from "./ProviderIcon";
import type { ColorScheme as BaseColorScheme } from "../../utils/modelPickerStyles";

export interface ProviderTabItem {
  id: string;
  name: string;
  recommended?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

type ColorScheme = Exclude<BaseColorScheme, "blue"> | "dynamic";

interface ProviderTabsProps {
  providers: ProviderTabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderIcon?: (providerId: string) => ReactNode;
  colorScheme?: ColorScheme;
  /** Allow horizontal scrolling for many providers */
  scrollable?: boolean;
}

export function ProviderTabs({
  providers,
  selectedId,
  onSelect,
  renderIcon,
  colorScheme = "purple",
  scrollable = false,
}: ProviderTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`ow-segmented inline-flex max-w-full items-center gap-0.5 ${scrollable ? "overflow-x-auto" : ""}`}
    >
      {providers.map((provider) => {
        const isSelected = selectedId === provider.id;
        const isDisabled = !!provider.disabled;

        return (
          <button
            key={provider.id}
            data-tab-button
            type="button"
            disabled={isDisabled}
            aria-disabled={isDisabled}
            title={isDisabled ? provider.disabledLabel : undefined}
            onClick={() => {
              if (isDisabled) return;
              onSelect(provider.id);
            }}
            className={`ow-segmented-item ${
              scrollable ? "whitespace-nowrap" : ""
            } ${
              isDisabled
                ? "cursor-not-allowed text-muted-foreground/50 hover:bg-transparent hover:text-muted-foreground/50"
                : isSelected
                  ? "ow-segmented-item-active [&_svg]:text-foreground"
                  : ""
            }`}
          >
            {renderIcon ? renderIcon(provider.id) : <ProviderIcon provider={provider.id} />}
            <span>{provider.name}</span>
            {provider.recommended && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {t("common.recommended")}
              </span>
            )}
            {isDisabled && provider.disabledLabel && (
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                {provider.disabledLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
