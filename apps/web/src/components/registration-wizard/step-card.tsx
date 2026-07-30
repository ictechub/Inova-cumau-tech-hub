import type { ReactNode } from "react";

import { STEPS } from "./constants";
import { StepProgressDots } from "./step-progress-dots";

export function StepCard({
  stepIndex,
  hideProgress = false,
  children,
}: {
  stepIndex: number;
  hideProgress?: boolean;
  children: ReactNode;
}) {
  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const Icon = step.icon;
  const showIcon = step.key !== "credenciais";

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="flex flex-col items-center gap-3 text-center">
        {showIcon && (
          <div className="flex size-11 items-center justify-center rounded-lg border-[1.4px] border-border bg-white shadow-sm">
            <Icon className="size-5 text-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{step.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
        </div>
      </div>

      <div className="mt-8">{children}</div>

      {!hideProgress && (
        <div className="mt-8">
          <StepProgressDots total={STEPS.length} currentIndex={stepIndex} />
        </div>
      )}
    </div>
  );
}
