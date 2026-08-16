"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCheck,
  IconChevronDown,
  IconCloudCheck,
  IconCloudOff,
  IconCloudUpload,
  IconCopy,
  IconWorld,
  IconEye,
  IconEyeOff,
  IconH1,
  IconH2,
  IconH3,
  IconIndentDecrease,
  IconIndentIncrease,
  IconItalic,
  IconLineHeight,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconPhoto,
  IconQuote,
  IconUnderline,
  IconUserPlus,
  IconVideo,
} from "@tabler/icons-react";

import { MultiSelectCombobox, type MultiSelectOption } from "@/components/registration-wizard/multi-select-combobox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProjectAccessLevel } from "@/lib/project-access";
import { PROJECT_SECTIONS } from "@/lib/project-sections";
import { PROJECT_TAGS } from "@/lib/project-tags";
import { slugify } from "@/lib/slug";
import {
  BULLET_LIST_STYLES,
  LINE_HEIGHT_OPTIONS,
  MAX_INDENT_LEVEL,
  ORDERED_LIST_STYLES,
  TASK_LIST_STYLES,
  tiptapExtensions,
} from "@/lib/tiptap-extensions";
import { cn } from "@/lib/utils";

import {
  grantProjectPermission,
  publishProject,
  revokeProjectPermission,
  unpublishProject,
  updateProject,
  updateProjectLinkAccess,
  uploadProjectMedia,
  type ActionResult,
} from "./actions";
import type { ProjectData, ProjectOwner, ProjectPermission, ShareableUser } from "./types";

export type { ProjectData, ProjectOwner, ProjectPermission, ShareableUser } from "./types";

const TAG_OPTIONS: MultiSelectOption[] = PROJECT_TAGS.map((tag) => ({ value: tag, label: tag }));

const PROJECT_SECTION_ITEMS = Object.fromEntries(
  PROJECT_SECTIONS.map((section) => [section.value, section.label]),
);

const SHARE_PERMISSION_OPTIONS = [
  { value: "ver", label: "Pode visualizar", description: "Pode ver o conteúdo, sem fazer alterações." },
  { value: "editar", label: "Pode editar", description: "Pode alterar o conteúdo do projeto." },
  { value: "compartilhar", label: "Acesso completo", description: "Pode editar e gerenciar quem tem acesso." },
] as const;

const SHARE_PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  SHARE_PERMISSION_OPTIONS.map((o) => [o.value, o.label]),
);

const LINK_ACCESS_SCOPE_OPTIONS = [
  { value: "restrito", label: "Somente pessoas convidadas", description: "Apenas quem foi convidado pode acessar." },
  { value: "equipe", label: "Todos no time", description: "Qualquer pessoa da equipe com acesso ao admin pode abrir o link." },
] as const;

