import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-xl mx-auto space-y-8">
        <Image 
          src="/images/placeholders/logo-angeles-cielo.svg" 
          alt="Ángeles en el Cielo Logo" 
          width={300} 
          height={80} 
          className="mx-auto"
        />
        <h1 className="text-4xl font-playfair font-bold text-heaven-navy">
          Todas las mascotas van al cielo
        </h1>
        <p className="text-lg text-heaven-navy/80 font-inter">
          Una experiencia memorial digital para mantener viva la luz de quienes nos dieron tanto amor.
        </p>
        <div className="pt-4">
          <Link 
            href="/angeles-en-el-cielo"
            className="inline-block bg-heaven-navy text-white px-8 py-4 rounded-full font-inter font-medium hover:bg-heaven-navy/90 transition-colors"
          >
            Visitar Ángeles en el Cielo
          </Link>
        </div>
      </div>
    </main>
  );
}
