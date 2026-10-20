import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Cómo Funciona · Guía Paso a Paso | Ángeles en el Cielo',
  description: 'Descubre cómo darle a tu peque un espacio eterno en el Cielo de los Ángeles en 5 pasos sencillos. Desde su estrella hasta su diploma oficial.',
};

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F4]">
      {/* Header flotante */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 pt-24 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-[960px] mx-auto space-y-10 sm:space-y-12">

          {/* 1. Imagen de Cabecera (Email de Confirmación) */}
          <div className="max-w-[900px] w-full mx-auto rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_16px_44px_rgba(112,106,149,0.12)] border border-white/90 bg-white">
            <Image
              src="/images/email/Headermail.png"
              alt="Ángeles en el Cielo · Confirmación de Homenaje"
              width={1200}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto">
            {/* 4. Tag exacto solicitado con icono vectorial */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F4] border border-[#F8C7D8] text-xs font-semibold text-[#E05282] mb-4 shadow-sm">
              <Image 
                src="/images/icons/star.svg" 
                alt="Estrella" 
                width={14} 
                height={14} 
                className="w-3.5 h-3.5 object-contain" 
              />
              <span>Guía Paso a Paso · El Mural de Ángeles en el Cielo</span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E2A78] leading-tight mb-4">
              Dale a tu peque un espacio en el Cielo de los Ángeles en 5 pasos sencillos
            </h1>

            <p className="font-playfair italic text-lg sm:text-xl text-[#A05278] font-medium mb-4">
              «Honra su vida, mantén viva su luz y comparte su historia para siempre en el cielo infinito.»
            </p>

            <p className="text-[#5A639C] text-base sm:text-lg leading-relaxed">
              Un proceso intuitivo, transparente y lleno de cariño. Diseñado para que en apenas unos minutos puedas inmortalizar la memoria de tu compañero de cuatro patas y visitar su estrella siempre que lo desees.
            </p>
          </div>

          {/* Tarjeta 1: Infografía Oficial (Sin el tag 'Esquema Visual Oficial') */}
          <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FCE7F3]/40 via-[#F3E8FF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#FEF3C7]/40 via-[#FDE8F0]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78] mb-2 leading-snug">
                El camino de luz: De tu recuerdo a su estrella eterna
              </h2>
              <p className="text-sm sm:text-base text-[#6B5B82] mb-6">
                Esta es la guía visual completa del proceso, tal y como se muestra en el mural conmemorativo:
              </p>

              {/* Banner oficial embebido */}
              <div className="w-full rounded-[20px] overflow-hidden shadow-[0_12px_32px_rgba(30,42,120,0.08)] border border-[#E9E4F0] bg-white my-4">
                <Image
                  src="/images/icons/plans/como_funciona_mural_angeles.webp"
                  alt="Cómo funciona el mural de ángeles en 5 pasos sencillos"
                  width={1120}
                  height={373}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Cita de compromiso */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#FFF8F7] to-[#FAF5FF] border border-[#F6DCE6] my-6 text-center shadow-sm">
                <p className="font-playfair italic text-base sm:text-lg text-[#1E2A78] font-medium leading-relaxed mb-3">
                  «Cada paso está pensado con el máximo respeto por tu duelo: sin suscripciones ocultas, con permanencia para siempre y custodia oficial de su historia.»
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C59B73] tracking-wide uppercase">
                  <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                  <span>El Santuario de Ángeles en el Cielo</span>
                  <Image src="/images/icons/star.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                </div>
              </div>
            </div>
          </section>

          {/* Tarjeta 2: Explicación Detallada (Sin el tag 'Paso a Paso en Detalle') */}
          <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FCE7F3]/40 via-[#F3E8FF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78] mb-2 leading-snug">
                Cómo dar de alta a tu angelito paso a paso
              </h2>
              <p className="text-sm sm:text-base text-[#6B5B82] mb-8">
                Todo el proceso se realiza desde tu teléfono u ordenador en menos de 3 minutos:
              </p>

              <div className="grid grid-cols-1 gap-5">
                
                {/* Paso 1 */}
                <div className="bg-white rounded-[22px] p-5 sm:p-7 border border-[#F0ECF5] shadow-[0_4px_14px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_24px_rgba(30,42,120,0.07)] hover:border-[#E2D9EE] transition-all flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#F5E8FF] border border-[#FBCFE8] text-[#BE185D] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#1E2A78]">
                        Elige su espacio o modalidad de recuerdo
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
                        <Image src="/images/icons/plans/icon-plan-estrella.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span>Paso 1 · Tu Elección</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                      Elige el plan que mejor refleje el homenaje para tu peque: desde una <strong>Estrella Individual</strong>, opciones avanzadas con aureola dorada y encendido de velas, hasta la zona de honor de <strong>Ángeles Fundadores</strong> o el apadrinamiento solidario en <strong>Corazones de Ángel</strong> (donde el 50% apoya a una protectora).
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF9F5] border-l-4 border-[#F97316] text-xs sm:text-sm text-[#9A3412]">
                      <Image src="/images/icons/star.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain shrink-0" />
                      <span>Si eliges una estrella fundadora, tu peque ocupará el centro del mural de por vida.</span>
                    </div>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="bg-white rounded-[22px] p-5 sm:p-7 border border-[#F0ECF5] shadow-[0_4px_14px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_24px_rgba(30,42,120,0.07)] hover:border-[#E2D9EE] transition-all flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#F5E8FF] border border-[#FBCFE8] text-[#BE185D] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#1E2A78]">
                        Sube su foto más bonita
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
                        <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span>Paso 2 · Su Imagen</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                      Sube la fotografía con la que más te guste recordarle. Nuestro sistema adapta la imagen automáticamente para que quede perfectamente encuadrada con su marco circular o halo de luz celestial.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF9F5] border-l-4 border-[#F97316] text-xs sm:text-sm text-[#9A3412]">
                      <Image src="/images/icons/paw.svg" alt="Huella" width={14} height={14} className="w-3.5 h-3.5 object-contain shrink-0" />
                      <span>Aceptamos cualquier formato desde el móvil o tu ordenador (JPG, PNG, WebP).</span>
                    </div>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="bg-white rounded-[22px] p-5 sm:p-7 border border-[#F0ECF5] shadow-[0_4px_14px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_24px_rgba(30,42,120,0.07)] hover:border-[#E2D9EE] transition-all flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#F5E8FF] border border-[#FBCFE8] text-[#BE185D] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#1E2A78]">
                        Cuéntanos su historia y dedicatoria
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
                        <Image src="/images/icons/plans/icon-plan-eterno.svg" alt="Corazón" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span>Paso 3 · Su Huella</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                      Escribe su nombre, fechas significativas y unas palabras desde el corazón: ¿cómo llegó a tu vida?, ¿qué era lo que más le gustaba?, ¿qué huella imborrable dejó en tu alma? Todo quedará guardado en su ficha conmemorativa oficial.
                    </p>
                  </div>
                </div>

                {/* Paso 4 */}
                <div className="bg-white rounded-[22px] p-5 sm:p-7 border border-[#F0ECF5] shadow-[0_4px_14px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_24px_rgba(30,42,120,0.07)] hover:border-[#E2D9EE] transition-all flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#F5E8FF] border border-[#FBCFE8] text-[#BE185D] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#1E2A78]">
                        Comprueba la vista previa antes de publicar
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
                        <Image src="/images/icons/star.svg" alt="Estrella" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span>Paso 4 · Verificación</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                      Podrás ver exactamente cómo se mostrará su estrella en el firmamento y cómo se leerá su historia antes de dar el paso final. Podrás corregir cualquier dato con total tranquilidad.
                    </p>
                  </div>
                </div>

                {/* Paso 5 */}
                <div className="bg-white rounded-[22px] p-5 sm:p-7 border border-[#F0ECF5] shadow-[0_4px_14px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_24px_rgba(30,42,120,0.07)] hover:border-[#E2D9EE] transition-all flex items-start gap-4 sm:gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF0F4] to-[#F5E8FF] border border-[#FBCFE8] text-[#BE185D] font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                    5
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#1E2A78]">
                        Su estrella brilla para siempre + Diploma Conmemorativo
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider">
                        <Image src="/images/icons/Logoheart.svg" alt="Corazón Ángel" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
                        <span>Paso 5 · En el Cielo</span>
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                      Tras la confirmación segura con Stripe, su estrella se enciende inmediatamente en el Mural Global con sus <strong>coordenadas únicas</strong>. Recibirás en tu email su <strong>Diploma Oficial Conmemorativo</strong> en alta calidad, listo para descargar, imprimir y enmarcar en casa.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF9F5] border-l-4 border-[#F97316] text-xs sm:text-sm text-[#9A3412]">
                      <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={14} height={14} className="w-3.5 h-3.5 object-contain shrink-0" />
                      <span>Recibirás un enlace directo para compartir su estrella con familiares y amigos.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Tarjeta 3: Preguntas Frecuentes (FAQ) */}
          <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.06)] relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78] mb-6 flex items-center gap-3">
                <Image src="/images/icons/Logoheart.svg" alt="Corazón" width={28} height={28} className="w-7 h-7 object-contain" />
                <span>Dudas habituales sobre el Mural</span>
              </h2>

              <div className="space-y-3.5">
                <div className="bg-white rounded-2xl p-5 border border-[#EFEAF4] shadow-sm">
                  <div className="font-bold text-[#1E2A78] text-base flex items-center justify-between gap-3">
                    <span>¿El espacio en el mural caduca o tiene cuotas mensuales?</span>
                    <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[#554D6C] mt-2.5 pt-2.5 border-t border-dashed border-[#EDE8F4] leading-relaxed">
                    <strong>No, nunca.</strong> El homenaje es de pago único y su estrella permanece encendida para siempre en el Mural Global. No existen mensualidades, renovaciones ni cargos ocultos.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#EFEAF4] shadow-sm">
                  <div className="font-bold text-[#1E2A78] text-base flex items-center justify-between gap-3">
                    <span>¿Cómo encuentro a mi mascota entre tantas estrellas?</span>
                    <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[#554D6C] mt-2.5 pt-2.5 border-t border-dashed border-[#EDE8F4] leading-relaxed">
                    El Mural cuenta con un <strong>buscador inteligente</strong> por nombre. Además, cada angelito tiene un enlace personalizado y unas coordenadas exactas (por ejemplo: Cuadrante A-12, Estrella 48) que te llevan directo a él en un clic.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#EFEAF4] shadow-sm">
                  <div className="font-bold text-[#1E2A78] text-base flex items-center justify-between gap-3">
                    <span>¿Puedo encender velas o visitarlo en fechas especiales?</span>
                    <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[#554D6C] mt-2.5 pt-2.5 border-t border-dashed border-[#EDE8F4] leading-relaxed">
                    Sí. Tanto tú como cualquier familiar o amigo podéis entrar a su ficha en aniversarios, cumpleaños o la noche del 27 de Octubre para encender una vela virtual conmemorativa y dejar mensajes de cariño.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-[#EFEAF4] shadow-sm">
                  <div className="font-bold text-[#1E2A78] text-base flex items-center justify-between gap-3">
                    <span>¿Cómo funciona la ayuda a protectoras (Corazones de Ángel)?</span>
                    <Image src="/images/icons/plans/pawrosa.svg" alt="Huella" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
                  </div>
                  <p className="text-sm sm:text-base text-[#554D6C] mt-2.5 pt-2.5 border-t border-dashed border-[#EDE8F4] leading-relaxed">
                    Al elegir la modalidad de apadrinamiento solidario, el <strong>50% del importe</strong> se destina íntegramente a protectoras de animales registradas, ayudando a alimentar y cuidar a perritos y gatitos que aún no han encontrado familia.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Llamada a la acción final */}
          <div className="text-center pt-4">
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78] mb-3">
              ¿Listo para darle su lugar eterno en el cielo?
            </h3>
            <p className="text-[#5A639C] max-w-lg mx-auto mb-8 text-sm sm:text-base leading-relaxed">
              Porque su amor no se fue: se transformó en la estrella más bonita del firmamento.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/mural-global"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#1E2A78] to-[#2E3C94] text-white font-bold text-sm shadow-[0_4px_16px_rgba(30,42,120,0.25)] hover:shadow-[0_6px_22px_rgba(30,42,120,0.35)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2.5"
              >
                <span>Ver el Mural Global</span>
                <Image src="/images/icons/star.svg" alt="Estrella" width={16} height={16} className="w-4 h-4 object-contain" />
              </Link>
              <Link
                href="/contacto"
                className="px-7 py-3.5 rounded-full bg-white/90 text-[#1E2A78] font-bold text-sm border border-[#D5CAE6] hover:bg-white shadow-sm transition-all inline-flex items-center gap-2"
              >
                <span>¿Tienes dudas? Escríbenos</span>
                <Image src="/images/icons/paw.svg" alt="Huella" width={16} height={16} className="w-4 h-4 object-contain" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
