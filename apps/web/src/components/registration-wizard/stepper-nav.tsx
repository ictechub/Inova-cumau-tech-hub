"use client";

import { IconChecks } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { STEPS } from "./constants";

function StepperItem({
  step,
  isDone,
  isCurrent,
  isLast,
}: {
  step: (typeof STEPS)[number];
  isDone: boolean;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const isDimmed = !isCurrent;
  const Icon = step.icon;

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border-[1.4px] bg-white shadow-sm transition-opacity",
            isCurrent
              ? "border-foreground/30 text-foreground"
              : "border-border text-muted-foreground",
            isDimmed && "opacity-70",
          )}
        >
          <Icon className="size-4.5" />
        </div>

        {!isLast && (
          <div className="relative flex-1 py-1">
            <div className="mx-auto h-full w-[2px] bg-border" />
          </div>
        )}
      </div>

      <div className={cn("pb-9", isLast && "pb-0", isDimmed && "opacity-70")}>
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "text-sm font-medium",
              isCurrent ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {step.title}
          </p>
          {isDone && <IconChecks size={16} className="text-primary" />}
        </div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>
    </li>
  );
}

export function StepperNav({
  currentIndex,
  isComplete = false,
}: {
  currentIndex: number;
  isComplete?: boolean;
}) {
  return (
    <ol className="flex flex-col">
      {STEPS.map((step, index) => (
        <StepperItem
          key={step.key}
          step={step}
          isDone={isComplete || index < currentIndex}
          isCurrent={index === currentIndex}
          isLast={index === STEPS.length - 1}
        />
      ))}
    </ol>
  );
}
