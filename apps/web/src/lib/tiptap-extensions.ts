import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { BulletList } from "@tiptap/extension-bullet-list";
import { CharacterCount } from "@tiptap/extension-character-count";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { StarterKit } from "@tiptap/starter-kit";

// Marcadores predefinidos que o toolbar oferece via chevron ao lado do botão
// de lista com marcadores. O id vira o atributo data-list-style no <ul>
// renderizado (editor e generateHTML() do render público), e o CSS
// correspondente (globals.css) define o caractere de cada nível de
// aninhamento para cada preset.
export const BULLET_LIST_STYLES = [
  { id: "padrao", label: "Padrão", preview: ["•", "◦", "▪"] },
  { id: "losango", label: "Losango", preview: ["❖", "➢", "▪"] },
  { id: "quadrados", label: "Quadrados", preview: ["▫", "▪", "▫"] },
  { id: "setas", label: "Setas", preview: ["➔", "◆", "•"] },
  { id: "estrela", label: "Estrela", preview: ["★", "◦", "▪"] },
  { id: "seta-circulo", label: "Seta e círculo", preview: ["➢", "◦", "▪"] },
] as const;

export type BulletListStyleId = (typeof BULLET_LIST_STYLES)[number]["id"];

const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-list-style"),
        renderHTML: (attributes) => {
          if (!attributes.listStyle) return {};
          return { "data-list-style": attributes.listStyle };
        },
      },
    };
  },
});

// Presets de numeração predefinidos, mesma ideia do BULLET_LIST_STYLES, mas
// para lista numerada. O CSS correspondente (globals.css) usa ::marker com
// counter()/counters() (contador nativo "list-item" do <li>), não caracteres
// fixos, porque o número muda a cada item.
export const ORDERED_LIST_STYLES = [
  { id: "padrao", label: "Padrão", preview: ["1.", "a.", "i."] },
  { id: "parenteses", label: "Parênteses", preview: ["1)", "a)", "i)"] },
  { id: "multinivel", label: "Multinível", preview: ["1.", "1.1.", "1.2.1."] },
  { id: "alfabetico", label: "Alfabético", preview: ["A.", "a.", "i."] },
  { id: "romano", label: "Romano", preview: ["I.", "A.", "1."] },
  { id: "zero-esquerda", label: "Zero à esquerda", preview: ["01.", "a.", "i."] },
] as const;

export type OrderedListStyleId = (typeof ORDERED_LIST_STYLES)[number]["id"];

const StyledOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-list-style"),
        renderHTML: (attributes) => {
          if (!attributes.listStyle) return {};
          return { "data-list-style": attributes.listStyle };
        },
      },
    };
  },
});

// Presets de lista de verificação, mesma ideia de BULLET_LIST_STYLES/
// ORDERED_LIST_STYLES, mas os dois presets aqui só diferem no tratamento do
// texto do item marcado (riscado ou não), não no glifo, então não têm preview
// de caracteres, o toolbar desenha uma miniatura própria para cada um.
export const TASK_LIST_STYLES = [
  { id: "padrao", label: "Padrão" },
  { id: "riscado", label: "Riscado" },
] as const;

export type TaskListStyleId = (typeof TASK_LIST_STYLES)[number]["id"];

const StyledTaskList = TaskList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-list-style"),
        renderHTML: (attributes) => {
          if (!attributes.listStyle) return {};
          return { "data-list-style": attributes.listStyle };
        },
      },
    };
  },
});

// Recuo de parágrafo/título, fora de lista (dentro de lista o recuo já é
// tratado por sinkListItem/liftListItem nativos do Tiptap). Atributo global
// aplicado a paragraph/heading, guarda o nível (0 a MAX_INDENT_LEVEL) e
// renderiza como margin-left inline, mesmo padrão de estilo inline já usado
// em ResizableImage, então funciona igual no editor e no generateHTML() do
// render público sem precisar de CSS extra.
export const MAX_INDENT_LEVEL = 8;
const INDENT_STEP_REM = 2;

