import { Metadata } from 'next';
import { Footer } from '@/components/landing/Footer';
import ComunidadClient, { CommunityMemory } from './ComunidadClient';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Cartas al Cielo · El Libro de los Ángeles | Todas las mascotas van al cielo',
  description: 'Un rincón gratuito y amoroso para recordar a tu ángel, compartir su historia, encender una vela y recibir el abrazo de otras familias.',
};

export const dynamic = 'force-dynamic';

const SEED_MEMORIES: CommunityMemory[] = [
  {
    id: 'seed-chloe',
    petName: 'Chloe',
    species: 'gato',
    photoUrl: '/images/comunidad/chloe.jpg',
    message: 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor. Nos enseñaste a querer de nuevo, nos curaste heridas que no sabíamos que se podían curar. Te agradecemos todo lo que nos diste pequeñita. Te echaremos de menos siempre.',
    authorName: 'Familia Spinella',
    yearsOrDates: '2014 - 2026',
    tiktok: 'jupiter_sp',
    candlesCount: 156,
    supportCount: 48,
    hugsCount: 72,
    createdAt: '2026-10-23T18:44:56Z',
  },
  {
    id: 'seed-nano',
    petName: 'Nano',
    species: 'perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/nano_1792605318398.jpg',
    message: 'Cómo siempre te decía dándote besitos: no te amaré toda tu vida, te amaré toda la mía. Gracias por quince años de miradas que me salvaron cada día.',
    authorName: 'Familia Cerro',
    yearsOrDates: '2011 - 2026',
    candlesCount: 142,
    supportCount: 45,
    hugsCount: 68,
    createdAt: '2026-10-21T17:55:20Z',
  },
  {
    id: 'seed-bro',
    petName: 'Bro',
    species: 'perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/bro_1792878753050.jpg',
    message: 'Para siempre en el cielo, siempre en nuestro corazón. Tu alegría, tu nobleza y tu amor incondicional vivirán eternamente en cada estrella.',
    authorName: 'Familia yaritcar',
    yearsOrDates: 'Abril 2017 - Octubre 2025',
    tiktok: 'nala68271',
    candlesCount: 138,
    supportCount: 41,
    hugsCount: 63,
    createdAt: '2026-10-24T22:00:10Z',
  },
  {
    id: 'seed-poppy',
    petName: 'Poppy',
    species: 'perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/poppy_centered_1792879672293.png',
    message: 'Te rescatamos y tenías un tumor, no me daban mucha esperanza por tu edad. Pero la operación salió bien y me diste 11 meses de pura alegría, encanto y amor puro. Me enseñaste lo que significa el amor, tú que habías sufrido tanto y perdonaste a todos. Te fuiste rodeada de amor. Me acordaré de ti toda mi vida.',
    authorName: 'Almas de 4 patas',
    yearsOrDates: '2026',
    instagram: 'almas.de.4.patas',
    tiktok: 'almas.de.4.patas',
    candlesCount: 129,
    supportCount: 38,
    hugsCount: 59,
    createdAt: '2026-10-24T22:22:32Z',
  },
  {
    id: 'seed-house',
    petName: 'House',
    species: 'perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg',
    message: 'Trece años corriendo a mi lado, esperándome tras cada puerta con la misma alegría del primer día. Descansa en paz, mi viejo y noble amigo.',
    authorName: 'Familia House',
    yearsOrDates: '2007 - 2020',
    candlesCount: 115,
    supportCount: 35,
    hugsCount: 54,
    createdAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'seed-juliette',
    petName: 'Juliette',
    species: 'perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/juliette_1791706558194.jpg',
    message: 'Tu mirada dulce vive en cada estrella que ilumina la noche. Encontraste un hogar en nuestros corazones antes de partir.',
    authorName: 'Refugio Nueva Vida',
    yearsOrDates: '2013 - 2018',
    candlesCount: 110,
    supportCount: 33,
    hugsCount: 50,
    createdAt: '2026-10-20T13:00:00Z',
  },
  {
    id: 'seed-toby',
    petName: 'Toby',
    species: 'perro',
    photoUrl: '/images/comunidad/golden_retriever_celestial_clean.webp',
    message: 'Gracias por enseñarme lo que es el amor incondicional y por estar siempre a mi lado en cada paso. Siempre en mi corazón.',
    authorName: 'Familia Gómez',
    yearsOrDates: '2012 - 2024',
    candlesCount: 105,
    supportCount: 30,
    hugsCount: 48,
    createdAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 'seed-max',
    petName: 'Max',
    species: 'perro',
    photoUrl: '/images/comunidad/pet-max.webp',
    message: 'Gracias por enseñarme lo que es la lealtad pura. Tu colita moviéndose al verme llegar era mi momento favorito de cada día.',
    authorName: 'Familia de Max',
    yearsOrDates: '2012 - 2024',
    instagram: 'max_el_golden',
    candlesCount: 98,
    supportCount: 28,
    hugsCount: 45,
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'seed-luna',
    petName: 'Luna',
    species: 'gato',
    photoUrl: '/images/comunidad/pet-luna.webp',
    message: 'Fuiste mi compañera de cada día. Tu ronroneo suave y tu mirada tranquila seguirán iluminando mi vida.',
    authorName: 'Mamá de Luna',
    yearsOrDates: '2016 - 2025',
    instagram: 'luna_gatita',
    tiktok: 'lunagatos',
    candlesCount: 92,
    supportCount: 26,
    hugsCount: 42,
    createdAt: '2026-10-20T11:00:00Z',
  },
  {
    id: 'seed-coco',
    petName: 'Coco',
    species: 'perro',
    photoUrl: '/images/comunidad/pet-coco.webp',
    message: 'Tus patitas nos acompañaron en los mejores años. El parque ya no es lo mismo sin tus carreras, pero el cielo tiene a su mejor ángel.',
    authorName: 'Familia Martínez',
    yearsOrDates: '2015 - 2024',
    candlesCount: 88,
    supportCount: 24,
    hugsCount: 39,
    createdAt: '2026-10-20T15:00:00Z',
  },
  {
    id: 'seed-mia',
    petName: 'Mía',
    species: 'gato',
    photoUrl: '/images/comunidad/pet-mia.webp',
    message: 'Nueve años de caricias suaves y de miradas cómplices en el sofá. Tu ausencia duele, pero tu recuerdo es el más dulce refugio.',
    authorName: 'Laura S.',
    yearsOrDates: '2017 - 2025',
    candlesCount: 84,
    supportCount: 22,
    hugsCount: 36,
    createdAt: '2026-10-20T16:00:00Z',
  },
  {
    id: 'seed-roco',
    petName: 'Roco',
    species: 'perro',
    photoUrl: '/images/comunidad/pet-roco.webp',
    message: 'El más noble y protector de todos. Nos cuidaste desde el primer día con tu valentía y tu ternura. Buen viaje, amigo leal.',
    authorName: 'Familia Fernández',
    yearsOrDates: '2013 - 2024',
    candlesCount: 80,
    supportCount: 20,
    hugsCount: 32,
    createdAt: '2026-10-20T17:00:00Z',
  },
];

