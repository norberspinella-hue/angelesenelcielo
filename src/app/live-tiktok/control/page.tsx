import { Metadata } from 'next';
import { PresenterPanel } from '@/components/live-tiktok/PresenterPanel';

export const metadata: Metadata = {
  title: 'Panel del Presentador · TikTok LIVE · Ángeles en el Cielo',
  description: 'Interfaz de control en directo para transmisiones de homenajes en TikTok LIVE y OBS.',
  robots: 'noindex, nofollow',
};

export default function LiveControlPage() {
  return <PresenterPanel />;
}
