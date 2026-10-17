import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Desde el Corazón · Nuestro Porqué y Compromiso | Ángeles en el Cielo',
  description: 'Conoce por qué creamos Ángeles en el Cielo: en memoria de Juliette, un homenaje honesto, respetuoso y lleno de amor para honrar la vida de nuestras mascotas.',
};

export default function DesdeElCorazonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F4]">
      {/* Header flotante */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-[960px] mx-auto space-y-12">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F4] border border-[#F8C7D8] text-xs font-semibold text-[#E05282] mb-4 shadow-sm">
              <span>❤️</span>
              <span>Desde el Corazón · Nuestro Porqué y Compromiso</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E2A78] leading-tight mb-5">
              Por qué nació este cielo... Por ellos y para siempre
            </h1>
            <p className="text-[#5A639C] text-base sm:text-lg leading-relaxed">
              Sabemos lo importante y delicado que es este paso para ti. Por eso compartimos la historia real que dio vida a Ángeles en el Cielo y nuestro compromiso humano con cada familia.
            </p>
          </div>

          {/* Bloque: El Porqué de la Web (Historia, Alma y Misión) */}
          <section className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 sm:p-10 md:p-12 border border-[#E9E4F0] shadow-[0_16px_48px_rgba(112,106,149,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FCE7F3]/40 via-[#F3E8FF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F4] border border-[#F8C7D8] text-xs font-semibold text-[#E05282] mb-4 shadow-sm">
                <span>🐾</span>
                <span>En memoria de Juliette · El origen de Ángeles en el Cielo</span>
              </div>
              
              <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E2A78] mb-6 leading-snug">
                Por qué nace el Mural Global de Mascotas
              </h2>

              <div className="space-y-5 text-sm sm:text-base text-[#4A3F6B] leading-relaxed">
                <p>
                  Ángeles en el Cielo nace en memoria de <strong>nuestra pequeña Juliette</strong>, quien partió en 2018 después de 5 años regalándonos el mayor amor que jamás habíamos sentido. Se fue luchando como una auténtica guerrera contra su enfermedad de fallo renal. Luchó hasta el último día, cuando decidió que era su momento de descansar. Y hubo un gesto que jamás olvidaremos: <em>nuestra pequeña esperó con paciencia a que volviéramos de viaje para poder despedirse y marcharse en paz...</em>
                </p>

                <p>
                  Tras su pérdida, no supe cómo continuar con mi vida y me sentí completamente vacío. Con el paso del tiempo me di cuenta de una realidad desgarradora: ella se había ido, el mundo a nuestro alrededor continuaba como si nada hubiera ocurrido y nadie más podía conocerla, ver su nobleza ni compartir con el mundo lo inmensamente especial que fue.
                </p>

                <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#FFF8F7] to-[#FAF5FF] border border-[#F6DCE6] my-6 shadow-sm">
                  <p className="font-playfair italic text-base sm:text-lg text-[#1E2A78] font-medium leading-relaxed mb-3">
                    «Fue en ese dolor donde surgió la necesidad vital de transformar el duelo en algo que trascendiera su ausencia: crear un santuario donde todos nuestros angelitos fueran recordados para siempre. Un lugar donde todo el mundo pueda verlos, conocer sus historias y sentir la huella de amor que dejaron.»
                  </p>
                  <span className="text-xs font-bold text-[#C59B73] tracking-wide uppercase">
                    — En honor a Juliette y a todos los que llenaron nuestro corazón
                  </span>
                </div>

                <p>
                  Así nació la visión de crear un <strong>Mural Global de 1.000.000 de Angelitos</strong>: un cielo interactivo infinito dedicado a nuestros compañeros de cuatro patas y a cualquier animalito que llenó de luz el corazón de sus papás y mamás. Un lugar vivo al que volver en aniversarios, fechas señaladas o días de nostalgia para mirar su estrella y saber que no estás solo en tu duelo.
                </p>

                <p>
                  Y hay un compromiso más, nacido del corazón: <strong>ayudar a protectoras y asociaciones de animales</strong> a seguir consiguiendo recursos para su día a día. Queremos que la memoria de Juliette y de todos los angelitos sirva también para cuidar, alimentar y dar una segunda oportunidad a aquellos peludos que hoy siguen esperando un hogar en la tierra.
                </p>

                <p className="pt-2">
                  Porque este proyecto no nació de una fría estrategia de negocio: <strong>nació de las lágrimas, de la gratitud y del amor más puro que un ser vivo puede regalarte</strong>. Por eso nuestro compromiso es total: honestidad absoluta, cero letra pequeña y un respeto sagrado por el recuerdo de tu familia.
                </p>
              </div>
            </div>
          </section>

          {/* Bloque: Los 3 Pilares Técnicos y Humanos */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1E2A78] mb-3">
                Nuestros 3 Compromisos Fundamentales
              </h2>
              <p className="text-sm sm:text-base text-[#706A95]">
                Diseñado con tecnología sólida y criterios éticos para cuidar el recuerdo de tu angelito.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Pilar 1: Infraestructura Estable */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF0FF] text-[#1E2A78] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  ☁️
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Infraestructura Estable
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  Ángeles en el Cielo está desarrollado sobre arquitectura moderna y eficiente de mínimo coste técnico. Esto permite mantener el mural abierto y disponible durante la duración del proyecto sin depender de cuotas mensuales de las familias.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#1E2A78] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Espacio activo durante la duración del proyecto
                </div>
              </div>

              {/* Pilar 2: Custodia y Certificado Propio */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF6E5] text-[#C9A961] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  📜
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Custodia y Certificado Propio
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  El recuerdo de tu pequeño no depende únicamente de una web: nada más publicarse su estrella, tu familia recibe el Certificado Celestial oficial en PDF y el archivo conmemorativo en alta resolución para guardarlo e imprimirlo siempre en casa.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#C9A961] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Siempre en tus manos
                </div>
              </div>

              {/* Pilar 3: Sin Cuotas ni Renovaciones */}
              <div className="flex flex-col bg-white/80 backdrop-blur-sm p-6 sm:p-7 rounded-2xl border border-[#EDE8F5] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#E05282] flex items-center justify-center text-2xl mb-4 shadow-sm">
                  ✨
                </div>
                <h3 className="font-playfair font-bold text-lg text-[#1E2A78] mb-2">
                  Sin Cuotas ni Renovaciones
                </h3>
                <p className="text-xs sm:text-sm text-[#706A95] leading-relaxed flex-1">
                  Realizas un único pago y tu angelito ocupa su lugar en el cielo (o suscripción anual transparente en Plan Huellita). No existen cobros ocultos, ni renovaciones automáticas no deseadas, ni costes de permanencia posteriores. Claridad absoluta para tu tranquilidad.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F0EBF7] text-xs font-semibold text-[#E05282] flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span> Pago transparente sin sorpresas
                </div>
              </div>

            </div>
          </section>

          {/* Bloque: Protocolo de Perpetuidad en Caso de Cierre Futuro */}
          <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#E9E4F0] shadow-sm">
            <h3 className="font-playfair font-bold text-lg sm:text-xl text-[#1E2A78] mb-3 flex items-center gap-2">
              <span>🤝</span>
              <span>¿Y si el proyecto cerrase en un futuro lejano?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5A639C] leading-relaxed mb-4">
              La honestidad exige contemplar todos los escenarios. Si en algún momento, por inviabilidad a largo plazo, el proyecto tuviera que concluir, asumimos un compromiso ético y contractual con cada familia:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#4A3F6B] font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Preaviso formal mínimo de 6 meses</strong> por correo electrónico a todas las familias registradas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Entrega de copia de seguridad digital completa</strong> de la foto, dedicatoria y coordenadas de tu homenaje.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Cesión del archivo conmemorativo</strong> a una entidad protectora de animales o su preservación en el registro abierto e histórico de <em>The Internet Archive</em>.</span>
              </li>
            </ul>
          </section>

          {/* Banner de términos y contacto */}
          <div className="text-center pt-4">
            <p className="text-xs sm:text-sm text-[#706A95] mb-6">
              Para más información detallada sobre las condiciones de nuestro servicio, puedes consultar los{' '}
              <Link href="/terminos" className="text-[#1E2A78] font-bold underline hover:text-[#4A3F6B] transition-colors">
                Términos y Condiciones de Uso
              </Link>{' '}
              o contactar directamente con nuestro equipo.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/mural-global"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1E2A78] to-[#2E3C94] text-white font-bold text-sm shadow-[0_4px_16px_rgba(30,42,120,0.30)] hover:shadow-[0_6px_22px_rgba(30,42,120,0.40)] hover:scale-105 active:scale-95 transition-all"
              >
                Ver el Mural de Ángeles ✨
              </Link>
              <Link
                href="/contacto"
                className="px-6 py-3 rounded-full bg-white/90 text-[#1E2A78] font-bold text-sm border border-[#D5CAE6] hover:bg-white shadow-sm transition-all"
              >
                ¿Tienes dudas? Escríbenos 💬
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
