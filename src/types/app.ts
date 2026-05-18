import { Database } from './database'

export type Memorial = Database['public']['Tables']['memorials']['Row']
export type MuralSlot = Database['public']['Tables']['mural_slots']['Row']
export type MemorialComment = Database['public']['Tables']['memorial_comments']['Row']
export type MemorialReaction = Database['public']['Tables']['memorial_reactions']['Row']

export type PlanType = Database['public']['Tables']['memorials']['Row']['plan_type']
export type SlotStatus = Database['public']['Tables']['mural_slots']['Row']['status']

export interface ViewportState {
  x: number
  y: number
  zoom: number
}
