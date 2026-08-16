export type ProjectData = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  cover_image_url: string | null;
  tags: string[];
  section: string;
  status: string;
  published_at: string | null;
  show_author: boolean;
  link_access_scope: string;
  link_access_permission: string;
};

export type ProjectPermission = {
  id: string;
  user_id: string;
  permission: "ver" | "editar" | "compartilhar";
  nome: string;
  email: string;
  avatar_url: string | null;
};

export type ShareableUser = {
  user_id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
};

export type ProjectOwner = {
  user_id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
};
