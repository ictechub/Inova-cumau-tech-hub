import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Cliente com a service role key, só usar em código server-only, para acessar
// dados fora do alcance de RLS (ex.: auth.admin.listUsers). Retorna null se a
// service role key não estiver configurada, para o chamador degradar a
// funcionalidade em vez de quebrar a página inteira.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
