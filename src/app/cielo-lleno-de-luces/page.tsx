import { Metadata } from 'next';
import CieloLlenoDeLucesClient from './CieloLlenoDeLucesClient';

export const metadata: Metadata = {
  title: 'Cielo lleno de luces · Lampadario de Velas | Todas las mascotas van al cielo',
  description: 'Un altar de luz viva para que ninguna huella se apague en el Cielo. Como en las catedrales, cada vela representa el amor de una familia cuidando de su ángel.',
};

export const dynamic = 'force-dynamic';

export default function CieloLlenoDeLucesPage() {
  return <CieloLlenoDeLucesClient />;
}
