export type SpeciesType = 'perro' | 'gato' | 'conejo' | 'pajaro' | 'caballo' | 'otro';

export type CandleStatus = 'active' | 'hidden' | 'reported' | 'flagged';

export interface AltarCandlePublic {
  id: string;
  pet_name: string;
  species: SpeciesType;
  author_name: string;
  dedication: string;
  photo_url: string | null;
  is_from_mural: boolean;
  is_eternal: boolean;
  warmth_count: number;
  is_shelter_pet: boolean;
  shelter_name: string | null;
  status: CandleStatus;
  created_at: string;
  expires_at: string;
  reignited_at: string | null;
  reignite_count: number;
  memorial_id: string | null;
  
  // Campos calculados para presentación
  is_lit: boolean;
  days_remaining: number;
}

export interface AltarCandlePrivateRecord extends AltarCandlePublic {
  email: string | null;
  manage_token_hash: string | null;
  unsubscribe_token_hash: string | null;
  reminder_opt_in: boolean;
  commercial_opt_in: boolean;
  opted_out_at: string | null;
  ip_hash: string | null;
  mural_plan: string | null;
  pre_reminder_sent_at?: string | null;
  extinguished_notice_sent_at?: string | null;
}

export interface CreateCandleInput {
  pet_name: string;
  species: SpeciesType;
  author_name?: string;
  dedication: string;
  photo_url?: string;
  email: string;
  commercial_opt_in?: boolean;
  honeypot?: string;
}

export interface AltarStats {
  mural_occupied_slots: number;
  active_candles_count: number;
  total_historical_candles: number;
}
