import Image from 'next/image';

export function RainbowBridge() {
  return (
    <section className="bridge-section px-6 pt-[62px] pb-[62px]">
      <div className="bridge-card relative w-full max-w-[1200px] h-[400px] mx-auto rounded-[24px] overflow-hidden">
        <Image
          src="/images/bridge/rainbow-bridge.webp"
          alt="El puente del arcoíris"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
        />
        <div className="bridge-overlay absolute inset-0 bg-[rgba(20,10,40,0.26)]" />
        <div className="bridge-content relative z-10 text-center text-white h-full flex flex-col justify-center items-center">
          <h2 className="font-title text-4xl md:text-5xl font-bold mb-4">Todos los que amamos cruzan el puente.</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto px-4">Guarda un espacio en el cielo y forma parte del mural más grande de ángeles de 4 patas.</p>
        </div>
      </div>
    </section>
  );
}
