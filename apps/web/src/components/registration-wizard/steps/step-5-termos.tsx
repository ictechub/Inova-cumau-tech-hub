"use client";

import { IconCheck, IconFileText, IconShieldLock } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PRIVACY_POLICY, TERMS_OF_USE, type LegalSection } from "../legal-content";
import { step5Schema, type Step5Data } from "../schema";

function LegalDocumentCard({
  icon: Icon,
  title,
  description,
  sections,
  read,
  onRead,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  sections: LegalSection[];
  read: boolean;
  onRead: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function checkScrolledToEnd(el: HTMLDivElement) {
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 4) {
      onRead();
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setTimeout(() => {
            if (scrollRef.current) checkScrolledToEnd(scrollRef.current);
          }, 0);
        }
      }}
    >
      <DialogTrigger className="text-left">
        <Card className="h-full cursor-pointer transition-colors hover:bg-muted/40">
          <CardHeader>
            <Icon className="size-6 text-primary" aria-hidden />
            <CardTitle className="mt-2 flex items-center gap-1.5 font-sans">
              {title}
              {read && <IconCheck className="size-4 text-success-700" aria-hidden />}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-sans">{title}</DialogTitle>
        </DialogHeader>
        <div
          ref={scrollRef}
          onScroll={(e) => checkScrolledToEnd(e.currentTarget)}
          className="flex max-h-[60vh] flex-col divide-y divide-neutral-200 overflow-y-auto"
        >
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
              <p className="font-medium text-foreground">{section.title}</p>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Step5Termos({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step5Data>;
  onNext: (values: Step5Data) => void;
  onBack: () => void;
}) {
  const [checked, setChecked] = useState(defaultValues.termos_aceitos ?? false);
  const [error, setError] = useState<string>();
  const [termosRead, setTermosRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const canAccept = termosRead && privacyRead;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = step5Schema.safeParse({ termos_aceitos: checked });

    if (!result.success) {
      setError(result.error.flatten().fieldErrors.termos_aceitos?.[0]);
      return;
    }

    setError(undefined);
    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <LegalDocumentCard
              icon={IconFileText}
              title="Termos de Uso"
              description="Regras de cadastro e uso da plataforma da Inova Cumaú."
              sections={TERMS_OF_USE}
              read={termosRead}
              onRead={() => setTermosRead(true)}
            />
            <LegalDocumentCard
              icon={IconShieldLock}
              title="Política de Privacidade"
              description="Como coletamos, usamos e protegemos os seus dados."
              sections={PRIVACY_POLICY}
              read={privacyRead}
              onRead={() => setPrivacyRead(true)}
            />
          </div>
        </Field>

        <Field>
          <label
            className={cn(
              "flex items-start gap-2 text-sm text-foreground",
              !canAccept && "opacity-50"
            )}
          >
            <Checkbox
              checked={checked}
              disabled={!canAccept}
              onCheckedChange={(value) => setChecked(value === true)}
              className="mt-0.5"
            />
            Li e concordo com os Termos de Uso e a Política de Privacidade.
            <span className="-ml-1.5 text-destructive" aria-hidden="true">
              *
            </span>
          </label>
          {!canAccept && (
            <p className="text-xs text-muted-foreground">
              Abra e leia até o final os Termos de Uso e a Política de Privacidade para
              liberar a confirmação.
            </p>
          )}
          <FieldError errors={error ? [{ message: error }] : undefined} />
        </Field>

        <Field className="mt-2 flex-row gap-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Voltar
          </Button>
          <Button type="submit" className="flex-1">
            Continuar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