export const Indent = Extension.create({
  name: "indent",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const marginLeft = Number.parseFloat(element.style.marginLeft || "0");
              if (!Number.isFinite(marginLeft) || marginLeft <= 0) return 0;
              return Math.min(Math.round(marginLeft / INDENT_STEP_REM), MAX_INDENT_LEVEL);
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return { style: `margin-left: ${attributes.indent * INDENT_STEP_REM}rem` };
            },
          },
        },
      },
    ];
  },
});

// Espaçamento entre linhas e entre parágrafos, fora de lista (mesma exceção
// de escopo do recuo acima). Dois atributos globais em paragraph/heading:
// lineHeight (altura da linha dentro do próprio parágrafo, renderizado como
// line-height inline) e spaceBefore/spaceAfter (espaço em branco antes/
// depois do bloco, renderizado como margin-top/margin-bottom inline).
// Mesmo padrão de estilo inline do Indent, então style-merging do Tiptap
// (mergeAttributes) combina os dois com o margin-left do recuo sem conflito.
export const LINE_HEIGHT_OPTIONS = [
  { value: "1", label: "Simples" },
  { value: "1.15", label: "1,15" },
  { value: "1.5", label: "1,5" },
  { value: "2", label: "Duplo" },
] as const;

export type LineHeightValue = (typeof LINE_HEIGHT_OPTIONS)[number]["value"];

const PARAGRAPH_SPACING_REM = 0.75;

export const LineSpacing = Extension.create({
  name: "lineSpacing",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
          spaceBefore: {
            default: false,
            parseHTML: (element) => Number.parseFloat(element.style.marginTop || "0") > 0,
            renderHTML: (attributes) => {
              if (!attributes.spaceBefore) return {};
              return { style: `margin-top: ${PARAGRAPH_SPACING_REM}rem` };
            },
          },
          spaceAfter: {
            default: true,
            parseHTML: (element) => Number.parseFloat(element.style.marginBottom || "0") > 0,
            renderHTML: (attributes) => {
              if (!attributes.spaceAfter) return {};
              return { style: `margin-bottom: ${PARAGRAPH_SPACING_REM}rem` };
            },
          },
        },
      },
    ];
  },
});

// Node customizado, sem extensão oficial do Tiptap para vídeo. Serializa
// para <video controls src="..."> tanto no editor quanto no generateHTML()
// do render público (noticias/artigos/[slug]), garantindo que os dois nunca
// divirjam de schema.
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "true" })];
  },
});

// Modos de disposição de texto ao redor da imagem, inspirados no menu
// "Opções de imagem" do Google Docs. "wrap" flutua a imagem à esquerda
// (texto ajusta ao redor via float), "behind"/"front" mantêm a imagem no
// fluxo normal do documento (ProseMirror não suporta posicionamento livre
// fora do fluxo) mas sobrepõem o parágrafo seguinte por cima ou por baixo
// dela via margin negativa + z-index, aproximando o efeito de camadas do
// Google Docs sem precisar de um modelo de documento com posicionamento
// absoluto livre. "Inline" (imagem dividindo a mesma linha do texto) não
// está incluído: exigiria tornar o node parte do conteúdo inline do
// parágrafo (hoje é um node de bloco), uma mudança de schema que quebraria
// artigos já publicados com imagem.
const WRAP_MARGIN = "0.25rem 1.5rem 0.75rem 0";
const LAYER_OVERLAP_REM = 3;

