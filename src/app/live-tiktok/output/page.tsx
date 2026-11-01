import { Metadata } from 'next';
import LiveOutputClient from './LiveOutputClient';

export const metadata: Metadata = {
  title: 'Salida LIVE 9:16 (OBS / TikTok LIVE Studio) · Ángeles en el Cielo',
  description: 'Señal limpia de emisión vertical 1080x1920 (9:16) para captura por navegador.',
  robots: 'noindex, nofollow',
};

export default function LiveOutputPage() {
  return <LiveOutputClient />;
}
