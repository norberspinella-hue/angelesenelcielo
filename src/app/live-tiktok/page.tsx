import { Metadata } from 'next';
import LiveTikTokClient from './LiveTikTokClient';

export const metadata: Metadata = {
  title: 'Estudio de Emisión TikTok LIVE · Ángeles en el Cielo',
  description: 'Entorno de emisión vertical 9:16 para transmisiones en directo en TikTok LIVE y OBS Studio.',
};

export default function LiveTikTokPage() {
  return <LiveTikTokClient />;
}
