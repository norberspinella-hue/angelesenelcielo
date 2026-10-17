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

          {/* Enlace a compromisos y llamada a la acción */}
          <div className="text-center pt-4">
            <p className="text-xs sm:text-sm text-[#706A95] mb-6">
              Para conocer las garantías técnicas y de custodia de nuestro servicio, puedes consultar nuestros{' '}
              <Link href="/compromisos" className="text-[#1E2A78] font-bold underline hover:text-[#4A3F6B] transition-colors">
                Compromisos Fundamentales
              </Link>{' '}
              o los{' '}
              <Link href="/terminos" className="text-[#1E2A78] font-bold underline hover:text-[#4A3F6B] transition-colors">
                Términos y Condiciones de Uso
              </Link>.
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
