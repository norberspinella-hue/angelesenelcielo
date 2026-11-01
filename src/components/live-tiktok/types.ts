export interface LetterItem {
  id: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  years?: string;
  family: string;
  message: string;
  photoUrl: string;
  slot: string;
}

export interface LiveCandle {
  id: string;
  name: string;
  species: string;
  timeAgo: string;
  isNew?: boolean;
  isSessionCandle?: boolean;
  dedication?: string;
}

export interface ShelterAngelItem {
  id: string;
  name: string;
  shelterName: string;
  badge: string;
  badgeColor: string;
  history: string;
  photoUrl: string;
  fallbackPhotoUrl: string;
}

export interface LiveStreamState {
  activeScene: 1 | 2 | 3;
  currentLetterIndex: number;
  currentShelterIndex: number;
  autoPlayLetters: boolean;
  letterDuration: number; // in seconds (e.g. 14)
  candles: LiveCandle[];
  activePetName?: string;
  activePetSpecies?: string;
  activePetDedication?: string;
  candleLitAt?: number;
  muralStarsCount: number; // Baseline real verificado en mural_slots: 151 (Inmutable por velas del live)
  sessionCandlesCount: number; // Inicia en 0 en cada sesión y aumenta SOLO con velas válidas del directo
  lastUpdated: number;
}

export const PRELOADED_LETTERS: LetterItem[] = [
  {
    id: 'letter-poppy',
    petName: 'Poppy',
    species: 'perro',
    years: '11 meses de puro amor',
    family: 'Almas de 4 patas (@almas.de.4.patas)',
    message: 'Te rescatamos y tenías un tumor, no me daban mucha esperanza por tu edad. Pero la operación salió bien y me diste 11 meses de pura alegría, encanto y amor puro. Me enseñaste lo que significa el amor, tú que habías sufrido tanto y perdonaste a todos. Tu encanto era transmitir felicidad allí donde estabas. Te fuiste rodeada de amor. Me acordaré de ti toda mi vida.',
    photoUrl: '/images/memorial/poppy_mural.png',
    slot: '470, 494 (4x4)',
  },
  {
    id: 'letter-bro',
    petName: 'Bro',
    species: 'perro',
    years: 'Abril 2017 — 26 Oct 2025',
    family: 'Familia yaritcar (@nala68271)',
    message: 'Para siempre en el cielo, siempre en nuestro corazón. Tu alegría, tu nobleza y tu amor incondicional vivirán eternamente en cada estrella.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/bro_1792878753050.jpg',
    slot: '503, 495',
  },
  {
    id: 'letter-nano',
    petName: 'Nano',
    species: 'perro',
    years: '2011 — 2026',
    family: 'Familia Cerro',
    message: 'Cómo siempre te decía dándote besitos: no te amaré toda tu vida, te amaré toda la mía. Gracias por quince años de miradas que me salvaron cada día.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/nano_1792605318398.jpg',
    slot: '503, 499',
  },
  {
    id: 'letter-chloe',
    petName: 'Chloe',
    species: 'gato',
    years: '2014 — 2026',
    family: 'Familia Spinella',
    message: 'No hay despedida para quien vive para siempre en el corazón. Tu ronroneo suave sigue siendo la paz de toda mi casa en las noches.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/chloe_1791659186920.jpg',
    slot: '499, 499',
  },
  {
    id: 'letter-house',
    petName: 'House',
    species: 'perro',
    years: '2007 — 2020',
    family: 'Familia House',
    message: 'Trece años corriendo a mi lado, esperándome tras cada puerta con la misma alegría del primer día. Descansa en paz, mi viejo y noble amigo.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg',
    slot: '495, 499',
  },
  {
    id: 'letter-mary',
    petName: 'Mary Margaret',
    species: 'gato',
    years: '2012 — 2023',
    family: 'Familia Gómez',
    message: 'Tus patitas dejaron huellas imborrables en nuestra alma. Gracias por once años de cariño dulce y silencioso. Siempre en nuestro cielo.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/mary_margaret_1791704934801.jpg',
    slot: '497, 503',
  },
  {
    id: 'letter-juliette',
    petName: 'Juliette',
    species: 'perro',
    years: '2013 — 2018',
    family: 'Refugio Nueva Vida',
    message: 'Tu mirada dulce vive en cada estrella que ilumina la noche. Encontraste un hogar en nuestros corazones antes de partir.',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg',
    slot: '497, 495',
  },
];

export const INITIAL_CANDLES: LiveCandle[] = [
  { id: 'c-poppy', name: 'Poppy', species: '🌟 Ángelito Protector (4x4)', timeAgo: 'ahora mismo', isNew: true },
  { id: 'c0', name: 'Bro', species: '🐾 Fundador #0007 (@nala68271)', timeAgo: 'ahora mismo', isNew: true },
  { id: 'c1', name: 'Nano', species: '🐾 Perrito', timeAgo: 'hace 2 min' },
  { id: 'c2', name: 'Chloe', species: '✨ Gatita', timeAgo: 'hace 4 min' },
  { id: 'c3', name: 'House', species: '🐾 Perrito', timeAgo: 'hace 7 min' },
  { id: 'c4', name: 'Vaiana', species: '🐾 Almas de 4 patas', timeAgo: 'hace 12 min' },
  { id: 'c5', name: 'Juliette', species: '🐾 Refugio Nueva Vida', timeAgo: 'hace 15 min' },
  { id: 'c6', name: 'Mary Margaret', species: '✨ Gatita', timeAgo: 'hace 19 min' },
  { id: 'c7', name: 'Toby', species: '🐾 Golden Retriever', timeAgo: 'hace 24 min' },
  { id: 'c8', name: 'Luna', species: '✨ Gatita blanca', timeAgo: 'hace 28 min' },
];

export const SHELTER_ANGELS: ShelterAngelItem[] = [
  {
    id: 'vaiana',
    name: 'Vaiana',
    shelterName: 'Almas de 4 patas (Málaga)',
    badge: '👑 Fundadora #0005',
    badgeColor: 'bg-amber-400 text-stone-950',
    history: '«Vaiana era solo un bebé cuando la rescatamos. Conoció el amor y la calidez de una familia de acogida antes de partir. Hoy sus estrellas brillan para siempre en el mural.»',
    photoUrl: '/images/solidario/vaiana_real_mural.jpg',
    fallbackPhotoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/shelter_1792348293948.jpg',
  },
];

export const DEFAULT_LIVE_STATE: LiveStreamState = {
  activeScene: 1,
  currentLetterIndex: 0,
  currentShelterIndex: 0,
  autoPlayLetters: false,
  letterDuration: 14,
  candles: INITIAL_CANDLES,
  activePetName: '',
  activePetSpecies: '',
  activePetDedication: '',
  candleLitAt: 0,
  muralStarsCount: 0, // Se inicializa dinámicamente mediante consulta real a Supabase (mural_slots)
  sessionCandlesCount: 0, // Inicia estrictamente en 0 para cada nueva sesión de emisión
  lastUpdated: 0,
};