const WRAP_MODES = [
  {
    key: "break",
    label: "Quebrar texto",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="18" y2="4" stroke-linecap="round"></line><rect x="2" y="8" width="16" height="4" rx="0.5"></rect><line x1="2" y1="16" x2="18" y2="16" stroke-linecap="round"></line></svg>',
  },
  {
    key: "wrap",
    label: "Ajustar texto",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="7" height="7" rx="0.5"></rect><line x1="11" y1="4" x2="18" y2="4" stroke-linecap="round"></line><line x1="11" y1="7" x2="18" y2="7" stroke-linecap="round"></line><line x1="11" y1="10" x2="18" y2="10" stroke-linecap="round"></line><line x1="2" y1="14" x2="18" y2="14" stroke-linecap="round"></line><line x1="2" y1="17" x2="18" y2="17" stroke-linecap="round"></line></svg>',
  },
  {
    key: "behind",
    label: "Atrás do texto",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="12" height="10" rx="0.5" opacity="0.35"></rect><line x1="2" y1="7" x2="18" y2="7" stroke-linecap="round"></line><line x1="2" y1="10" x2="18" y2="10" stroke-linecap="round"></line><line x1="2" y1="13" x2="18" y2="13" stroke-linecap="round"></line></svg>',
  },
  {
    key: "front",
    label: "Na frente do texto",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="7" x2="18" y2="7" stroke-linecap="round" opacity="0.35"></line><line x1="2" y1="10" x2="18" y2="10" stroke-linecap="round" opacity="0.35"></line><line x1="2" y1="13" x2="18" y2="13" stroke-linecap="round" opacity="0.35"></line><rect x="4" y="5" width="12" height="10" rx="0.5" fill="var(--color-background)"></rect></svg>',
  },
] as const;

const CHEVRON_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6l6 -6"></path></svg>';
const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10"></path></svg>';

