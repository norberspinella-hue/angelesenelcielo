import { Metadata } from 'next';
import LiveOutputClient from './LiveOutputClient';

export const metadata: Metadata = {
  title: 'Salida LIVE 16:9 (TikTok LIVE Studio / OBS) · Ángeles en el Cielo',
  description: 'Señal limpia de emisión horizontal 1920x1080 (16:9) con vídeo en bucle continuo para captura por navegador.',
  robots: 'noindex, nofollow',
};

export default function LiveOutputPage() {
  return <LiveOutputClient />;
}
