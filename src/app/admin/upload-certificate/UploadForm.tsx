'use client';

import React, { useState } from 'react';

interface UploadFormProps {
  token: string;
  petName: string;
  userEmail: string;
}

export default function UploadForm({ token, petName, userEmail }: UploadFormProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pngFile, setPngFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !pngFile) {
      setError('Debes cargar obligatoriamente el PDF y el PNG del certificado.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('pdf', pdfFile);
      formData.append('png', pngFile);

      const res = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al subir los archivos.');
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Error en el servidor.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-4">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-200">
          ✓
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">¡Envío Completado!</h3>
        <p className="text-sm text-gray-600">
          El certificado para <strong>{petName}</strong> ha sido subido y enviado con éxito a <strong>{userEmail}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
          ⚠️ {error}
        </div>
      )}

      {/* Upload PDF */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">Archivo PDF (Calidad de Impresión)</label>
        <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
          pdfFile ? 'border-green-300 bg-green-50/20' : 'border-gray-300 hover:border-[#1E2A78]'
        }`}>
          <input 
            type="file" 
            accept="application/pdf"
            className="hidden"
            id="pdf-upload"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="pdf-upload" className="cursor-pointer block">
            <span className="text-2xl mb-2 block">📄</span>
            {pdfFile ? (
              <span className="text-sm font-semibold text-green-700">{pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            ) : (
              <span className="text-sm text-gray-500">Haz clic para cargar el archivo PDF</span>
            )}
          </label>
        </div>
      </div>

      {/* Upload PNG */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">Archivo PNG (Imagen para Compartir)</label>
        <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
          pngFile ? 'border-green-300 bg-green-50/20' : 'border-gray-300 hover:border-[#1E2A78]'
        }`}>
          <input 
            type="file" 
            accept="image/png"
            className="hidden"
            id="png-upload"
            onChange={(e) => setPngFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="png-upload" className="cursor-pointer block">
            <span className="text-2xl mb-2 block">🖼️</span>
            {pngFile ? (
              <span className="text-sm font-semibold text-green-700">{pngFile.name} ({(pngFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            ) : (
              <span className="text-sm text-gray-500">Haz clic para cargar el archivo PNG</span>
            )}
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-full font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#1E2A78] hover:bg-[#151C5C] hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Subiendo y entregando...
          </>
        ) : (
          'Subir y enviar al cliente'
        )}
      </button>
    </form>
  );
}
