"use client";

import { useTransition, useState } from "react";
import { IconInfoCircle } from "@tabler/icons-react";

import { lookupCnpj } from "@/app/associe-se/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CityCombobox } from "@/components/city-combobox";
import { formatCNPJ } from "@/lib/masks";
import { BRAZIL_STATES, BUSINESS_PHASES } from "../constants";
import { step2Schema, type Step2Data } from "../schema";

type CnpjLookupStatus =
  | "idle"
  | "loading"
  | "success"
  | "not_found"
  | "invalid"
  | "error";

export function Step2Empreendimento({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step2Data>;
  onNext: (values: Step2Data) => void;
  onBack: () => void;
}) {
  const [values, setValues] = useState({
    startup_nome: defaultValues.startup_nome ?? "",
    startup_cnpj: defaultValues.startup_cnpj ? formatCNPJ(defaultValues.startup_cnpj) : "",
    startup_cnpj_ausente: defaultValues.startup_cnpj_ausente ?? false,
    contato_endereco: defaultValues.contato_endereco ?? "",
    contato_cidade: defaultValues.contato_cidade ?? "",
    contato_estado: defaultValues.contato_estado ?? "",
    fase_negocio: defaultValues.fase_negocio ?? "",
    startup_descricao: defaultValues.startup_descricao ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [cnpjStatus, setCnpjStatus] = useState<CnpjLookupStatus>("idle");
  const [, startTransition] = useTransition();

  function handleCnpjChange(rawValue: string) {
    const formatted = formatCNPJ(rawValue);
    setValues((v) => ({ ...v, startup_cnpj: formatted }));
    setCnpjStatus("idle");

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 14) return;

    startTransition(async () => {
      setCnpjStatus("loading");
      const result = await lookupCnpj(digits);
      setCnpjStatus(result.status);

      if (result.status === "success") {
        setValues((v) => ({
          ...v,
          startup_nome: v.startup_nome || result.data.startupNome,
          contato_endereco: v.contato_endereco || result.data.enderecoCompleto,
          contato_cidade: v.contato_cidade || result.data.cidade,
          contato_estado: v.contato_estado || result.data.estado,
        }));
      }
    });
  }

  function handleAusenteChange(checked: boolean) {
    setValues((v) => ({
      ...v,
      startup_cnpj_ausente: checked,
      startup_cnpj: checked ? "" : v.startup_cnpj,
    }));
    setCnpjStatus("idle");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = step2Schema.safeParse(values);

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
          <FieldLabel htmlFor="startup_cnpj" required={!values.startup_cnpj_ausente}>
            CNPJ
          </FieldLabel>
          <Input
            id="startup_cnpj"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            value={values.startup_cnpj}
            disabled={values.startup_cnpj_ausente}
            onChange={(e) => handleCnpjChange(e.target.value)}
          />
          {cnpjStatus === "loading" && (
            <FieldDescription>Consultando dados do CNPJ...</FieldDescription>
          )}
          {cnpjStatus === "success" && (
            <FieldDescription className="text-success-700">
              CNPJ encontrado, dados preenchidos automaticamente.
            </FieldDescription>
          )}
          {cnpjStatus === "not_found" && (
            <FieldDescription>
              Não encontramos esse CNPJ na Receita Federal. Confira o número digitado.
            </FieldDescription>
          )}
          {cnpjStatus === "error" && (
            <FieldDescription>
              Não foi possível consultar o CNPJ agora. Você pode continuar e preencher os
              próximos dados manualmente.
            </FieldDescription>
          )}
          <FieldError errors={errors.startup_cnpj?.map((message) => ({ message }))} />
          <label className="mt-1 flex items-start gap-2 text-sm text-foreground">
            <Checkbox
              checked={values.startup_cnpj_ausente}
              onCheckedChange={(value) => handleAusenteChange(value === true)}
              className="mt-0.5"
            />
            Ainda não possuo CNPJ
          </label>
        </Field>

        <Field>
          <FieldLabel htmlFor="startup_nome" required>
            Nome do Negócio
          </FieldLabel>
          <Input
            id="startup_nome"
            placeholder="Ex.: Cumaú Tech"
            value={values.startup_nome}
            onChange={(e) => setValues((v) => ({ ...v, startup_nome: e.target.value }))}
          />
          <FieldError errors={errors.startup_nome?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="contato_endereco" optional>
            Endereço comercial
          </FieldLabel>
          <Input
            id="contato_endereco"
            placeholder="Rua, número, bairro"
            value={values.contato_endereco}
            onChange={(e) =>
              setValues((v) => ({ ...v, contato_endereco: e.target.value }))
            }
          />
          <FieldError errors={errors.contato_endereco?.map((message) => ({ message }))} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="contato_estado" required>
              Estado
            </FieldLabel>
            <Select
              items={BRAZIL_STATES}
              value={values.contato_estado}
              onValueChange={(value) =>
                setValues((v) => ({
                  ...v,
                  contato_estado: value as string,
                  contato_cidade: v.contato_estado === value ? v.contato_cidade : "",
                }))
              }
            >
              <SelectTrigger id="contato_estado" className="w-full">
                <SelectValue placeholder="UF">
                  {(value: string | null) => value || "UF"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BRAZIL_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value} label={state.value}>
                    {state.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.contato_estado?.map((message) => ({ message }))} />
          </Field>

          <Field className="col-span-2">
            <FieldLabel htmlFor="contato_cidade" required>
              Cidade
            </FieldLabel>
            <CityCombobox
              id="contato_cidade"
              uf={values.contato_estado}
              value={values.contato_cidade}
              onValueChange={(city) => setValues((v) => ({ ...v, contato_cidade: city }))}
            />
            <FieldError errors={errors.contato_cidade?.map((message) => ({ message }))} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="startup_descricao" required>
            Descrição do negócio
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="startup_descricao"
              rows={4}
              maxLength={500}
              placeholder="Conte o que a startup faz, o problema que resolve e o modelo de negócio."
              value={values.startup_descricao}
              onChange={(e) =>
                setValues((v) => ({ ...v, startup_descricao: e.target.value }))
              }
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>{values.startup_descricao.length}/500</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={errors.startup_descricao?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <div className="flex items-center gap-1.5">
            <FieldLabel required>Fase do negócio</FieldLabel>
            <Dialog>
              <DialogTrigger
                aria-label="O que significa cada fase do negócio?"
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconInfoCircle className="size-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-sans">Fases do negócio</DialogTitle>
                </DialogHeader>
                <div className="flex max-h-[60vh] flex-col divide-y divide-neutral-200 overflow-y-auto">
                  {BUSINESS_PHASES.map((phase) => (
                    <div key={phase.value} className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-foreground">{phase.label}</p>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Objetivo: </span>
                          {phase.objetivo}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            O que acontece:{" "}
                          </span>
                          {phase.oQueAcontece}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Métrica-chave:{" "}
                          </span>
                          {phase.metricaChave}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Select
            items={BUSINESS_PHASES}
            value={values.fase_negocio}
            onValueChange={(value) =>
              setValues((v) => ({ ...v, fase_negocio: value as string }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a fase do negócio" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_PHASES.map((phase) => (
                <SelectItem key={phase.value} value={phase.value} label={phase.label}>
                  {phase.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.fase_negocio?.map((message) => ({ message }))} />
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
