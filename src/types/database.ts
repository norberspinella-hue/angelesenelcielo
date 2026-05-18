export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      memorials: {
        Row: {
          id: string
          user_id: string | null
          email: string
          pet_name: string
          species: 'perro' | 'gato' | 'conejo' | 'pajaro' | 'caballo' | 'otro'
          photo_url: string
          death_date: string
          dedication: string | null
          story_answers: Json
          generated_story: string | null
          plan_type: 'recuerdo_inicial' | 'estrella_anual' | 'recuerdo_eterno'
          price_paid: number
          currency: string
          slots_count: 1 | 4 | 9
          profile_slug: string
          visibility: 'public' | 'private'
          reactions_count: number
          comments_count: number
          payment_status: 'draft' | 'pending' | 'paid' | 'failed'
          publication_status: 'draft' | 'published' | 'archived' | 'expired'
          expires_at: string | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          deletion_token: string
          moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged'
          moderation_notes: string | null
          rights_confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['memorials']['Row'], 'id' | 'created_at' | 'updated_at' | 'reactions_count' | 'comments_count' | 'deletion_token'> & {
          id?: string
          created_at?: string
          updated_at?: string
          reactions_count?: number
          comments_count?: number
          deletion_token?: string
        }
        Update: Partial<Database['public']['Tables']['memorials']['Insert']>
      }
      mural_slots: {
        Row: {
          id: string
          x: number
          y: number
          status: 'available' | 'reserved_pending_payment' | 'occupied' | 'blocked_admin' | 'sponsor_private'
          memorial_id: string | null
          reserved_until: string | null
          plan_type: 'recuerdo_inicial' | 'estrella_anual' | 'recuerdo_eterno' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mural_slots']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['mural_slots']['Insert']>
      }
      memorial_comments: {
        Row: {
          id: string
          memorial_id: string
          author_name: string
          author_email: string | null
          message: string
          status: 'visible' | 'pending_moderation' | 'reported' | 'hidden'
          ip_hash: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memorial_comments']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['memorial_comments']['Insert']>
      }
      memorial_reactions: {
        Row: {
          id: string
          memorial_id: string
          type: 'huellita' | 'estrella' | 'corazon' | 'luz'
          user_id: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memorial_reactions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['memorial_reactions']['Insert']>
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          memorial_id: string | null
          metadata: Json | null
          session_id: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>
      }
      email_logs: {
        Row: {
          id: string
          memorial_id: string | null
          to_email: string
          type: 'confirmation' | 'draft_recovery' | 'anniversary' | 'expiration_warning_30d' | 'expiration_warning_7d' | 'expiration_warning_0d' | 'post_expiration_conversion' | 'deletion_token' | 'moderation_alert'
          resend_id: string | null
          status: string
          sent_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_logs']['Row'], 'id' | 'sent_at'> & {
          id?: string
          sent_at?: string
        }
        Update: Partial<Database['public']['Tables']['email_logs']['Insert']>
      }
    }
  }
}
