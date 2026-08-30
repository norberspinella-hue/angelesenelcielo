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

      {/* Alternativa WhatsApp */}
      <div className="mt-12 pt-6 border-t border-[#1E2A78]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 p-5 rounded-2xl border border-white/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1E2A78]">¿Prefieres una respuesta más rápida?</p>
            <p className="text-xs text-[#4A3F6B]/80">Escríbenos directamente a nuestro WhatsApp de atención.</p>
          </div>
        </div>
        <a
          href="https://wa.me/34690196207?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20memorial%20de%20%C3%81ngeles%20en%20el%20Cielo%20%F0%9F%90%BE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA850] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all shrink-0"
        >
          <span>Abrir WhatsApp</span>
          <span>💬</span>
        </a>
      </div>
    </div>
  );
}
