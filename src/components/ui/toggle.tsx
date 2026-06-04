import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle = ({ checked, onChange, disabled = false }: ToggleProps) => {
  const getTrackClasses = () => {
    if (disabled) {
      return checked ? "bg-foreground/30" : "bg-muted";
    }
    return checked
      ? "bg-foreground/75 hover:bg-foreground/85 dark:bg-white/45 dark:hover:bg-white/55"
      : "bg-muted-foreground/30 hover:bg-muted-foreground/40 dark:bg-surface-raised dark:hover:bg-surface-3";
  };

  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 ${getTrackClasses()} ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-150 ${
          checked ? "translate-x-6" : "translate-x-1"
        } ${disabled ? "bg-muted-foreground/50" : "bg-background shadow-sm"}`}
      />
    </button>
  );
};
