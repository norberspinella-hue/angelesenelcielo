import { ShelterPet } from '@/components/solidario/ApadrinarDrawer';

export interface PetProfileCardProps {
  memorialId: string;
  planType: string;
  thumbnailUrl: string;
  isShelter?: boolean;
  shelterPet?: ShelterPet | null;
  onClose: () => void;
  onApadrinar?: (pet: ShelterPet) => void;
}

export interface PetData {
  id?: string;
  pet_name: string;
  photo_url: string;
  plan_type: string;
  profile_slug?: string | null;
  slots_count?: number | null;
  birth_date?: string | null;
  death_date?: string | null;
  dedication?: string | null;
  story_answers?: any;
  slot_assigned?: string | null;
}

export interface SlotCoord {
  x: number;
  y: number;
}
