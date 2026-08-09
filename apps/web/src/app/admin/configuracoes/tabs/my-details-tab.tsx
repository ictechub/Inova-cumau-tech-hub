"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { IconCamera } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { SettingsRow, SettingsSection } from "@/components/settings-row";

import { deleteAvatar, uploadAvatar } from "@/app/(marketing)/area-do-associado/meus-dados/actions";
import { updateMyDetails, type ActionResult } from "../actions";
import type { ConfiguracoesInitialData } from "../configuracoes-tabs";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

export function MyDetailsTab({ initial }: { initial: ConfiguracoesInitialData }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateMyDetails,
    null,
  );

  const [responsavelNome, setResponsavelNome] = useState(initial.responsavel_nome);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = state?.status === "validation_error" ? state.errors : {};

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      toast.add({ type: "success", description: "Dados salvos com sucesso." });
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

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
      <SettingsSection
        title="My Details"
        description="Suas informações pessoais, visíveis para os demais administradores."
        actions={
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      >
        <SettingsRow label="Foto" description="Sua foto de perfil, exibida para os demais administradores.">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-lg after:hidden">
              <AvatarImage
                src={avatarUrl ?? ""}
                alt="Foto de perfil"
                className="rounded-lg object-cover"
              />
              <AvatarFallback className="rounded-lg text-sm font-medium">
                {getInitials(responsavelNome || "?")}
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
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={isUploadingAvatar}
                  >
                    Excluir foto
                  </Button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">JPEG, PNG ou WebP · máx. 2 MB</span>
            </div>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Nome completo"
          description="Como você aparece para os demais administradores."
        >
          <Input
            name="responsavel_nome"
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
            aria-invalid={!!errors.responsavel_nome}
          />
          <FieldError errors={errors.responsavel_nome?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="Cargo / função" description="Seu papel dentro da startup ou da associação.">
          <Input
            name="responsavel_cargo"
            defaultValue={initial.responsavel_cargo}
            maxLength={30}
            aria-invalid={!!errors.responsavel_cargo}
          />
          <FieldError errors={errors.responsavel_cargo?.map((message) => ({ message }))} />
        </SettingsRow>

        <SettingsRow label="E-mail de acesso" description="Para alterar o e-mail de login, use a aba Email.">
          <Input value={initial.responsavel_email ?? ""} disabled readOnly />
        </SettingsRow>
      </SettingsSection>
    </form>
  );
}
