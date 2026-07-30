"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo, LogoWordmark } from "@/components/logo";
import { STEPS } from "./constants";
import type { WizardData } from "./schema";
import { StepCard } from "./step-card";
import { StepperNav } from "./stepper-nav";
import { Step1Responsavel } from "./steps/step-1-responsavel";
import { Step2Empreendimento } from "./steps/step-2-empreendimento";
import { Step4Segmentacao } from "./steps/step-4-segmentacao";
import { Step5Termos } from "./steps/step-5-termos";
import { Step6Credenciais } from "./steps/step-6-credenciais";
import { Step7Confirmacao } from "./steps/step-7-confirmacao";

export function RegistrationWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({});
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  function handleNext<T extends Partial<WizardData>>(values: T) {
    setData((current) => ({ ...current, ...values }));
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleSignedUp(email: string) {
    setOtpEmail(email);
    setStepIndex(5);
  }

  function handleCompleted() {
    setIsComplete(true);
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col justify-between bg-neutral-50 px-6 py-10 sm:px-10 lg:w-[420px] lg:px-12 lg:py-12">
        <div>
          <Link href="/" className="flex items-center gap-2" aria-label="Inova Cumaú">
            <Logo />
            <LogoWordmark />
          </Link>

          <div className="mt-12">
            <StepperNav currentIndex={stepIndex} isComplete={isComplete} />
          </div>
        </div>

        <div className="mt-10 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Inova Cumaú</span>
        </div>
      </aside>

      <main className="flex flex-1 items-start justify-center overflow-y-auto bg-white px-6 py-16 sm:px-10 lg:min-h-0">
        <StepCard stepIndex={stepIndex} hideProgress={isComplete}>
          {stepIndex === 0 && <Step1Responsavel defaultValues={data} onNext={handleNext} />}
          {stepIndex === 1 && (
            <Step2Empreendimento
              defaultValues={data}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {stepIndex === 2 && (
            <Step4Segmentacao defaultValues={data} onNext={handleNext} onBack={handleBack} />
          )}
          {stepIndex === 3 && (
            <Step5Termos defaultValues={data} onNext={handleNext} onBack={handleBack} />
          )}
          {stepIndex === 4 && (
            <Step6Credenciais
              payload={data}
              onBack={handleBack}
              onSignedUp={handleSignedUp}
              onComplete={handleCompleted}
            />
          )}
          {stepIndex === 5 && otpEmail && (
            <Step7Confirmacao
              email={otpEmail}
              payload={data}
              onBack={handleBack}
              onComplete={handleCompleted}
            />
          )}
        </StepCard>
      </main>
    </div>
  );
}