// Adiciona atributos de largura e disposição de texto persistidos no doc e,
// no editor interativo, um node view com alças de redimensionar (arrasto),
// botão de excluir e toolbar de disposição de texto, todos visíveis só com a
// imagem selecionada. generateHTML() (render público) nunca instancia node
// views, só usa renderHTML para os atributos de largura/disposição, então a
// toolbar/alças nunca aparecem fora do editor.
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute("width");
          return width ? Number.parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}px` };
        },
      },
      wrap: {
        default: null,
        parseHTML: (element) => {
          if (element.style.float === "left") return "wrap";
          const zIndex = Number.parseInt(element.style.zIndex || "0", 10);
          if (zIndex < 0) return "behind";
          if (zIndex > 0) return "front";
          return null;
        },
        renderHTML: (attributes) => {
          if (attributes.wrap === "wrap") {
            return { style: `float: left; margin: ${WRAP_MARGIN};` };
          }
          if (attributes.wrap === "behind") {
            return {
              style: `position: relative; z-index: -1; margin-bottom: -${LAYER_OVERLAP_REM}rem;`,
            };
          }
          if (attributes.wrap === "front") {
            return {
              style: `position: relative; z-index: 10; margin-bottom: -${LAYER_OVERLAP_REM}rem;`,
            };
          }
          return {};
        },
      },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement("div");
      container.style.position = "relative";
      container.style.display = "inline-block";
      container.style.maxWidth = "100%";
      container.style.lineHeight = "0";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      if (node.attrs.alt) img.alt = node.attrs.alt;
      img.style.maxWidth = "100%";
      img.style.display = "block";
      img.style.borderRadius = "var(--radius-md)";
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
      container.appendChild(img);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.setAttribute("aria-label", "Excluir imagem");
      deleteButton.className =
        "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground size-7 rounded-[min(var(--radius-md),12px)]";
      deleteButton.style.cssText +=
        "position:absolute;top:6px;right:6px;display:none;background:var(--color-background);color:var(--color-foreground);box-shadow:var(--shadow-sm);cursor:pointer;";
      deleteButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg>';
      deleteButton.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof getPos !== "function") return;
        const pos = getPos();
        if (typeof pos !== "number") return;
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      });
      container.appendChild(deleteButton);

      const CORNERS = [
        { key: "nw", top: "-5px", left: "-5px", cursor: "nwse-resize", signX: -1 },
        { key: "ne", top: "-5px", right: "-5px", cursor: "nesw-resize", signX: 1 },
        { key: "sw", bottom: "-5px", left: "-5px", cursor: "nesw-resize", signX: -1 },
        { key: "se", bottom: "-5px", right: "-5px", cursor: "nwse-resize", signX: 1 },
      ] as const;

      let startX = 0;
      let startWidth = 0;
      let activeSign = 1;

      function onPointerMove(event: PointerEvent) {
        const delta = (event.clientX - startX) * activeSign;
        const newWidth = Math.max(80, Math.round(startWidth + delta));
        img.style.width = `${newWidth}px`;
      }

      function onPointerUp() {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        if (typeof getPos !== "function") return;
        const pos = getPos();
        if (typeof pos !== "number") return;
        const newWidth = Math.round(img.getBoundingClientRect().width);
        editor.chain().setNodeSelection(pos).updateAttributes("image", { width: newWidth }).run();
      }

      const resizeHandles = CORNERS.map((corner) => {
        const handle = document.createElement("div");
        handle.dataset.corner = corner.key;
        handle.style.cssText = [
          "position:absolute",
          "display:none",
          "width:10px",
          "height:10px",
          "border-radius:2px",
          "background:var(--color-background)",
          "border:2px solid var(--color-primary)",
          `cursor:${corner.cursor}`,
          "top" in corner ? `top:${corner.top}` : "",
          "bottom" in corner ? `bottom:${corner.bottom}` : "",
          "left" in corner ? `left:${corner.left}` : "",
          "right" in corner ? `right:${corner.right}` : "",
        ]
          .filter(Boolean)
          .join(";");
        handle.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          startX = event.clientX;
          startWidth = img.getBoundingClientRect().width;
          activeSign = corner.signX;
          document.addEventListener("pointermove", onPointerMove);
          document.addEventListener("pointerup", onPointerUp);
        });
        container.appendChild(handle);
        return handle;
      });

      function setIconHTML(element: HTMLElement, svg: string) {
        element.innerHTML = svg;
        const svgEl = element.querySelector("svg");
        if (svgEl) {
          svgEl.style.width = "100%";
          svgEl.style.height = "100%";
          svgEl.style.display = "block";
        }
      }

      const toolbar = document.createElement("div");
      toolbar.style.cssText = "position:absolute;left:0;display:none;z-index:20;";

      const wrapTrigger = document.createElement("button");
      wrapTrigger.type = "button";
      wrapTrigger.style.cssText =
        "display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-popover);color:var(--color-popover-foreground);box-shadow:var(--shadow-md);font-size:13px;line-height:1;cursor:pointer;white-space:nowrap;font-family:inherit;";

      const triggerIcon = document.createElement("span");
      triggerIcon.style.cssText = "display:inline-flex;flex-shrink:0;width:16px;height:16px;";
      const triggerLabel = document.createElement("span");
      const triggerChevron = document.createElement("span");
      triggerChevron.style.cssText = "display:inline-flex;flex-shrink:0;";
      triggerChevron.innerHTML = CHEVRON_ICON;
      wrapTrigger.append(triggerIcon, triggerLabel, triggerChevron);
      toolbar.appendChild(wrapTrigger);

      const wrapDropdown = document.createElement("div");
      wrapDropdown.style.cssText =
        "position:absolute;left:0;top:calc(100% + 4px);display:none;flex-direction:column;min-width:200px;padding:4px;border-radius:var(--radius-md);border:1px solid var(--color-border);background:var(--color-popover);color:var(--color-popover-foreground);box-shadow:var(--shadow-md);z-index:21;";
      toolbar.appendChild(wrapDropdown);

      const wrapOptions = WRAP_MODES.map((mode) => {
        const button = document.createElement("button");
        button.type = "button";
        button.style.cssText =
          "display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border-radius:calc(var(--radius-md) - 2px);border:none;background:transparent;color:inherit;font-size:13px;line-height:1.2;text-align:left;cursor:pointer;font-family:inherit;";

        const iconSpan = document.createElement("span");
        iconSpan.style.cssText = "display:inline-flex;flex-shrink:0;width:18px;height:18px;";
        setIconHTML(iconSpan, mode.icon);

        const labelSpan = document.createElement("span");
        labelSpan.textContent = mode.label;
        labelSpan.style.cssText = "flex:1;";

        const checkSpan = document.createElement("span");
        checkSpan.style.cssText =
          "display:inline-flex;flex-shrink:0;width:14px;height:14px;color:var(--color-primary);visibility:hidden;";
        checkSpan.innerHTML = CHECK_ICON;

        button.append(iconSpan, labelSpan, checkSpan);
        button.addEventListener("mouseenter", () => {
          button.style.background = "var(--color-accent)";
          button.style.color = "var(--color-accent-foreground)";
        });
        button.addEventListener("mouseleave", () => {
          button.style.background = "transparent";
          button.style.color = "inherit";
        });
        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof getPos !== "function") return;
          const pos = getPos();
          if (typeof pos !== "number") return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { wrap: mode.key === "break" ? null : mode.key })
            .run();
          closeDropdown();
        });
        wrapDropdown.appendChild(button);
        return { key: mode.key, checkSpan };
      });

      let dropdownOpen = false;

      function closeDropdown() {
        dropdownOpen = false;
        wrapDropdown.style.display = "none";
      }

      function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
        wrapDropdown.style.display = dropdownOpen ? "flex" : "none";
      }

      wrapTrigger.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleDropdown();
      });

      function onDocumentClick(event: MouseEvent) {
        if (!dropdownOpen) return;
        if (event.target instanceof globalThis.Node && toolbar.contains(event.target)) return;
        closeDropdown();
      }
      document.addEventListener("mousedown", onDocumentClick);

      function applyWrap(wrap: string | null) {
        const isWrap = wrap === "wrap";
        const isLayered = wrap === "behind" || wrap === "front";
        container.style.float = isWrap ? "left" : "";
        container.style.margin = isWrap ? WRAP_MARGIN : "";
        container.style.zIndex = wrap === "behind" ? "-1" : wrap === "front" ? "10" : "";
        container.style.marginBottom = isLayered ? `-${LAYER_OVERLAP_REM}rem` : "";
        toolbar.style.top = isLayered ? "" : "100%";
        toolbar.style.bottom = isLayered ? "100%" : "";
        toolbar.style.marginTop = isLayered ? "" : "-8px";
        toolbar.style.marginBottom = isLayered ? "-8px" : "";
      }

      function updateWrapUI(wrap: string | null) {
        const activeKey = wrap ?? "break";
        const activeMode = WRAP_MODES.find((mode) => mode.key === activeKey) ?? WRAP_MODES[0];
        setIconHTML(triggerIcon, activeMode.icon);
        triggerLabel.textContent = activeMode.label;
        for (const option of wrapOptions) {
          option.checkSpan.style.visibility = option.key === activeKey ? "visible" : "hidden";
        }
      }

      applyWrap(node.attrs.wrap);
      updateWrapUI(node.attrs.wrap);
      container.appendChild(toolbar);

      function setHandlesVisible(visible: boolean) {
        deleteButton.style.display = visible ? "inline-flex" : "none";
        for (const handle of resizeHandles) handle.style.display = visible ? "block" : "none";
        toolbar.style.display = visible ? "block" : "none";
        if (!visible) closeDropdown();
        container.style.outline = visible ? "2px solid var(--color-primary)" : "none";
        container.style.outlineOffset = "2px";
      }

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;
          img.src = updatedNode.attrs.src as string;
          img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : "";
          applyWrap(updatedNode.attrs.wrap);
          updateWrapUI(updatedNode.attrs.wrap);
          return true;
        },
        selectNode: () => setHandlesVisible(true),
        deselectNode: () => setHandlesVisible(false),
        destroy: () => {
          document.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerup", onPointerUp);
          document.removeEventListener("mousedown", onDocumentClick);
        },
      };
    };
  },
});

export const tiptapExtensions = [
  StarterKit.configure({ bulletList: false, orderedList: false }),
  StyledBulletList,
  StyledOrderedList,
  StyledTaskList,
  TaskItem.configure({ nested: true }),
  ResizableImage,
  Link.configure({ openOnClick: false }),
  Indent,
  LineSpacing,
  TextAlign.configure({ types: ["paragraph", "heading"] }),
  Video,
  Placeholder.configure({ placeholder: "Escreva o conteúdo do projeto..." }),
  CharacterCount,
];
