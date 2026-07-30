"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { MultiSelectCombobox } from "../multi-select-combobox";
import { OBJETIVOS_FILIACAO, TECH_SEGMENTS } from "../constants";
import { step4Schema, type Step4Data } from "../schema";

export function Step4Segmentacao({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step4Data>;
  onNext: (values: Step4Data) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Step4Data>({
    segmentos: defaultValues.segmentos ?? [],
    segmento_outro: defaultValues.segmento_outro ?? "",
    segmentacao_outros_detalhes: defaultValues.segmentacao_outros_detalhes ?? "",
    objetivo_filiacao: defaultValues.objetivo_filiacao ?? [],
    objetivo_filiacao_outro: defaultValues.objetivo_filiacao_outro ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = step4Schema.safeParse(values);

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
          <FieldLabel required>Segmentos de atuação</FieldLabel>
          <MultiSelectCombobox
            options={TECH_SEGMENTS}
            value={values.segmentos}
            onChange={(segmentos) => setValues((v) => ({ ...v, segmentos }))}
            placeholder="Selecione os segmentos"
            searchPlaceholder="Buscar segmento..."
            emptyMessage="Nenhum segmento encontrado."
          />
          <FieldError errors={errors.segmentos?.map((message) => ({ message }))} />
        </Field>

        {values.segmentos.includes("outra") && (
          <Field>
            <FieldLabel htmlFor="segmento_outro" required>
              Qual segmento?
            </FieldLabel>
            <Input
              id="segmento_outro"
              placeholder="Ex.: Fintech, Edtech"
              value={values.segmento_outro}
              onChange={(e) =>
                setValues((v) => ({ ...v, segmento_outro: e.target.value }))
              }
            />
            <FieldError errors={errors.segmento_outro?.map((message) => ({ message }))} />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="segmentacao_outros_detalhes" optional>
            Outros detalhes
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="segmentacao_outros_detalhes"
              rows={3}
              maxLength={200}
              placeholder="Outras informações relevantes sobre a área de atuação da startup."
              value={values.segmentacao_outros_detalhes}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  segmentacao_outros_detalhes: e.target.value,
                }))
              }
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>
                {(values.segmentacao_outros_detalhes ?? "").length}/200
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel required>Objetivo da filiação</FieldLabel>
          <MultiSelectCombobox
            options={OBJETIVOS_FILIACAO}
            value={values.objetivo_filiacao}
            onChange={(objetivo_filiacao) =>
              setValues((v) => ({ ...v, objetivo_filiacao }))
            }
            placeholder="Selecione os objetivos"
            searchPlaceholder="Buscar objetivo..."
            emptyMessage="Nenhum objetivo encontrado."
          />
          <FieldError
            errors={errors.objetivo_filiacao?.map((message) => ({ message }))}
          />
        </Field>

        {values.objetivo_filiacao.includes("outros") && (
          <Field>
            <FieldLabel htmlFor="objetivo_filiacao_outro" required>
              Qual objetivo?
            </FieldLabel>
            <Input
              id="objetivo_filiacao_outro"
              placeholder="Descreva o objetivo"
              value={values.objetivo_filiacao_outro}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  objetivo_filiacao_outro: e.target.value,
                }))
              }
            />
            <FieldError
              errors={errors.objetivo_filiacao_outro?.map((message) => ({
                message,
              }))}
            />
          </Field>
        )}

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
