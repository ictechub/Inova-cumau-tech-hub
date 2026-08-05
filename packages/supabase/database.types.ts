export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      leads_associacao: {
        Row: {
          created_at: string
          id: string
          nome: string
          segmento: string
          startup: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          segmento: string
          startup: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          segmento?: string
          startup?: string
          whatsapp?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      startup_registrations: {
        Row: {
          avatar_url: string | null
          contato_cidade: string
          contato_email: string | null
          contato_endereco: string | null
          contato_estado: string | null
          contato_facebook: string | null
          contato_instagram: string | null
          contato_linkedin: string | null
          contato_telefone: string | null
          contato_whatsapp: string | null
          created_at: string
          fase_negocio: string
          id: string
          notify_email_editais: boolean
          notify_email_novidades: boolean
          objetivo_filiacao: string[]
          objetivo_filiacao_outro: string | null
          perfil_visivel_publico: boolean
          responsavel_cargo: string
          responsavel_email: string
          responsavel_nome: string
          responsavel_telefone: string
          responsavel_whatsapp: string | null
          role: string
          segmentacao_outros_detalhes: string | null
          segmento_outro: string | null
          segmentos: string[]
          startup_cnpj: string | null
          startup_cnpj_ausente: boolean
          startup_descricao: string
          startup_nome: string
          startup_site: string | null
          status: string
          termos_aceitos: boolean
          termos_aceitos_em: string | null
          termos_versao: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          contato_cidade: string
          contato_email?: string | null
          contato_endereco?: string | null
          contato_estado?: string | null
          contato_facebook?: string | null
          contato_instagram?: string | null
          contato_linkedin?: string | null
          contato_telefone?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          fase_negocio: string
          id?: string
          notify_email_editais?: boolean
          notify_email_novidades?: boolean
          objetivo_filiacao?: string[]
          objetivo_filiacao_outro?: string | null
          perfil_visivel_publico?: boolean
          responsavel_cargo: string
          responsavel_email: string
          responsavel_nome: string
          responsavel_telefone: string
          responsavel_whatsapp?: string | null
          role?: string
          segmentacao_outros_detalhes?: string | null
          segmento_outro?: string | null
          segmentos?: string[]
          startup_cnpj?: string | null
          startup_cnpj_ausente?: boolean
          startup_descricao: string
          startup_nome: string
          startup_site?: string | null
          status?: string
          termos_aceitos?: boolean
          termos_aceitos_em?: string | null
          termos_versao?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          contato_cidade?: string
          contato_email?: string | null
          contato_endereco?: string | null
          contato_estado?: string | null
          contato_facebook?: string | null
          contato_instagram?: string | null
          contato_linkedin?: string | null
          contato_telefone?: string | null
          contato_whatsapp?: string | null
          created_at?: string
          fase_negocio?: string
          id?: string
          notify_email_editais?: boolean
          notify_email_novidades?: boolean
          objetivo_filiacao?: string[]
          objetivo_filiacao_outro?: string | null
          perfil_visivel_publico?: boolean
          responsavel_cargo?: string
          responsavel_email?: string
          responsavel_nome?: string
          responsavel_telefone?: string
          responsavel_whatsapp?: string | null
          role?: string
          segmentacao_outros_detalhes?: string | null
          segmento_outro?: string | null
          segmentos?: string[]
          startup_cnpj?: string | null
          startup_cnpj_ausente?: boolean
          startup_descricao?: string
          startup_nome?: string
          startup_site?: string | null
          status?: string
          termos_aceitos?: boolean
          termos_aceitos_em?: string | null
          termos_versao?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
