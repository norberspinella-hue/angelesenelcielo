import { Metadata } from 'next';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { ContactoClient } from './ContactoClient';

export const metadata: Metadata = {
  title: 'Contacto | Ángeles en el Cielo',
  description: 'Escríbenos para cualquier duda, sugerencia o mensaje sobre el memorial de tu mascota en Ángeles en el Cielo.',
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F4]">
      {/* Header flotante */}
      <Header />

      {/* Contenedor principal con espaciado seguro debajo del Header */}
      <main className="flex-1 pt-28 sm:pt-36 pb-16">
        <ContactoClient />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
