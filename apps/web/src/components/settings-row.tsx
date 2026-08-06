import * as React from "react";

import { cn } from "@/lib/utils";

function SettingsSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-base font-medium text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border py-5 last:border-b-0 sm:flex-row sm:gap-8",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-0.5 sm:w-[280px] sm:shrink-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </div>
      <div className="flex w-full max-w-md flex-col gap-2">{children}</div>
    </div>
  );
}

export { SettingsSection, SettingsRow };
