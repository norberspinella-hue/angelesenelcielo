import { Metadata } from 'next';
import { Suspense } from 'react';
import MemorialClient from './MemorialClient';
import { createAdminClient } from '@/lib/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: memorial } = await (supabase.from('memorials') as any)
    .select('id, pet_name, photo_url, dedication, profile_slug')
    .eq('profile_slug', params.slug)
    .single();

  if (!memorial) {
    return {
      title: 'Mural de Ángeles en el Cielo 🐾',
      description: 'Visita el recuerdo eterno en el Mural de Ángeles ✨',
    };
  }

  const title = `${memorial.pet_name} está en el Mural Global de Ángeles en el Cielo`;
  const description = memorial.dedication
    ? `"${memorial.dedication.slice(0, 140)}..."`
    : 'Un lugar lleno de amor para recordarlo siempre. ✨';
  const imageUrl =
    memorial.photo_url ||
    `https://todaslasmascotasvanalcielo.com/api/og?id=${memorial.id}&side=og`;
  const url = `https://todaslasmascotasvanalcielo.com/memorial/${
    memorial.profile_slug || params.slug
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ángeles en el Cielo',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: memorial.pet_name,
        },
      ],
      type: 'profile',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function MemorialPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createAdminClient();
  const { data: memorial } = await (supabase.from('memorials') as any)
    .select('*')
    .eq('profile_slug', params.slug)
    .eq('visibility', 'public')
    .maybeSingle();

  let initialSlotCoords: { x: number; y: number } | null = null;
  if (memorial) {
    if (memorial.slot_assigned && String(memorial.slot_assigned).includes(',')) {
      const [x, y] = String(memorial.slot_assigned).split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        initialSlotCoords = { x, y };
      }
    }
    if (!initialSlotCoords) {
      const { data: slot } = await supabase
        .from('mural_slots')
        .select('x, y')
        .eq('memorial_id', memorial.id)
        .order('x', { ascending: true })
        .order('y', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (slot) {
        initialSlotCoords = slot as { x: number; y: number };
      }
    }
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #f5e8ff, #ffe8f0)',
            fontFamily: 'Georgia, serif',
            fontSize: 22,
            color: '#4A3F6B',
          }}
        >
          Cargando recuerdo celestial... ✨
        </div>
      }
    >
      <MemorialClient
        slug={params.slug}
        initialMemorial={memorial}
        initialSlotCoords={initialSlotCoords}
      />
    </Suspense>
  );
}
