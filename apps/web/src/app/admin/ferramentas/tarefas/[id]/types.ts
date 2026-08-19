export type BoardData = {
  id: string;
  codigo_numero: number;
  title: string;
  description: string;
  owner_id: string;
  link_access_scope: string;
  link_access_permission: string;
};

export type BoardPermission = {
  id: string;
  user_id: string;
  permission: "ver" | "editar" | "compartilhar";
  nome: string;
  email: string;
  avatar_url: string | null;
};

export type BoardOwner = {
  user_id: string;
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

export type BoardColumn = {
  id: string;
  title: string;
  color: string;
  position: number;
};

export type BoardTask = {
  id: string;
  codigo_numero: number;
  column_id: string;
  title: string;
  description: string;
  priority: string;
  assignee_ids: string[];
  tags: string[];
  start_date: string | null;
  due_date: string | null;
  position: number;
  created_by: string;
  updated_at: string;
};

export type BoardMember = {
  user_id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
};
