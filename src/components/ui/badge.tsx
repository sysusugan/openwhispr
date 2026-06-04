import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-border/60 bg-foreground/[0.06] text-foreground/70 dark:bg-white/[0.08]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:ring-1 dark:ring-destructive/20",
        outline: "text-muted-foreground border-border dark:border-border-hover",
        success: "border-transparent bg-success/15 text-success dark:ring-1 dark:ring-success/20",
        warning: "border-transparent bg-warning/15 text-warning dark:ring-1 dark:ring-warning/20",
        info: "border-transparent bg-info/15 text-info dark:ring-1 dark:ring-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
