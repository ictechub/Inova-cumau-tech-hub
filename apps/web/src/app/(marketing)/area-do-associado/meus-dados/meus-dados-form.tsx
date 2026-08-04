"use client";

import { useActionState, useEffect, useRef, useTransition, useState } from "react";
import { IconCamera, IconInfoCircle } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  FieldSeparator,
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
import { toast } from "@/components/ui/toast";
import { PhoneCountryInput } from "@/components/registration-wizard/phone-country-input";
import { MultiSelectCombobox } from "@/components/registration-wizard/multi-select-combobox";
import {
  BUSINESS_PHASES,
  TECH_SEGMENTS,
  OBJETIVOS_FILIACAO,
} from "@/components/registration-wizard/constants";
import { formatCNPJ } from "@/lib/masks";
import {
  updateMeusDados,
  lookupCnpj,
  uploadAvatar,
  deleteAvatar,
  type UpdateResult,
} from "./actions";

type CnpjLookupStatus =
  | "idle"
  | "loading"
  | "success"
  | "not_found"
  | "invalid"
  | "error";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

type InitialData = {
  avatar_url?: string | null;
  responsavel_nome: string;
  responsavel_email: string;
  responsavel_telefone: string;
  responsavel_whatsapp: string | null;
  responsavel_cargo: string;
  startup_nome: string;
  startup_cnpj: string | null;
  startup_cnpj_ausente: boolean;
  contato_endereco: string | null;
  contato_cidade: string;
  fase_negocio: string;
  startup_descricao: string;
  segmentos: string[];
  segmento_outro: string | null;
  segmentacao_outros_detalhes: string | null;
  objetivo_filiacao: string[];
  objetivo_filiacao_outro: string | null;
};