async function getCommunityMemories(): Promise<CommunityMemory[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase.from('memorials') as any)
      .select('id, pet_name, species, photo_url, dedication, story_answers, created_at, profile_slug')
      .eq('publication_status', 'published')
      .eq('visibility', 'public')
      .filter('story_answers->>isCommunity', 'eq', 'true')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data || data.length === 0) {
      return SEED_MEMORIES;
    }

    const dbMemories: CommunityMemory[] = data.map((m: any) => {
      const isChloe = m.pet_name?.toLowerCase() === 'chloe';
      return {
        id: m.id,
        petName: m.pet_name,
        species: m.species === 'gato' ? 'gato' : m.species === 'perro' ? 'perro' : 'otro',
        photoUrl: isChloe ? (m.photo_url || '/images/comunidad/chloe.jpg') : (m.photo_url || '/images/comunidad/pet-max.webp'),
        message: isChloe && (!m.dedication || m.dedication.length < 30)
          ? 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor. Nos enseñaste a querer de nuevo, nos curaste heridas que no sabíamos que se podían curar. Te agradecemos todo lo que nos diste pequeñita. Te echaremos de menos siempre.'
          : m.dedication,
        authorName: m.story_answers?.authorName || `Familia de ${m.pet_name}`,
        yearsOrDates: isChloe ? (m.story_answers?.yearsOrDates || '2014 - 2026') : (m.story_answers?.yearsOrDates || ''),
        instagram: m.story_answers?.instagram || '',
        tiktok: isChloe ? (m.story_answers?.tiktok || 'jupiter_sp') : (m.story_answers?.tiktok || ''),
        candlesCount: m.story_answers?.candlesCount || 1,
        supportCount: m.story_answers?.supportCount || 0,
        hugsCount: m.story_answers?.hugsCount || 0,
        profileSlug: m.profile_slug,
        createdAt: m.created_at,
      };
    });

    // Deduplicar memorias de la BD (por ejemplo registros duplicados) y luego combinar con semillas
    const seenNames = new Set<string>();
    const uniqueDbMemories: CommunityMemory[] = [];
    for (const mem of dbMemories) {
      const key = `${mem.petName.toLowerCase()}-${mem.authorName?.toLowerCase()}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        uniqueDbMemories.push(mem);
      }
    }

    const uniqueSeedMemories = SEED_MEMORIES.filter(
      seed => !seenNames.has(`${seed.petName.toLowerCase()}-${seed.authorName?.toLowerCase()}`)
    );

    return [...uniqueDbMemories, ...uniqueSeedMemories].slice(0, 12);
  } catch (err) {
    console.error('Error fetching community memories for page:', err);
    return SEED_MEMORIES;
  }
}

export default async function ComunidadPage() {
  const initialMemories = await getCommunityMemories();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F4]">
      {/* Main Cartas al Cielo Component (includes OctubreBanner & CartasAlCieloHeader) */}
      <div className="flex-1">
        <ComunidadClient initialMemories={initialMemories} />
      </div>

      {/* Official Footer */}
      <Footer />
    </div>
  );
}
