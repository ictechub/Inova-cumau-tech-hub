"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import {
  IconBold,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconQuote,
  IconTrash,
  IconUnderline,
  IconUserPlus,
  IconVideo,
  IconX,
} from "@tabler/icons-react";

import { MultiSelectCombobox, type MultiSelectOption } from "@/components/registration-wizard/multi-select-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import type { ProjectAccessLevel } from "@/lib/project-access";
import { PROJECT_TAGS } from "@/lib/project-tags";
import { tiptapExtensions } from "@/lib/tiptap-extensions";

import {
  deleteProject,
  grantProjectPermission,
  publishProject,
  revokeProjectPermission,
  unpublishProject,
  updateProject,
  uploadProjectMedia,
  type ActionResult,
} from "./actions";

export type ProjectData = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  cover_image_url: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
};

export type ProjectPermission = {
  id: string;
  user_id: string;
  permission: "ver" | "editar" | "compartilhar";
  nome: string;
};

export type ShareableUser = {
  user_id: string;
  nome: string;
};

const TAG_OPTIONS: MultiSelectOption[] = PROJECT_TAGS.map((tag) => ({ value: tag, label: tag }));

const PERMISSION_OPTIONS = [
  { value: "ver", label: "Ver" },
  { value: "editar", label: "Editar" },
  { value: "compartilhar", label: "Compartilhar" },
] as const;

const PERMISSION_ITEMS = Object.fromEntries(PERMISSION_OPTIONS.map((o) => [o.value, o.label]));

