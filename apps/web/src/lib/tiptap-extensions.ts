import { Node, mergeAttributes } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";

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

export const tiptapExtensions = [
  StarterKit,
  Image,
  Link.configure({ openOnClick: false }),
  Video,
  Placeholder.configure({ placeholder: "Escreva o conteúdo do projeto..." }),
];
