"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconCircleCheck, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";

import { createClient } from "@inova-cumau/supabase/client";
import { PASSWORD_REQUIREMENTS } from "@/components/registration-wizard/schema";
import { passwordSchema } from "@/app/admin/configuracoes/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Status = "verificando" | "pronto" | "invalido" | "enviando";

export default function DefinirSenhaPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verificando");
  const [showPassword, setShowPassword] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function restoreSession() {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setStatus("invalido");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      setStatus(error ? "invalido" : "pronto");
    }

    restoreSession();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsed = passwordSchema.safeParse({ senha, confirmar_senha: confirmarSenha });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setErrors({});
    setStatus("enviando");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setStatus("pronto");
      toast.add({ type: "error", description: "Não foi possível definir a senha. Tente novamente." });
      return;
    }

    toast.add({ type: "success", description: "Senha definida com sucesso." });
    router.push("/admin");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {status === "verificando" && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Verificando convite...</p>
              </div>
            )}

            {status === "invalido" && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <h1 className="text-xl font-bold">Convite inválido ou expirado</h1>
                <p className="text-sm text-balance text-muted-foreground">
                  Solicite um novo convite ao administrador da plataforma.
                </p>
                <Link
                  href="/entrar"
                  className="mt-4 text-sm underline-offset-2 hover:underline"
                >
                  Voltar para o login
                </Link>
              </div>
            )}

            {(status === "pronto" || status === "enviando") && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Defina sua senha</h1>
                  <p className="text-balance text-muted-foreground">
                    Crie uma senha para acessar sua conta na Inova Cumaú
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Input
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Mínimo de 8 caracteres"
                      className="pr-9"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      aria-invalid={!!errors.senha}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <IconEyeOff className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </button>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {PASSWORD_REQUIREMENTS.map((requirement) => {
                      const met = requirement.test(senha);
                      return (
                        <li
                          key={requirement.label}
                          className={cn(
                            "flex items-center gap-1.5 text-xs",
                            met ? "text-success-700" : "text-muted-foreground",
                          )}
                        >
                          <IconCircleCheck className="size-3.5 shrink-0" aria-hidden />
                          {requirement.label}
                        </li>
                      );
                    })}
                  </ul>
                  <FieldError errors={errors.senha?.map((message) => ({ message }))} />
                </div>

                <div className="flex flex-col gap-2">
                  <Input
                    name="confirmar_senha"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    aria-invalid={!!errors.confirmar_senha}
                  />
                  <FieldError errors={errors.confirmar_senha?.map((message) => ({ message }))} />
                </div>

                <Button type="submit" className="mt-2 h-10" disabled={status === "enviando"}>
                  {status === "enviando" ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    "Definir senha e acessar"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
