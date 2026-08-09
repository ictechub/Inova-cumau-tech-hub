"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { IconFilePlus, IconSearch } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { PROJECT_TAGS } from "@/lib/project-tags";
import { createProject, type ActionResult } from "./actions";

export type AdminProject = {
  id: string;
  title: string;
  tags: string[];
  status: string;
  updated_at: string;
  owner_id: string;
  owner_nome: string | null;
};

const TODAS = "todas";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
};

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CriarProjetoButton() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createProject,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.status === "success") {
      router.push(`/admin/ferramentas/projetos/${state.project_id}`);
    } else if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <Button size="sm" type="submit" disabled={isPending}>
        <IconFilePlus />
        Criar novo projeto
      </Button>
    </form>
  );
}

export function ProjetosTab({ projetos }: { projetos: AdminProject[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroTag, setFiltroTag] = useState<string>(TODAS);

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return projetos.filter((projeto) => {
      const combinaBusca = !termo || projeto.title.toLowerCase().includes(termo);
      const combinaTag = filtroTag === TODAS || projeto.tags.includes(filtroTag);
      return combinaBusca && combinaTag;
    });
  }, [projetos, busca, filtroTag]);

  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-64">
          <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por título"
            className="pl-8"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[filtroTag]}
            onValueChange={(value) => {
              if (value[0]) setFiltroTag(value[0]);
            }}
          >
            <ToggleGroupItem value={TODAS}>Todas</ToggleGroupItem>
            {PROJECT_TAGS.map((tag) => (
              <ToggleGroupItem key={tag} value={tag}>
                {tag}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <CriarProjetoButton />
        </div>
      </div>
      <div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-40">Responsável</TableHead>
              <TableHead className="w-28">Atualizado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              projetosFiltrados.map((projeto) => (
                <TableRow
                  key={projeto.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/ferramentas/projetos/${projeto.id}`)}
                >
                  <TableCell className="whitespace-normal font-medium text-foreground">
                    {projeto.title}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {projeto.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sem tags</span>
                      ) : (
                        projeto.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={projeto.status === "publicado" ? "default" : "outline"}>
                      {STATUS_LABELS[projeto.status] ?? projeto.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {projeto.owner_nome ?? "Não informado"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatData(projeto.updated_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
