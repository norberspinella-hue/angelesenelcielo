import { Metadata } from 'next';
import { CieloLive } from '@/components/live/CieloLive';

export const metadata: Metadata = {
  title: 'Cielo interactivo LIVE · Ángeles en el Cielo',
  description: 'Escena interactiva de estrellas en tiempo real para OBS y TikTok LIVE Studio.',
  robots: 'noindex, nofollow',
};

export default function LiveCieloPage() {
  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden m-0 p-0 bg-transparent">
      <CieloLive className="w-full h-full" />
    </main>
  );
}
