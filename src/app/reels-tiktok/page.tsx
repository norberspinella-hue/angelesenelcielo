import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Reels & TikToks · Visor Corazón Ghibli | Ángeles en el Cielo',
  description: 'Plantillas verticales de alta conversión (1080x1920) para TikTok e Instagram con el diseño Visor Corazón Ghibli.',
};

export default function ReelsTikTokPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#0D1026]">
      <iframe
        src="/reels-tiktok-ghibli.html"
        title="Generador de Reels & TikToks"
        className="w-full h-full border-0 m-0 p-0 block"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    </main>
  );
}