const PERMISSION_LABELS: Record<string, string> = PERMISSION_ITEMS;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function EditorToolbar({
  editor,
  projectId,
  disabled,
}: {
  editor: Editor | null;
  projectId: string;
  disabled: boolean;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File, kind: "image" | "video") {
    setUploading(true);
    const result = await uploadProjectMedia(projectId, file);
    setUploading(false);

    if (result.status !== "success") {
      toast.add({ type: "error", description: result.message });
      return;
    }

    if (kind === "image") {
      editor?.chain().focus().setImage({ src: result.url }).run();
    } else {
      editor?.chain().focus().insertContent({ type: "video", attrs: { src: result.url } }).run();
    }
  }

  function handleLink() {
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-input bg-muted/30 p-1">
      <ToolbarButton
        label="Negrito"
        active={editor.isActive("bold")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Itálico"
        active={editor.isActive("italic")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Sublinhado"
        active={editor.isActive("underline")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleMark("underline").run()}
      >
        <IconUnderline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Título 1"
        active={editor.isActive("heading", { level: 1 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <IconH1 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Título 2"
        active={editor.isActive("heading", { level: 2 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Título 3"
        active={editor.isActive("heading", { level: 3 })}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista com marcadores"
        active={editor.isActive("bulletList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconList className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive("orderedList")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListNumbers className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Citação"
        active={editor.isActive("blockquote")}
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive("link")} disabled={disabled} onClick={handleLink}>
        <IconLink className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inserir imagem"
        disabled={disabled || uploading}
        onClick={() => imageInputRef.current?.click()}
      >
        <IconPhoto className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inserir vídeo"
        disabled={disabled || uploading}
        onClick={() => videoInputRef.current?.click()}
      >
        <IconVideo className="size-4" />
      </ToolbarButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file, "image");
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file, "video");
        }}
      />
    </div>
  );
}

function PublishControls({
  projectId,
  status,
  canEdit,
  onStatusChange,
}: {
  projectId: string;
  status: string;
  canEdit: boolean;
  onStatusChange: (status: string, publishedAt: string | null) => void;
}) {
  const [publishState, publishAction, publishPending] = useActionState<ActionResult | null, FormData>(
    publishProject,
    null,
  );
  const [unpublishState, unpublishAction, unpublishPending] = useActionState<ActionResult | null, FormData>(
    unpublishProject,
    null,
  );

  useEffect(() => {
    if (!publishState) return;
    if (publishState.status === "success") {
      toast.add({ type: "success", description: "Projeto publicado." });
      onStatusChange("publicado", new Date().toISOString());
    } else if (publishState.status === "error") {
      toast.add({ type: "error", description: publishState.message });
    }
  }, [publishState, onStatusChange]);

  useEffect(() => {
    if (!unpublishState) return;
    if (unpublishState.status === "success") {
      toast.add({ type: "success", description: "Publicação revertida." });
      onStatusChange("rascunho", null);
    } else if (unpublishState.status === "error") {
      toast.add({ type: "error", description: unpublishState.message });
    }
  }, [unpublishState, onStatusChange]);

  if (!canEdit) return null;

  if (status === "publicado") {
    return (
      <form action={unpublishAction}>
        <input type="hidden" name="project_id" value={projectId} />
        <Button type="submit" variant="outline" disabled={unpublishPending}>
          <IconEyeOff />
          Despublicar
        </Button>
      </form>
    );
  }

  return (
    <form action={publishAction}>
      <input type="hidden" name="project_id" value={projectId} />
      <Button type="submit" disabled={publishPending}>
        <IconEye />
        Publicar
      </Button>
    </form>
  );
}

function DeleteProjectDialog({ projectId, title }: { projectId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(deleteProject, null);

  useEffect(() => {
    if (!state) return;
    if (state.status === "error") {
      toast.add({ type: "error", description: state.message });
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <IconTrash />
        Excluir
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o projeto &quot;{title}&quot;? Essa ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="project_id" value={projectId} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" variant="destructive">
              Excluir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsSection({
  projectId,
  permissions,
  shareableUsers,
}: {
  projectId: string;
  permissions: ProjectPermission[];
  shareableUsers: ShareableUser[];
}) {
  const [grantState, grantAction, grantPending] = useActionState<ActionResult | null, FormData>(
    grantProjectPermission,
    null,
  );
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<string>("ver");

  useEffect(() => {
    if (!grantState) return;
    if (grantState.status === "success") {
      toast.add({ type: "success", description: "Permissão concedida." });
      setSelectedUserId("");
    } else if (grantState.status === "error") {
      toast.add({ type: "error", description: grantState.message });
    }
  }, [grantState]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões de acesso</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead className="w-40">Nível</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma permissão concedida.
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{PERMISSION_LABELS[permission.permission] ?? permission.permission}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RevokePermissionButton projectId={projectId} permissionId={permission.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {shareableUsers.length > 0 && (
          <form action={grantAction} className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-end">
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="user_id" value={selectedUserId} />
            <input type="hidden" name="permission" value={selectedPermission} />
            <div className="flex flex-1 flex-col gap-2">
              <Label>Usuário</Label>
              <Select
                items={Object.fromEntries(shareableUsers.map((u) => [u.user_id, u.nome]))}
                value={selectedUserId}
                onValueChange={(value) => setSelectedUserId(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {shareableUsers.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Nível</Label>
              <Select
                items={PERMISSION_ITEMS}
                value={selectedPermission}
                onValueChange={(value) => setSelectedPermission(value as string)}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!selectedUserId || grantPending}>
              <IconUserPlus />
              Conceder
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function RevokePermissionButton({ projectId, permissionId }: { projectId: string; permissionId: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(revokeProjectPermission, null);

  useEffect(() => {
    if (state?.status === "error") toast.add({ type: "error", description: state.message });
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="permission_id" value={permissionId} />
      <Button type="submit" variant="ghost" size="icon-sm" aria-label="Remover permissão">
        <IconX className="size-4" />
      </Button>
    </form>
  );
}

export function ProjectEditor({
  project,
  accessLevel,
  permissions,
  shareableUsers,
}: {
  project: ProjectData;
  accessLevel: ProjectAccessLevel;
  permissions: ProjectPermission[];
  shareableUsers: ShareableUser[];
}) {
  const canEdit = accessLevel === "total" || accessLevel === "editar";
  const canManage = accessLevel === "total";

  const [status, setStatus] = useState(project.status);
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [coverUrl, setCoverUrl] = useState(project.cover_image_url);
  const [tags, setTags] = useState<string[]>(project.tags);
  const [coverUploading, setCoverUploading] = useState(false);

  const contentInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [saveState, saveAction, savePending] = useActionState<ActionResult | null, FormData>(updateProject, null);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: (project.content as Record<string, unknown>) ?? { type: "doc", content: [] },
    editable: canEdit,
    immediatelyRender: false,
  });

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(() => {
    if (!saveState) return;
    if (saveState.status === "success") {
      toast.add({ type: "success", description: "Projeto salvo." });
    } else if (saveState.status === "error") {
      toast.add({ type: "error", description: saveState.message });
    }
  }, [saveState]);

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCoverUploading(true);
    const result = await uploadProjectMedia(project.id, file);
    setCoverUploading(false);

    if (result.status === "success") {
      setCoverUrl(result.url);
    } else {
      toast.add({ type: "error", description: result.message });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-sans text-2xl font-medium text-foreground">{title || "Novo projeto"}</h1>
          <Badge variant={status === "publicado" ? "default" : "secondary"} className="w-fit">
            {status === "publicado" ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <PublishControls
            projectId={project.id}
            status={status}
            canEdit={canEdit}
            onStatusChange={(next) => setStatus(next)}
          />
          {canManage && <DeleteProjectDialog projectId={project.id} title={title} />}
        </div>
      </div>

      <form
        action={saveAction}
        onSubmit={() => {
          if (contentInputRef.current && editor) {
            contentInputRef.current.value = JSON.stringify(editor.getJSON());
          }
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="project_id" value={project.id} />
        <input
          ref={contentInputRef}
          type="hidden"
          name="content"
          defaultValue={JSON.stringify(project.content ?? { type: "doc", content: [] })}
        />
        <input type="hidden" name="cover_image_url" value={coverUrl ?? ""} />
        {tags.map((tag) => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}

        <Card>
          <CardContent className="flex flex-col gap-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  disabled={!canEdit}
                  onChange={(event) => {
                    const value = event.target.value;
                    setTitle(value);
                    if (!slugEdited) setSlug(slugify(value));
                  }}
                />
                {saveState?.status === "validation_error" && saveState.errors.title && (
                  <p className="text-xs text-destructive">{saveState.errors.title[0]}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  disabled={!canEdit}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(slugify(event.target.value));
                  }}
                />
                {saveState?.status === "validation_error" && saveState.errors.slug && (
                  <p className="text-xs text-destructive">{saveState.errors.slug[0]}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <MultiSelectCombobox
                options={TAG_OPTIONS}
                value={tags}
                onChange={setTags}
                placeholder="Selecione as tags"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Imagem de capa</Label>
              <div className="flex items-center gap-3">
                {coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className="h-16 w-24 rounded-md object-cover ring-1 ring-border" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canEdit || coverUploading}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <IconPhoto />
                  {coverUrl ? "Trocar imagem" : "Enviar imagem"}
                </Button>
                {coverUrl && canEdit && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl(null)}>
                    Remover
                  </Button>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>

            <div className="flex flex-col">
              <EditorToolbar editor={editor} projectId={project.id} disabled={!canEdit} />
              {editor && (
                <EditorContent
                  editor={editor}
                  className="min-h-72 rounded-b-lg border border-input px-3 py-2 text-sm [&_.ProseMirror]:min-h-64 [&_.ProseMirror]:outline-none [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_video]:max-w-full"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button type="submit" disabled={savePending}>
              <IconDeviceFloppy />
              Salvar
            </Button>
          </div>
        )}
      </form>

      {canManage && (
        <PermissionsSection projectId={project.id} permissions={permissions} shareableUsers={shareableUsers} />
      )}
    </div>
  );
}
