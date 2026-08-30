'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ContactoClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', text: 'Por favor completa todos los campos.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          text: '¡Mensaje recibido con amor! 🐾 Te responderemos a tu correo lo antes posible.',
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({
          type: 'error',
          text: data.error || 'Hubo un problema al enviar el mensaje. Inténtalo de nuevo o escríbenos directamente a hello@todaslasmascotasvanalcielo.com',
        });
      }
    } catch (err) {
      console.error('Error enviando formulario:', err);
      setStatus({
        type: 'error',
        text: 'Error de conexión. Por favor verifica tu red o escríbenos directamente a hello@todaslasmascotasvanalcielo.com',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Eyebrow */}
      <p className="text-sm md:text-base text-[#1E2A78]/70 font-medium tracking-wide mb-3">
        Queremos saber de ti
      </p>

      {/* Título principal en Serif */}
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E2A78] mb-6">
        Escríbenos
      </h1>

      {/* Texto de introducción cálido */}
      <div className="text-[#4A3F6B] text-sm sm:text-base leading-relaxed space-y-2 mb-8">
        <p>
          Tanto si tienes cualquier duda o simplemente quieres decir <strong className="text-[#1E2A78] font-bold">¡HOLA!</strong>, este es el espacio donde hacerlo.
        </p>
        <p>
          No te preocupes, tu mensaje llegará a nuestro buzón email principal y no caerá en uno genérico que nadie lee.
        </p>
        <p className="font-medium text-[#1E2A78] pt-1">
          Y antes que nada, gracias por escribir 🐾
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo Nombre */}
        <div>
          <input
            type="text"
            id="name"
            required
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-[#9CA3AF]/60 bg-white/90 text-[#1E2A78] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/40 focus:border-[#1E2A78] transition-all shadow-sm text-base"
          />
        </div>

        {/* Campo Email */}
        <div>
          <input
            type="email"
            id="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-[#9CA3AF]/60 bg-white/90 text-[#1E2A78] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/40 focus:border-[#1E2A78] transition-all shadow-sm text-base"
          />
        </div>

        {/* Campo Mensaje */}
        <div>
          <textarea
            id="message"
            required
            rows={7}
            placeholder="Mensaje"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-[#9CA3AF]/60 bg-white/90 text-[#1E2A78] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E2A78]/40 focus:border-[#1E2A78] transition-all shadow-sm text-base resize-y min-h-[160px]"
          />
        </div>

        {/* Mensaje de estado (Éxito / Error) */}
        {status && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {status.text}
          </div>
        )}

        {/* Botón Enviar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-[#1E2A78] hover:bg-[#151D54] active:bg-[#0D143D] text-white font-semibold text-base rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
