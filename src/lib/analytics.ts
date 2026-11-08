export type WhatsAppLocation =
  | 'floating_button'
  | 'footer'
  | 'contact_page'
  | 'pricing_section'
  | 'shelter_modal';

export type WhatsAppQueryType =
  | 'general'
  | 'mural'
  | 'velas'
  | 'cartas'
  | 'planes'
  | 'empresas'
  | 'protectoras'
  | 'soporte';

export interface WhatsAppEventProps {
  page: string;
  location: WhatsAppLocation;
  query_type: WhatsAppQueryType;
}

let lastWhatsAppClickTime = 0;

/**
 * Registra de forma ética y anónima la intención de contacto por WhatsApp en Plausible.
 * - Respeta estrictamente el consentimiento del usuario: si las cookies/analítica opcional están en 'rejected', no emite evento.
 * - Elimina la duplicación de eventos (un único evento por clic con sus props enriquecidas).
 * - No recopila teléfonos, emails, nombres ni contenidos de mensajes (cero PII).
 * - Incluye protección anti doble-clic (cooldown de 1 segundo).
 * - Distingue claramente el clic en enlace de una conversación efectivamente iniciada.
 */
export function trackWhatsAppClick(props: WhatsAppEventProps): void {
  if (typeof window === 'undefined') return;

  // 1. Respetar estrictamente el estado de consentimiento
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'rejected') {
      // El usuario eligió solo cookies necesarias; no emitir eventos analíticos opcionales
      return;
    }
  } catch {}

  // 2. Cooldown anti doble-clic (1 segundo)
  const now = Date.now();
  if (now - lastWhatsAppClickTime < 1000) {
    return;
  }
  lastWhatsAppClickTime = now;

  // 3. Envío único de evento con props estructuradas no personales
  try {
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      plausible('WhatsApp_Click', {
        props: {
          page: props.page,
          location: props.location,
          query_type: props.query_type,
        },
      });
    }
  } catch (err) {
    // Non-blocking
    console.warn('Plausible WhatsApp_Click tracking skipped:', err);
  }
}