export function MeusDadosForm({ initial }: { initial: InitialData }) {
  const [state, formAction, isPending] = useActionState<UpdateResult | null, FormData>(
    updateMeusDados,
    null,
  );

  const [, startTransition] = useTransition();

  const [responsavel_nome, setResponsavelNome] = useState(initial.responsavel_nome);
  const [responsavel_email, setResponsavelEmail] = useState(initial.responsavel_email);
  const [responsavel_telefone, setResponsavelTelefone] = useState(initial.responsavel_telefone);
  const [responsavel_whatsapp, setResponsavelWhatsapp] = useState(
    initial.responsavel_whatsapp ?? "",
  );
  const [responsavel_cargo, setResponsavelCargo] = useState(initial.responsavel_cargo);

  const [startup_nome, setStartupNome] = useState(initial.startup_nome);
  const [startup_cnpj, setStartupCnpj] = useState(
    initial.startup_cnpj ? formatCNPJ(initial.startup_cnpj) : "",
  );
  const [startup_cnpj_ausente, setStartupCnpjAusente] = useState(initial.startup_cnpj_ausente);
  const [contato_endereco, setContatoEndereco] = useState(initial.contato_endereco ?? "");
  const [contato_cidade, setContatoCidade] = useState(initial.contato_cidade);
  const [fase_negocio, setFaseNegocio] = useState(initial.fase_negocio);
  const [startup_descricao, setStartupDescricao] = useState(initial.startup_descricao);
  const [cnpjStatus, setCnpjStatus] = useState<CnpjLookupStatus>("idle");

  const [segmentos, setSegmentos] = useState<string[]>(initial.segmentos ?? []);
  const [segmento_outro, setSegmentoOutro] = useState(initial.segmento_outro ?? "");
  const [segmentacao_outros_detalhes, setSegmentacaoOutrosDetalhes] = useState(
    initial.segmentacao_outros_detalhes ?? "",
  );
  const [objetivo_filiacao, setObjetivoFiliacao] = useState<string[]>(
    initial.objetivo_filiacao ?? [],
  );
  const [objetivo_filiacao_outro, setObjetivoFiliacaoOutro] = useState(
    initial.objetivo_filiacao_outro ?? "",
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors =
    state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Dados salvos com sucesso." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  function handleCnpjChange(rawValue: string) {
    const formatted = formatCNPJ(rawValue);
    setStartupCnpj(formatted);
    setCnpjStatus("idle");

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 14) return;

    startTransition(async () => {
      setCnpjStatus("loading");
      const result = await lookupCnpj(digits);
      setCnpjStatus(result.status);

      if (result.status === "success") {
        setStartupNome((v) => v || result.data.startupNome);
        setContatoEndereco((v) => v || result.data.enderecoCompleto);
        setContatoCidade((v) => v || result.data.cidade);
      }
    });
  }

  function handleAusenteChange(checked: boolean) {
    setStartupCnpjAusente(checked);
    if (checked) setStartupCnpj("");
    setCnpjStatus("idle");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsUploadingAvatar(true);
    const result = await uploadAvatar(file);
    setIsUploadingAvatar(false);
    if (result.status === "success") {
      setAvatarUrl(result.avatarUrl);
      toast.add({ type: "success", description: "Foto atualizada com sucesso." });
    } else {
      toast.add({ type: "error", description: result.message });
    }
  }

  async function handleDeleteAvatar() {
    setIsUploadingAvatar(true);
    const result = await deleteAvatar();
    setIsUploadingAvatar(false);
    if (result.status === "success") {
      setAvatarUrl(null);
      toast.add({ type: "success", description: "Foto removida." });
    } else {
      toast.add({ type: "error", description: result.message });
    }
  }

  return (
    <form action={formAction}>
      {/* ── Foto de perfil ─────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-14 rounded-lg after:hidden">
          <AvatarImage src={avatarUrl ?? ""} alt="Foto de perfil" className="rounded-lg object-cover" />
          <AvatarFallback className="rounded-lg text-sm font-medium">
            {getInitials(responsavel_nome || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              <IconCamera className="mr-1.5 size-4" />
              {isUploadingAvatar ? "Enviando..." : "Alterar foto"}
            </Button>
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteAvatar}
                disabled={isUploadingAvatar}
              >
                Excluir foto
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP · máx. 2 MB</p>
        </div>
      </div>

      {/* Hidden fields para arrays e booleanos */}
      <input type="hidden" name="startup_cnpj_ausente" value={String(startup_cnpj_ausente)} />
      {segmentos.map((s) => (
        <input key={s} type="hidden" name="segmentos" value={s} />
      ))}
      {objetivo_filiacao.map((o) => (
        <input key={o} type="hidden" name="objetivo_filiacao" value={o} />
      ))}

      <FieldGroup>
        {/* ── Seção: Responsável ─────────────────────────────────────── */}
        <h2 className="font-sans text-base font-semibold text-foreground">Responsável</h2>

        <Field>
          <FieldLabel htmlFor="responsavel_nome" required>
            Nome completo
          </FieldLabel>
          <Input
            id="responsavel_nome"
            name="responsavel_nome"
            placeholder="Nome e sobrenome"
            value={responsavel_nome}
            onChange={(e) => setResponsavelNome(e.target.value)}
          />
          <FieldError errors={errors.responsavel_nome?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="responsavel_email" required>
            E-mail
          </FieldLabel>
          <Input
            id="responsavel_email"
            name="responsavel_email"
            type="email"
            placeholder="voce@exemplo.com"
            value={responsavel_email}
            onChange={(e) => setResponsavelEmail(e.target.value)}
          />
          <FieldError errors={errors.responsavel_email?.map((message) => ({ message }))} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="responsavel_telefone" required>
              Celular
            </FieldLabel>
            <PhoneCountryInput
              id="responsavel_telefone"
              value={responsavel_telefone}
              onChange={setResponsavelTelefone}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />
            <input type="hidden" name="responsavel_telefone" value={responsavel_telefone} />
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
              value={responsavel_whatsapp}
              onChange={setResponsavelWhatsapp}
              placeholder="(00) 00000-0000"
            />
            <input type="hidden" name="responsavel_whatsapp" value={responsavel_whatsapp} />
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
            name="responsavel_cargo"
            placeholder="Ex.: CEO, CTO, Fundador(a)"
            value={responsavel_cargo}
            onChange={(e) => setResponsavelCargo(e.target.value)}
          />
          <FieldError errors={errors.responsavel_cargo?.map((message) => ({ message }))} />
        </Field>

        <FieldSeparator />

        {/* ── Seção: Negócio ─────────────────────────────────────────── */}
        <h2 className="font-sans text-base font-semibold text-foreground">Negócio</h2>

        <Field>
          <FieldLabel
            htmlFor="startup_cnpj"
            required={!startup_cnpj_ausente}
          >
            CNPJ
          </FieldLabel>
          <Input
            id="startup_cnpj"
            name="startup_cnpj"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            value={startup_cnpj}
            disabled={startup_cnpj_ausente}
            onChange={(e) => handleCnpjChange(e.target.value)}
          />
          {cnpjStatus === "loading" && (
            <FieldDescription>Consultando dados do CNPJ...</FieldDescription>
          )}
          {cnpjStatus === "success" && (
            <FieldDescription className="text-success-700">
              CNPJ encontrado — dados preenchidos automaticamente.
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
              dados manualmente.
            </FieldDescription>
          )}
          <FieldError errors={errors.startup_cnpj?.map((message) => ({ message }))} />
          <label className="mt-1 flex items-start gap-2 text-sm text-foreground">
            <Checkbox
              checked={startup_cnpj_ausente}
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
            name="startup_nome"
            placeholder="Ex.: Cumaú Tech"
            value={startup_nome}
            onChange={(e) => setStartupNome(e.target.value)}
          />
          <FieldError errors={errors.startup_nome?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="contato_endereco" optional>
            Endereço comercial
          </FieldLabel>
          <Input
            id="contato_endereco"
            name="contato_endereco"
            placeholder="Rua, número, bairro"
            value={contato_endereco}
            onChange={(e) => setContatoEndereco(e.target.value)}
          />
          <FieldError errors={errors.contato_endereco?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="contato_cidade" required>
            Cidade
          </FieldLabel>
          <Input
            id="contato_cidade"
            name="contato_cidade"
            placeholder="Ex.: Santana/AP"
            value={contato_cidade}
            onChange={(e) => setContatoCidade(e.target.value)}
          />
          <FieldError errors={errors.contato_cidade?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="startup_descricao" required>
            Descrição do negócio
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id="startup_descricao"
              name="startup_descricao"
              rows={4}
              maxLength={500}
              placeholder="Conte o que a startup faz, o problema que resolve e o modelo de negócio."
              value={startup_descricao}
              onChange={(e) => setStartupDescricao(e.target.value)}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>{startup_descricao.length}/500</InputGroupText>
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
                    <div
                      key={phase.value}
                      className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0"
                    >
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
            value={fase_negocio}
            onValueChange={(value) => setFaseNegocio(value as string)}
          >
            <input type="hidden" name="fase_negocio" value={fase_negocio} />
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

        <FieldSeparator />

        {/* ── Seção: Segmentação ─────────────────────────────────────── */}
        <h2 className="font-sans text-base font-semibold text-foreground">Segmentação</h2>

        <Field>
          <FieldLabel required>Segmentos de atuação</FieldLabel>
          <MultiSelectCombobox
            options={TECH_SEGMENTS}
            value={segmentos}
            onChange={setSegmentos}
            placeholder="Selecione os segmentos"
            searchPlaceholder="Buscar segmento..."
            emptyMessage="Nenhum segmento encontrado."
          />
          <FieldError errors={errors.segmentos?.map((message) => ({ message }))} />
        </Field>

        {segmentos.includes("outra") && (
          <Field>
            <FieldLabel htmlFor="segmento_outro" required>
              Qual segmento?
            </FieldLabel>
            <Input
              id="segmento_outro"
              name="segmento_outro"
              placeholder="Ex.: Fintech, Edtech"
              value={segmento_outro}
              onChange={(e) => setSegmentoOutro(e.target.value)}
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
              name="segmentacao_outros_detalhes"
              rows={3}
              maxLength={200}
              placeholder="Outras informações relevantes sobre a área de atuação da startup."
              value={segmentacao_outros_detalhes}
              onChange={(e) => setSegmentacaoOutrosDetalhes(e.target.value)}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText>{segmentacao_outros_detalhes.length}/200</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>

        <Field>
          <FieldLabel required>Objetivo da filiação</FieldLabel>
          <MultiSelectCombobox
            options={OBJETIVOS_FILIACAO}
            value={objetivo_filiacao}
            onChange={setObjetivoFiliacao}
            placeholder="Selecione os objetivos"
            searchPlaceholder="Buscar objetivo..."
            emptyMessage="Nenhum objetivo encontrado."
          />
          <FieldError errors={errors.objetivo_filiacao?.map((message) => ({ message }))} />
        </Field>

        {objetivo_filiacao.includes("outros") && (
          <Field>
            <FieldLabel htmlFor="objetivo_filiacao_outro" required>
              Qual objetivo?
            </FieldLabel>
            <Input
              id="objetivo_filiacao_outro"
              name="objetivo_filiacao_outro"
              placeholder="Descreva o objetivo"
              value={objetivo_filiacao_outro}
              onChange={(e) => setObjetivoFiliacaoOutro(e.target.value)}
            />
            <FieldError
              errors={errors.objetivo_filiacao_outro?.map((message) => ({ message }))}
            />
          </Field>
        )}

        <Field orientation="horizontal" className="mt-2 justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
