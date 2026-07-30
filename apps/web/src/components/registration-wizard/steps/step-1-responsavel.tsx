"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { step1Schema, type Step1Data } from "../schema";
import { PhoneCountryInput } from "../phone-country-input";

export function Step1Responsavel({
  defaultValues,
  onNext,
}: {
  defaultValues: Partial<Step1Data>;
  onNext: (values: Step1Data) => void;
}) {
  const [values, setValues] = useState({
    responsavel_nome: defaultValues.responsavel_nome ?? "",
    responsavel_email: defaultValues.responsavel_email ?? "",
    responsavel_telefone: defaultValues.responsavel_telefone ?? "",
    responsavel_whatsapp: defaultValues.responsavel_whatsapp ?? "",
    responsavel_cargo: defaultValues.responsavel_cargo ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = step1Schema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setErrors({});
    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="responsavel_nome" required>
            Responsável pela Inscrição
          </FieldLabel>
          <Input
            id="responsavel_nome"
            autoComplete="name"
            placeholder="Ex.: Maria Silva"
            value={values.responsavel_nome}
            onChange={(e) =>
              setValues((v) => ({ ...v, responsavel_nome: e.target.value }))
            }
          />
          <FieldError errors={errors.responsavel_nome?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="responsavel_email" required>
            E-mail
          </FieldLabel>
          <Input
            id="responsavel_email"
            type="email"
            autoComplete="email"
            placeholder="maria@empresa.com"
            value={values.responsavel_email}
            onChange={(e) =>
              setValues((v) => ({ ...v, responsavel_email: e.target.value }))
            }
          />
          <FieldError errors={errors.responsavel_email?.map((message) => ({ message }))} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="responsavel_telefone" required>
              Celular
            </FieldLabel>
            <PhoneCountryInput
              id="responsavel_telefone"
              autoComplete="tel"
              placeholder="(96) 90000-0000"
              value={values.responsavel_telefone}
              onChange={(value) =>
                setValues((v) => ({ ...v, responsavel_telefone: value }))
              }
            />
            <FieldError
              errors={errors.responsavel_telefone?.map((message) => ({ message }))}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="responsavel_whatsapp" optional>
              WhatsApp
            </FieldLabel>
            <PhoneCountryInput
              id="responsavel_whatsapp"
              placeholder="(96) 90000-0000"
              value={values.responsavel_whatsapp}
              onChange={(value) =>
                setValues((v) => ({ ...v, responsavel_whatsapp: value }))
              }
            />
            <FieldError
              errors={errors.responsavel_whatsapp?.map((message) => ({ message }))}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="responsavel_cargo" required>
            Cargo / função
          </FieldLabel>
          <Input
            id="responsavel_cargo"
            placeholder="Ex.: CEO, fundador(a)"
            maxLength={30}
            value={values.responsavel_cargo}
            onChange={(e) =>
              setValues((v) => ({ ...v, responsavel_cargo: e.target.value }))
            }
          />
          <FieldError errors={errors.responsavel_cargo?.map((message) => ({ message }))} />
        </Field>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/" />}
            nativeButton={false}
          >
            Voltar para o Início
          </Button>
          <Button type="submit">Continuar</Button>
        </div>
      </FieldGroup>
    </form>
  );
}
