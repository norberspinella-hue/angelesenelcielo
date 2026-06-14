import { createAdminClient } from '@/lib/supabase/server';
import React from 'react';
import UploadForm from './UploadForm';

interface PageProps {
  searchParams: {
    token?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function UploadCertificatePage({ searchParams }: PageProps) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4] text-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-red-100 max-w-md">
          <span className="text-4xl">❌</span>
          <h1 className="text-xl font-bold text-red-700 mt-4">Acceso Denegado</h1>
          <p className="text-[#706A95] mt-2">Falta el token de autorización en el enlace.</p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('upload_token', token)
    .single();

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4] text-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-red-100 max-w-md">
          <span className="text-4xl">❌</span>
          <h1 className="text-xl font-bold text-red-700 mt-4">Enlace Inválido o Expirado</h1>
          <p className="text-[#706A95] mt-2">El token proporcionado no es válido o ya ha sido utilizado.</p>
        </div>
      </div>
    );
  }

  if (cert.status === 'delivered') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F4] text-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-green-100 max-w-md">
          <span className="text-4xl">✓</span>
          <h1 className="text-xl font-bold text-green-700 mt-4">Certificado Entregado</h1>
          <p className="text-[#706A95] mt-2">
            El certificado para <strong>{cert.pet_name}</strong> ({cert.order_id}) ya fue subido y entregado con éxito al cliente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F4] py-12 px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_20px_50px_rgba(112,106,149,0.08)]">
        <div className="text-center mb-8">
          <span className="text-4xl">🎨</span>
          <h1 className="text-2xl font-serif font-bold text-[#1E2A78] mt-4">Portal de Subida de Certificados</h1>
          <p className="text-sm text-[#706A95] mt-1">Carga los archivos listos para el cliente</p>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-700 border border-gray-100">
          <div className="grid grid-cols-2 gap-y-2">
            <span className="font-semibold text-gray-500">Mascota:</span>
            <span className="font-bold text-[#1E2A78]">{cert.pet_name}</span>
            <span className="font-semibold text-gray-500">Plan contratado:</span>
            <span className="font-semibold text-[#1E2A78]">{cert.plan.toUpperCase()}</span>
            <span className="font-semibold text-gray-500">Código de pedido:</span>
            <span className="font-mono text-[#1E2A78]">{cert.order_id}</span>
          </div>
        </div>

        <UploadForm token={token} petName={cert.pet_name} userEmail={cert.user_email} />
      </div>
    </main>
  );
}
