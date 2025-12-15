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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      challan: {
        Row: {
          bill_amt: number
          created_at: string
          customer_id: number
          distributor_id: string
          gst_bill_status: Database["public"]["Enums"]["gst_bill_status"]
          id: number
          metadata: Json | null
          pending_amt: number
          product_info: Json
          received_amt: number
          sales_id: string | null
          status: Database["public"]["Enums"]["challan_status"]
          total_amt: number
        }
        Insert: {
          bill_amt: number
          created_at?: string
          customer_id: number
          distributor_id: string
          gst_bill_status?: Database["public"]["Enums"]["gst_bill_status"]
          id?: number
          metadata?: Json | null
          pending_amt: number
          product_info: Json
          received_amt: number
          sales_id?: string | null
          status?: Database["public"]["Enums"]["challan_status"]
          total_amt: number
        }
        Update: {
          bill_amt?: number
          created_at?: string
          customer_id?: number
          distributor_id?: string
          gst_bill_status?: Database["public"]["Enums"]["gst_bill_status"]
          id?: number
          metadata?: Json | null
          pending_amt?: number
          product_info?: Json
          received_amt?: number
          sales_id?: string | null
          status?: Database["public"]["Enums"]["challan_status"]
          total_amt?: number
        }
        Relationships: [
          {
            foreignKeyName: "challan_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      challan_batch_info: {
        Row: {
          batch_info: Json
          challan_id: number
          created_at: string
          id: number
          product_id: number
        }
        Insert: {
          batch_info: Json
          challan_id: number
          created_at?: string
          id?: number
          product_id: number
        }
        Update: {
          batch_info?: Json
          challan_id?: number
          created_at?: string
          id?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_info_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          created_at: string
          distributor_id: string
          email: string | null
          full_name: string
          id: number
          metadata: Json | null
          pending_amt: number
          phone: string
          received_amt: number
          sales_id: string
          specialization: string | null
          total_amt: number
        }
        Insert: {
          address: string
          created_at?: string
          distributor_id: string
          email?: string | null
          full_name: string
          id?: number
          metadata?: Json | null
          pending_amt?: number
          phone: string
          received_amt?: number
          sales_id: string
          specialization?: string | null
          total_amt?: number
        }
        Update: {
          address?: string
          created_at?: string
          distributor_id?: string
          email?: string | null
          full_name?: string
          id?: number
          metadata?: Json | null
          pending_amt?: number
          phone?: string
          received_amt?: number
          sales_id?: string
          specialization?: string | null
          total_amt?: number
        }
        Relationships: []
      }
      funds: {
        Row: {
          id: string
          pending_amt: number
          received_amt: number
          total: number
          total_amt: number
        }
        Insert: {
          id?: string
          pending_amt?: number
          received_amt?: number
          total?: number
          total_amt?: number
        }
        Update: {
          id?: string
          pending_amt?: number
          received_amt?: number
          total?: number
          total_amt?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_id: string
          created_at: string
          distributor_id: string
          id: number
          product_id: number
          quantity: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          distributor_id: string
          id?: number
          product_id: number
          quantity: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          distributor_id?: string
          id?: number
          product_id?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          author: string
          created_at: string
          data: Json | null
          id: number
          meta: Json | null
          metaData: Json | null
          previousData: Json | null
          resource: string
        }
        Insert: {
          action: string
          author?: string
          created_at?: string
          data?: Json | null
          id?: number
          meta?: Json | null
          metaData?: Json | null
          previousData?: Json | null
          resource: string
        }
        Update: {
          action?: string
          author?: string
          created_at?: string
          data?: Json | null
          id?: number
          meta?: Json | null
          metaData?: Json | null
          previousData?: Json | null
          resource?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          distributor_id: string
          id: number
          order: Json
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string
          distributor_id: string
          id?: number
          order: Json
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string
          distributor_id?: string
          id?: number
          order?: Json
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: []
      }
      passwords: {
        Row: {
          created_at: string
          email: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          password: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "passwords_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string
          gst_slab: number | null
          HSN_code: string | null
          id: number
          imageURL: string
          minimum_q: number
          mrp: number
          name: string
          selling_price: number
        }
        Insert: {
          created_at?: string
          description: string
          gst_slab?: number | null
          HSN_code?: string | null
          id?: number
          imageURL: string
          minimum_q?: number
          mrp: number
          name: string
          selling_price: number
        }
        Update: {
          created_at?: string
          description?: string
          gst_slab?: number | null
          HSN_code?: string | null
          id?: number
          imageURL?: string
          minimum_q?: number
          mrp?: number
          name?: string
          selling_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          boss_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["ROLES"] | null
          username: string | null
        }
        Insert: {
          boss_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["ROLES"] | null
          username?: string | null
        }
        Update: {
          boss_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["ROLES"] | null
          username?: string | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          available_quantity: number
          created_at: string
          expiry_date: string
          id: string
          ordered_quantity: number
          product_id: number
        }
        Insert: {
          available_quantity: number
          created_at?: string
          expiry_date: string
          id: string
          ordered_quantity?: number
          product_id: number
        }
        Update: {
          available_quantity?: number
          created_at?: string
          expiry_date?: string
          id?: string
          ordered_quantity?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          achieved: boolean
          id: number
          month: number
          target: number | null
          total: number
          user_id: string
          year: number | null
        }
        Insert: {
          achieved?: boolean
          id?: number
          month: number
          target?: number | null
          total?: number
          user_id: string
          year?: number | null
        }
        Update: {
          achieved?: boolean
          id?: number
          month?: number
          target?: number | null
          total?: number
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          customer_id: number | null
          description: string | null
          from_user_id: string | null
          id: number
          status: Database["public"]["Enums"]["transfer_status"]
          to_user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: number | null
          description?: string | null
          from_user_id?: string | null
          id?: number
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: number | null
          description?: string | null
          from_user_id?: string | null
          id?: number
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_batch_info_to_order: {
        Args: {
          batch_id: string
          key_value: number
          order_id: number
          product_id: number
          quantity_value: number
        }
        Returns: undefined
      }
      add_to_d_inventory: {
        Args: {
          batch_id_param: string
          batch_quantity_param: number
          distributor_id_param: string
          product_id_param: number
        }
        Returns: undefined
      }
      insert_log_entry: {
        Args: {
          p_action?: string
          p_author?: string
          p_data?: Json
          p_meta?: Json
          p_meta_data?: Json
          p_previous_data?: Json
          p_resource?: string
        }
        Returns: undefined
      }
      log_batch_details: {
        Args: { batch_info: Json; order_id: number; product_id: number }
        Returns: undefined
      }
      refresh_customer_amounts: { Args: never; Returns: undefined }
    }
    Enums: {
      challan_status: "BILLED" | "REQ_DELETION" | "DELETED"
      gst_bill_status:
        | "CREATED"
        | "PENDING"
        | "REQUESTED"
        | "DELETED"
        | "CANCELLED"
      order_status:
        | "Pending"
        | "Fulfilled"
        | "Cancelled"
        | "InProcess"
        | "Defected"
      ROLES: "admin" | "distributor" | "sales" | "null" | "customer"
      transfer_status: "Credit" | "Debit" | "Requested" | "Approved" | "cancled"
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
      challan_status: ["BILLED", "REQ_DELETION", "DELETED"],
      gst_bill_status: [
        "CREATED",
        "PENDING",
        "REQUESTED",
        "DELETED",
        "CANCELLED",
      ],
      order_status: [
        "Pending",
        "Fulfilled",
        "Cancelled",
        "InProcess",
        "Defected",
      ],
      ROLES: ["admin", "distributor", "sales", "null", "customer"],
      transfer_status: ["Credit", "Debit", "Requested", "Approved", "cancled"],
    },
  },
} as const
