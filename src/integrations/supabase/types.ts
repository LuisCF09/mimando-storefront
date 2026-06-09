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
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          min_subtotal: number
          tipo: string
          updated_at: string
          validade: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          min_subtotal?: number
          tipo: string
          updated_at?: string
          validade?: string | null
          valor: number
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          min_subtotal?: number
          tipo?: string
          updated_at?: string
          validade?: string | null
          valor?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      occasions: {
        Row: {
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_cep: string
          address_city: string
          address_complement: string
          address_district: string
          address_number: string
          address_state: string
          address_street: string
          created_at: string
          cupom_codigo: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          desconto: number
          id: string
          mercado_pago_payment_id: string | null
          mercado_pago_preference_id: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address_cep: string
          address_city: string
          address_complement?: string
          address_district: string
          address_number: string
          address_state: string
          address_street: string
          created_at?: string
          cupom_codigo?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          desconto?: number
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address_cep?: string
          address_city?: string
          address_complement?: string
          address_district?: string
          address_number?: string
          address_state?: string
          address_street?: string
          created_at?: string
          cupom_codigo?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          desconto?: number
          id?: string
          mercado_pago_payment_id?: string | null
          mercado_pago_preference_id?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_occasions: {
        Row: {
          occasion_slug: string
          product_id: string
        }
        Insert: {
          occasion_slug: string
          product_id: string
        }
        Update: {
          occasion_slug?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_occasions_occasion_slug_fkey"
            columns: ["occasion_slug"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "product_occasions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          categoria: string
          created_at: string
          descricao_completa: string
          descricao_curta: string
          disponivel: boolean
          estoque: number
          id: string
          imagem_url: string | null
          is_bestseller: boolean
          is_featured: boolean
          is_novidade: boolean
          is_personalizavel: boolean
          is_promocao: boolean
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          categoria: string
          created_at?: string
          descricao_completa?: string
          descricao_curta?: string
          disponivel?: boolean
          estoque?: number
          id?: string
          imagem_url?: string | null
          is_bestseller?: boolean
          is_featured?: boolean
          is_novidade?: boolean
          is_personalizavel?: boolean
          is_promocao?: boolean
          nome: string
          preco: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          categoria?: string
          created_at?: string
          descricao_completa?: string
          descricao_curta?: string
          disponivel?: boolean
          estoque?: number
          id?: string
          imagem_url?: string | null
          is_bestseller?: boolean
          is_featured?: boolean
          is_novidade?: boolean
          is_personalizavel?: boolean
          is_promocao?: boolean
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          botao_link: string
          botao_texto: string
          imagem_url: string | null
          key: string
          subtitulo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          botao_link?: string
          botao_texto?: string
          imagem_url?: string | null
          key: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          botao_link?: string
          botao_texto?: string
          imagem_url?: string | null
          key?: string
          subtitulo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cliente"
      payment_status: "pending" | "paid" | "canceled" | "failed"
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
    Enums: {
      app_role: ["admin", "cliente"],
      payment_status: ["pending", "paid", "canceled", "failed"],
    },
  },
} as const
