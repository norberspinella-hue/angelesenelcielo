import React, { useState } from 'react';

interface StepCheckoutSummaryProps {
  onBack: () => void;
  draftData: any;
  selectedPlan: string;
  selectedSlot: { col: number; row: number } | null;
}

export function StepCheckoutSummary({ onBack, draftData, selectedPlan, selectedSlot }: StepCheckoutSummaryProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getPlanDetails = () => {
    switch(selectedPlan) {
      case 'corazon_eterno': return { title: 'Corazón Eterno', price: '9,99 €', duration: 'Para siempre', slots: '9 slots' };
      case 'estrella_brillante': return { title: 'Estrella Brillante', price: '4,99 €', duration: 'Para siempre', slots: '4 slots' };
      default: return { title: 'Huellita', price: '1,99 €/año', duration: '1 año', slots: '1 slot' };
    }
  };

  const plan = getPlanDetails();

  const handleCheckout = async () => {
    try {
      setLoading(true)
      
      const planKey = {
        'huellita': 'huellita',
        'estrella_brillante': 'estrella_brillante', 
        'corazon_eterno': 'corazon_eterno',
      }[selectedPlan] ?? 'huellita'

      const slotIdStr = selectedSlot ? `${selectedSlot.col},${selectedSlot.row}` : 'auto';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          slotId: slotIdStr,
          petName: draftData.name ?? '',
          email: email ?? '',
          photoUrl: draftData.photoUrl ?? '',
          thumbnailUrl: draftData.thumbnailUrl ?? '',
          petDate: draftData.petDate ?? '',
          species: draftData.species ?? 'perro',
          breed: draftData.breed ?? '',
          birthDate: draftData.birthDate ?? '',
          location: draftData.location ?? '',
          dedication: (draftData.message || '').slice(0, 490),
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL returned from checkout')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1E2A78] font-serif mb-2">Paso 4 — Checkout Seguro</h2>
        <p className="text-sm text-[#706A95]">Estás a un paso de completar tu homenaje. Revisa tu selección.</p>
      </div>

      <div className="flex flex-col gap-4 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Resumen del plan */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          {draftData.thumbnailUrl || draftData.photoUrl ? (
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(236,111,163,0.40)',
              flexShrink: 0,
            }}>
              <img
                src={draftData.thumbnailUrl || draftData.photoUrl}
                alt={draftData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 border-[#C9A961]">
              <span className="text-2xl">🐾</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-[#1E2A78] mb-1">{plan.title}</h3>
            <div className="flex gap-4 text-xs text-[#706A95]">
              <div>👤 <span className="font-semibold text-[#1E2A78]">{plan.price}</span></div>
              <div>📅 <span className="font-semibold text-[#1E2A78]">{plan.slots}</span></div>
              <div>⏱ <span className="font-semibold text-[#1E2A78]">{plan.duration}</span></div>
            </div>
          </div>
        </div>

        {/* Resumen de dedicatoria */}
        <div className="bg-[#FFF8F4] border border-[#F8C7D8] rounded-2xl p-4">
          <h4 className="text-xs font-bold text-[#1E2A78] mb-2 uppercase tracking-wider">Dedicatoria para {draftData.name}</h4>
          <p className="text-sm text-[#1E2A78] italic">"{draftData.message || 'Sin mensaje'}" ✨</p>
        </div>

        {/* Campo Email del usuario */}
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-bold text-[#1E2A78] mb-1">Tu Correo Electrónico</label>
          <input 
            type="email" 
            required
            placeholder="ejemplo@correo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#1E2A78] focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] outline-none bg-white"
          />
          <p className="text-[10px] text-[#706A95] mt-1">Aquí te enviaremos el certificado de tu angelito.</p>
        </div>

        {/* Bloque Stripe */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mt-4">
          <div className="text-[#1E2A78] text-2xl mb-2">🔒</div>
          <h4 className="font-bold text-[#1E2A78] mb-2">Pago seguro con Stripe</h4>
          <p className="text-xs text-[#706A95] mb-4">
            Serás redirigido a Stripe Checkout para completar tu pago de forma segura.
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            <span>🔐 Cifrado</span>
            <span>•</span>
            <span>🛡 Protegido</span>
            <span>•</span>
            <span>✓ 100% Seguro</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div style={{
          background: 'rgba(255,248,230,0.90)',
          border: '1.5px solid rgba(255,200,60,0.40)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: 12,
            color: '#7B6F9A',
            fontFamily: 'sans-serif',
            fontWeight: 700,
            lineHeight: 1.6,
            margin: 0,
          }}>
            Este espacio es muy popular. En el caso de que 
            otro ángel lo reserve justo antes que tú, 
            colocaremos a tu mascota en el espacio más 
            cercano disponible con el mismo amor.{' '}
            <img 
              src="/images/icons/plans/pawrosa.svg"
              alt=""
              style={{ 
                width: 14, 
                height: 14, 
                display: 'inline',
                verticalAlign: 'middle',
                marginLeft: 2,
              }}
            />
          </p>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={loading || !email}
          className="btn-drawer-cta text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Ir a Stripe Checkout →'}
        </button>
        <button 
          onClick={onBack}
          disabled={loading}
          className="text-[#1E2A78] text-sm font-bold mt-2 hover:underline btn-drawer-back"
        >
          ← Volver a datos
        </button>
      </div>
    </div>
  );
}