const LINK_ACCESS_PERMISSION_OPTIONS = [
  { value: "ver", label: "Pode visualizar", description: "Pode ver o conteúdo, sem fazer alterações." },
  { value: "editar", label: "Pode editar", description: "Pode alterar o conteúdo do projeto." },
] as const;

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
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className={active ? "bg-secondary text-secondary-foreground" : undefined}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
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
    try {
      const result = await uploadProjectMedia(projectId, file);

      if (result.status !== "success") {
        toast.add({ type: "error", description: result.message });
        return;
      }

      if (kind === "image") {
        editor?.chain().focus().setImage({ src: result.url }).run();
      } else {
        editor?.chain().focus().insertContent({ type: "video", attrs: { src: result.url } }).run();
      }
    } catch {
      toast.add({ type: "error", description: "Não foi possível enviar o arquivo. Tente novamente." });
    } finally {
      setUploading(false);
    }
  }

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkRange, setLinkRange] = useState<{ from: number; to: number } | null>(null);
  const [linkIsEditing, setLinkIsEditing] = useState(false);

  function openLinkDialog() {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    setLinkRange({ from, to });
    setLinkUrl(previousUrl ?? "");
    setLinkText(from !== to ? editor.state.doc.textBetween(from, to, " ") : "");
    setLinkIsEditing(editor.isActive("link"));
    setLinkDialogOpen(true);
  }

  function confirmLink() {
    if (!editor || !linkRange) return;
    const url = linkUrl.trim();
    if (!url) return;

    const { from, to } = linkRange;
    const selectedText = from !== to ? editor.state.doc.textBetween(from, to, " ") : "";
    const text = linkText.trim() || selectedText || url;
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, { type: "text", text, marks: [{ type: "link", attrs: { href: url } }] })
      .setTextSelection(from + text.length)
      .unsetMark("link")
      .run();
    setLinkDialogOpen(false);
  }

  function removeLink() {
    if (!editor || !linkRange) return;
    editor.chain().focus().setTextSelection(linkRange).extendMarkRange("link").unsetLink().run();
    setLinkDialogOpen(false);
  }

  function applyBulletListStyle(styleId: string) {
    if (!editor) return;
    if (!editor.isActive("bulletList")) {
      editor.chain().focus().toggleBulletList().run();
    }
    editor.chain().focus().updateAttributes("bulletList", { listStyle: styleId }).run();
  }

  function applyOrderedListStyle(styleId: string) {
    if (!editor) return;
    if (!editor.isActive("orderedList")) {
      editor.chain().focus().toggleOrderedList().run();
    }
    editor.chain().focus().updateAttributes("orderedList", { listStyle: styleId }).run();
  }

  function applyTaskListStyle(styleId: string) {
    if (!editor) return;
    if (!editor.isActive("taskList")) {
      editor.chain().focus().toggleTaskList().run();
    }
    editor.chain().focus().updateAttributes("taskList", { listStyle: styleId }).run();
  }

  function isInsideListItem() {
    return editor?.isActive("taskItem") || editor?.isActive("listItem");
  }

  function indentItemType() {
    return editor?.isActive("taskItem") ? "taskItem" : "listItem";
  }

  function textBlockType(): "paragraph" | "heading" | null {
    if (!editor) return null;
    if (editor.isActive("heading")) return "heading";
    if (editor.isActive("paragraph")) return "paragraph";
    return null;
  }

  function currentTextIndent() {
    const type = textBlockType();
    if (!type || !editor) return 0;
    return (editor.getAttributes(type).indent as number | undefined) ?? 0;
  }

  function canIncreaseIndent() {
    if (!editor) return false;
    if (isInsideListItem()) return editor.can().sinkListItem(indentItemType());
    return textBlockType() !== null && currentTextIndent() < MAX_INDENT_LEVEL;
  }

  function canDecreaseIndent() {
    if (!editor) return false;
    if (isInsideListItem()) return editor.can().liftListItem(indentItemType());
    return textBlockType() !== null && currentTextIndent() > 0;
  }

  function increaseIndent() {
    if (!editor) return;
    if (isInsideListItem()) {
      editor.chain().focus().sinkListItem(indentItemType()).run();
      return;
    }
    const type = textBlockType();
    if (!type) return;
    const next = Math.min(currentTextIndent() + 1, MAX_INDENT_LEVEL);
    editor.chain().focus().updateAttributes(type, { indent: next }).run();
  }

  function decreaseIndent() {
    if (!editor) return;
    if (isInsideListItem()) {
      editor.chain().focus().liftListItem(indentItemType()).run();
      return;
    }
    const type = textBlockType();
    if (!type) return;
    const next = Math.max(currentTextIndent() - 1, 0);
    editor.chain().focus().updateAttributes(type, { indent: next }).run();
  }

  function currentLineHeight(): string {
    const type = textBlockType();
    if (!type || !editor) return "1";
    return (editor.getAttributes(type).lineHeight as string | null) || "1";
  }

  function setLineHeight(value: string) {
    if (!editor) return;
    const type = textBlockType();
    if (!type) return;
    editor
      .chain()
      .focus()
      .updateAttributes(type, { lineHeight: value === "1" ? null : value })
      .run();
  }

  function currentSpaceBefore() {
    const type = textBlockType();
    if (!type || !editor) return false;
    return Boolean(editor.getAttributes(type).spaceBefore);
  }

  function currentSpaceAfter() {
    const type = textBlockType();
    if (!type || !editor) return true;
    return editor.getAttributes(type).spaceAfter !== false;
  }

  function toggleSpaceBefore() {
    if (!editor) return;
    const type = textBlockType();
    if (!type) return;
    editor.chain().focus().updateAttributes(type, { spaceBefore: !currentSpaceBefore() }).run();
  }

  function toggleSpaceAfter() {
    if (!editor) return;
    const type = textBlockType();
    if (!type) return;
    editor.chain().focus().updateAttributes(type, { spaceAfter: !currentSpaceAfter() }).run();
  }

  if (!editor) return null;

  return (
    <>
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-input bg-muted/30 p-1">
      <ButtonGroup>
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
      </ButtonGroup>
      <ButtonGroup>
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
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Lista com marcadores"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconList className="size-4" />
        </ToolbarButton>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={disabled}
                      aria-label="Estilos de marcador"
                      className="w-4 px-0"
                    />
                  }
                />
              }
            >
              <IconChevronDown className="size-3" />
            </TooltipTrigger>
            <TooltipContent>Estilos de marcador</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {BULLET_LIST_STYLES.map((style) => (
              <DropdownMenuItem key={style.id} onClick={() => applyBulletListStyle(style.id)}>
                <span className="flex w-6 flex-col items-start gap-0.5 font-mono text-xs leading-none text-muted-foreground">
                  {style.preview.map((marker, index) => (
                    <span key={index}>{marker}</span>
                  ))}
                </span>
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconListNumbers className="size-4" />
        </ToolbarButton>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={disabled}
                      aria-label="Estilos de numeração"
                      className="w-4 px-0"
                    />
                  }
                />
              }
            >
              <IconChevronDown className="size-3" />
            </TooltipTrigger>
            <TooltipContent>Estilos de numeração</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {ORDERED_LIST_STYLES.map((style) => (
              <DropdownMenuItem key={style.id} onClick={() => applyOrderedListStyle(style.id)}>
                <span className="flex w-10 flex-col items-start gap-0.5 font-mono text-xs leading-none text-muted-foreground">
                  {style.preview.map((marker, index) => (
                    <span key={index}>{marker}</span>
                  ))}
                </span>
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Lista de verificação"
          active={editor.isActive("taskList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <IconListCheck className="size-4" />
        </ToolbarButton>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={disabled}
                      aria-label="Estilos de lista de verificação"
                      className="w-4 px-0"
                    />
                  }
                />
              }
            >
              <IconChevronDown className="size-3" />
            </TooltipTrigger>
            <TooltipContent>Estilos de lista de verificação</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {TASK_LIST_STYLES.map((style) => (
              <DropdownMenuItem key={style.id} onClick={() => applyTaskListStyle(style.id)}>
                <span className="flex w-10 flex-col items-start gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px] border border-muted-foreground" />
                    <span className="h-1.5 w-6 rounded-full bg-muted-foreground/40" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex size-2.5 items-center justify-center rounded-[3px] bg-muted-foreground">
                      <span className="size-1 rounded-[1px] bg-background" />
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-6 rounded-full bg-muted-foreground/40",
                        style.id === "riscado" && "relative before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-muted-foreground",
                      )}
                    />
                  </span>
                </span>
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Diminuir recuo"
          disabled={disabled || !canDecreaseIndent()}
          onClick={decreaseIndent}
        >
          <IconIndentDecrease className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Aumentar recuo"
          disabled={disabled || !canIncreaseIndent()}
          onClick={increaseIndent}
        >
          <IconIndentIncrease className="size-4" />
        </ToolbarButton>
      </ButtonGroup>
      <ButtonGroup>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={disabled || textBlockType() === null}
                      aria-label="Espaçamento entre linhas e parágrafos"
                    />
                  }
                />
              }
            >
              <IconLineHeight className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Espaçamento entre linhas e parágrafos</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-72">
            {LINE_HEIGHT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setLineHeight(option.value)}
                className={cn(currentLineHeight() === option.value && "font-medium")}
              >
                {currentLineHeight() === option.value ? "✓ " : ""}
                {option.label}
              </DropdownMenuItem>
            ))}
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem onClick={toggleSpaceBefore}>
              {currentSpaceBefore() ? "Remover espaço antes do parágrafo" : "Adicionar espaço antes do parágrafo"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleSpaceAfter}>
              {currentSpaceAfter() ? "Remover espaço depois do parágrafo" : "Adicionar espaço depois do parágrafo"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Alinhar à esquerda"
          active={editor.isActive({ textAlign: "left" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <IconAlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Centralizar"
          active={editor.isActive({ textAlign: "center" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <IconAlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Alinhar à direita"
          active={editor.isActive({ textAlign: "right" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <IconAlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Justificar"
          active={editor.isActive({ textAlign: "justify" })}
          disabled={disabled}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <IconAlignJustified className="size-4" />
        </ToolbarButton>
      </ButtonGroup>
      <ButtonGroup>
        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconQuote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} disabled={disabled} onClick={openLinkDialog}>
          <IconLink className="size-4" />
        </ToolbarButton>
      </ButtonGroup>
      <ButtonGroup>
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
      </ButtonGroup>
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
    <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
      <DialogContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            confirmLink();
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-sans">{linkIsEditing ? "Editar link" : "Inserir link"}</DialogTitle>
            <DialogDescription>
              O texto é opcional, se deixado em branco o link usa o texto selecionado ou o
              próprio endereço.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-url">Endereço</Label>
            <Input
              id="link-url"
              type="url"
              required
              autoFocus
              placeholder="https://"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-text">Texto (opcional)</Label>
            <Input
              id="link-text"
              type="text"
              placeholder="Texto personalizado"
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
            />
          </div>
          <DialogFooter>
            {linkIsEditing ? (
              <Button type="button" variant="outline" onClick={removeLink}>
                Remover link
              </Button>
            ) : null}
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={!linkUrl.trim()}>
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
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

export function ShareDialog({
  projectId,
  owner,
  permissions,
  shareableUsers,
  currentUserId,
  linkAccessScope,
  linkAccessPermission,
  open,
  onOpenChange,
}: {
  projectId: string;
  owner: ProjectOwner | null;
  permissions: ProjectPermission[];
  shareableUsers: ShareableUser[];
  currentUserId: string;
  linkAccessScope: string;
  linkAccessPermission: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [sharing, setSharing] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [scope, setScope] = useState(linkAccessScope);
  const [permission, setPermission] = useState(linkAccessPermission);
  const [linkPending, setLinkPending] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/admin/ferramentas/projetos/${projectId}`);
  }, [projectId]);

  async function handleShare() {
    const emails = emailInput
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (emails.length === 0) return;

    const matched = shareableUsers.filter((user) => emails.includes(user.email.toLowerCase()));
    if (matched.length === 0) {
      toast.add({ type: "error", description: "Nenhum usuário encontrado para os e-mails informados." });
      return;
    }

    setSharing(true);
    try {
      for (const user of matched) {
        const formData = new FormData();
        formData.set("project_id", projectId);
        formData.set("user_id", user.user_id);
        formData.set("permission", "ver");
        const result = await grantProjectPermission(null, formData);
        if (result.status === "error") {
          toast.add({ type: "error", description: result.message });
        }
      }
      toast.add({ type: "success", description: "Convite enviado." });
      setEmailInput("");
    } finally {
      setSharing(false);
    }
  }

  async function handlePermissionChange(userId: string, permission: string) {
    setPendingUserId(userId);
    try {
      const formData = new FormData();
      formData.set("project_id", projectId);
      formData.set("user_id", userId);
      formData.set("permission", permission);
      const result = await grantProjectPermission(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      }
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRevoke(permissionId: string, userId: string) {
    setPendingUserId(userId);
    try {
      const formData = new FormData();
      formData.set("project_id", projectId);
      formData.set("permission_id", permissionId);
      const result = await revokeProjectPermission(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      } else {
        toast.add({ type: "success", description: "Acesso removido." });
      }
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleLinkAccessChange(field: "scope" | "permission", value: string) {
    const nextScope = field === "scope" ? value : scope;
    const nextPermission = field === "permission" ? value : permission;
    setScope(nextScope);
    setPermission(nextPermission);
    setLinkPending(true);
    try {
      const formData = new FormData();
      formData.set("project_id", projectId);
      formData.set("scope", nextScope);
      formData.set("permission", nextPermission);
      const result = await updateProjectLinkAccess(null, formData);
      if (result.status === "error") {
        toast.add({ type: "error", description: result.message });
      }
    } finally {
      setLinkPending(false);
    }
  }

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">Compartilhar projeto</DialogTitle>
          <DialogDescription>Convide pessoas para visualizar ou editar este projeto.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              id="share-emails"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Email ou time, separados por vírgulas"
              aria-label="Email ou time, separados por vírgulas"
              className="flex-1"
            />
            <Button type="button" onClick={handleShare} disabled={!emailInput.trim() || sharing}>
              Compartilhar
            </Button>
          </div>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto border-t border-border pt-4">
            {owner && (
              <div className="flex items-center gap-3 py-2">
                <Avatar size="sm">
                  {owner.avatar_url && <AvatarImage src={owner.avatar_url} alt="" />}
                  <AvatarFallback>{owner.nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {owner.nome}
                    {owner.user_id === currentUserId && " (Você)"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{owner.email}</span>
                </div>
                <span className="text-sm text-muted-foreground">Proprietário</span>
              </div>
            )}

            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center gap-3 py-2">
                <Avatar size="sm">
                  {permission.avatar_url && <AvatarImage src={permission.avatar_url} alt="" />}
                  <AvatarFallback>{permission.nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {permission.nome}
                    {permission.user_id === currentUserId && " (Você)"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{permission.email}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                        disabled={pendingUserId === permission.user_id}
                      >
                        {SHARE_PERMISSION_LABELS[permission.permission] ?? permission.permission}
                        <IconChevronDown className="size-3.5" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-64">
                    {SHARE_PERMISSION_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        className="flex flex-col items-start gap-0.5 whitespace-normal"
                        onClick={() => handlePermissionChange(permission.user_id, option.value)}
                      >
                        <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                          {option.label}
                          {permission.permission === option.value && <IconCheck className="size-4 shrink-0" />}
                        </span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleRevoke(permission.id, permission.user_id)}
                    >
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <span className="text-xs font-medium text-muted-foreground">Acesso geral</span>

            <div className="flex items-center gap-3 py-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <IconWorld className="size-3.5" />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                      disabled={linkPending}
                    >
                      {LINK_ACCESS_SCOPE_OPTIONS.find((option) => option.value === scope)?.label ?? scope}
                      <IconChevronDown className="size-3.5" />
                    </button>
                  }
                />
                <DropdownMenuContent align="start" className="w-72">
                  {LINK_ACCESS_SCOPE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex flex-col items-start gap-0.5 whitespace-normal"
                      onClick={() => handleLinkAccessChange("scope", option.value)}
                    >
                      <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                        {option.label}
                        {scope === option.value && <IconCheck className="size-4 shrink-0" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex-1" />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                      disabled={linkPending || scope === "restrito"}
                    >
                      {LINK_ACCESS_PERMISSION_OPTIONS.find((option) => option.value === permission)?.label ?? permission}
                      <IconChevronDown className="size-3.5" />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-64">
                  {LINK_ACCESS_PERMISSION_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex flex-col items-start gap-0.5 whitespace-normal"
                      onClick={() => handleLinkAccessChange("permission", option.value)}
                    >
                      <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                        {option.label}
                        {permission === option.value && <IconCheck className="size-4 shrink-0" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <InputGroup>
              <InputGroupInput readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={handleCopyLink} aria-label="Copiar link">
                  {copied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <button
            type="button"
            className="text-left text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Saiba mais sobre compartilhamento
          </button>
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Concluído</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectEditor({
  project,
  accessLevel,
  permissions,
  shareableUsers,
  owner,
  currentUserId,
}: {
  project: ProjectData;
  accessLevel: ProjectAccessLevel;
  permissions: ProjectPermission[];
  shareableUsers: ShareableUser[];
  owner: ProjectOwner | null;
  currentUserId: string;
}) {
  const canEdit = accessLevel === "total" || accessLevel === "editar";
  const canManage = accessLevel === "total";

  const [status, setStatus] = useState(project.status);
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [coverUrl, setCoverUrl] = useState(project.cover_image_url);
  const [tags, setTags] = useState<string[]>(project.tags);
  const [section, setSection] = useState(project.section);
  const [showAuthor, setShowAuthor] = useState(project.show_author);
  const [coverUploading, setCoverUploading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const [saveResult, setSaveResult] = useState<ActionResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">("saved");
  const [characterCount, setCharacterCount] = useState(0);
  const [, forceToolbarUpdate] = useState(0);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutoSaveRef = useRef(true);

  async function performSave() {
    if (!editor) return;

    const formData = new FormData();
    formData.set("project_id", project.id);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("content", JSON.stringify(editor.getJSON()));
    formData.set("cover_image_url", coverUrl ?? "");
    formData.set("section", section);
    formData.set("show_author", String(showAuthor));
    for (const tag of tags) formData.append("tags", tag);

    const result = await updateProject(null, formData);
    setSaveResult(result);

    if (result.status === "success") {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("error");
    if (result.status === "error") {
      toast.add({ type: "error", description: result.message });
    }
  }

  function scheduleSave() {
    if (!canEdit) return;

    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void performSave();
    }, 1200);
  }

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: (project.content as Record<string, unknown>) ?? { type: "doc", content: [] },
    editable: canEdit,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setCharacterCount(currentEditor.storage.characterCount.characters());
      scheduleSave();
    },
    onCreate: ({ editor: currentEditor }) => {
      setCharacterCount(currentEditor.storage.characterCount.characters());
    },
    onTransaction: () => {
      // Força o rerender da barra de ferramentas a cada transação (clique de
      // formatação, mudança de seleção), já que editor.isActive() é lido
      // direto no render e o Tiptap não dispara rerender do React sozinho.
      forceToolbarUpdate((tick) => tick + 1);
    },
  });

  useEffect(() => {
    editor?.setEditable(canEdit);
  }, [editor, canEdit]);

  useEffect(() => {
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slug, tags, coverUrl, section, showAuthor]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCoverUploading(true);
    try {
      const result = await uploadProjectMedia(project.id, file);

      if (result.status === "success") {
        setCoverUrl(result.url);
      } else {
        toast.add({ type: "error", description: result.message });
      }
    } catch {
      toast.add({ type: "error", description: "Não foi possível enviar o arquivo. Tente novamente." });
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-sans text-2xl font-medium text-foreground">{title || "Novo projeto"}</h1>
          <div
            className={cn(
              "flex w-fit items-center gap-1.5 text-xs font-medium",
              saveStatus === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {saveStatus === "saving" ? (
              <IconCloudUpload className="size-3.5" />
            ) : saveStatus === "error" ? (
              <IconCloudOff className="size-3.5" />
            ) : (
              <IconCloudCheck className="size-3.5" />
            )}
            {saveStatus === "saving"
              ? "Salvando alterações..."
              : saveStatus === "error"
                ? "Erro ao salvar"
                : status === "publicado"
                  ? "Publicado"
                  : "Rascunho salvo"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Button type="button" variant="outline" onClick={() => setShareOpen(true)}>
                <IconUserPlus />
                Compartilhar
              </Button>
              <ShareDialog
                projectId={project.id}
                owner={owner}
                permissions={permissions}
                shareableUsers={shareableUsers}
                currentUserId={currentUserId}
                linkAccessScope={project.link_access_scope}
                linkAccessPermission={project.link_access_permission}
                open={shareOpen}
                onOpenChange={setShareOpen}
              />
            </>
          )}
          <PublishControls
            projectId={project.id}
            status={status}
            canEdit={canEdit}
            onStatusChange={(next) => setStatus(next)}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardContent className="flex min-w-0 flex-col gap-4 pt-4">
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
                {saveResult?.status === "validation_error" && saveResult.errors.title && (
                  <p className="text-xs text-destructive">{saveResult.errors.title[0]}</p>
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
                {saveResult?.status === "validation_error" && saveResult.errors.slug && (
                  <p className="text-xs text-destructive">{saveResult.errors.slug[0]}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="section">Seção de publicação</Label>
                <Select
                  items={PROJECT_SECTION_ITEMS}
                  value={section}
                  onValueChange={(value) => {
                    if (value) setSection(value);
                  }}
                  disabled={!canEdit}
                >
                  <SelectTrigger id="section" className="w-full">
                    <SelectValue placeholder="Selecione a seção" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_SECTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {saveResult?.status === "validation_error" && saveResult.errors.section && (
                  <p className="text-xs text-destructive">{saveResult.errors.section[0]}</p>
                )}
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
            </div>

            <label className="flex items-start gap-2 text-sm text-foreground">
              <Checkbox
                checked={showAuthor}
                onCheckedChange={(value) => setShowAuthor(value === true)}
                disabled={!canEdit}
                className="mt-0.5"
              />
              Mostrar autor na publicação
            </label>

            <div className="flex flex-col gap-2">
              <Label>Imagem de capa</Label>
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt=""
                  className="h-64 w-full rounded-md object-cover ring-1 ring-border"
                />
              )}
              <div className="flex items-center gap-3">
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
                  <Button type="button" variant="destructive" size="sm" onClick={() => setCoverUrl(null)}>
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

            <div className="flex min-w-0 flex-col">
              <EditorToolbar editor={editor} projectId={project.id} disabled={!canEdit} />
              {editor && (
                <InputGroup className="h-auto flex-col items-stretch rounded-t-none">
                  <EditorContent
                    editor={editor}
                    className={cn(
                      "min-h-72 w-full min-w-0 overflow-x-hidden px-3 py-2 text-sm break-words",
                      "[&_.ProseMirror]:min-h-64 [&_.ProseMirror]:outline-none [&_.ProseMirror]:break-words [&_.ProseMirror]:whitespace-pre-wrap",
                      "[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_video]:max-w-full",
                      "[&_.ProseMirror_pre]:max-w-full [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:whitespace-pre-wrap",
                      "[&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold",
                      "[&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold",
                      "[&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold",
                      "[&_.ProseMirror_ul:not([data-type='taskList'])]:mt-2 [&_.ProseMirror_ul:not([data-type='taskList'])]:list-disc [&_.ProseMirror_ul:not([data-type='taskList'])]:pl-6",
                      "[&_.ProseMirror_ol]:mt-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6",
                      "[&_.ProseMirror_blockquote]:mt-2 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground",
                      "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
                    )}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText>{characterCount} caracteres</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
