import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createCertificateOrder } from '@/lib/certificates';
import { createAdminClient } from '@/lib/supabase/server';
import { FOUNDER_CONFIG } from '@/lib/founderConfig';

// Desactivar el parseo automático de body de Next.js para poder validar la firma de Stripe
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Falta stripe-signature o STRIPE_WEBHOOK_SECRET');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`❌ Falló la verificación de firma del Webhook:`, errorMessage);
    return NextResponse.json(
      { error: `Fallo de verificación de firma: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`🔔 Evento de Stripe recibido: ${event.type}`);

  // Eventos a escuchar:
  // Dependiendo de cómo configures Stripe (Checkout Sessions o Payment Intents directos),
  // el evento principal suele ser 'checkout.session.completed' o 'payment_intent.succeeded'.
  // Daremos soporte a ambos para mayor robustez:
  
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    let metadata: Stripe.Metadata = {};
    let userEmail: string | null = null;
    let orderId: string | null = null;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      metadata = session.metadata || {};
      userEmail = session.customer_details?.email || session.customer_email || null;
      // Usamos el ID de la sesión como identificador alternativo si no viene en metadata
      orderId = metadata.orderId || `AEC-S${session.id.slice(-8).toUpperCase()}`;
    } else {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      metadata = paymentIntent.metadata || {};
      userEmail = paymentIntent.receipt_email || null;
      orderId = metadata.orderId || `AEC-P${paymentIntent.id.slice(-8).toUpperCase()}`;
    }

    // Extraemos la información del angelito
    const petName = metadata.petName;
    const plan = metadata.plan; // 'fundador' | 'eterno' | 'estrella' | 'inicial'
    const founderNumberRaw = metadata.founderNumber;
    const slotCode = metadata.slotCode || '';
    const petPhotoUrl = metadata.petPhotoUrl;
    const profileUrl = metadata.profileUrl || '';

    // Si viene la información de email del cliente dentro de la metadata, le damos prioridad
    if (metadata.userEmail) {
      userEmail = metadata.userEmail;
    }

    // Validación de datos mínimos requeridos
    if (orderId && userEmail && petName && plan && petPhotoUrl) {
      try {
        let finalFounderNumber = founderNumberRaw ? parseInt(founderNumberRaw, 10) : undefined;
        let finalPlan = plan;

        if (plan === 'corazon_eterno' && slotCode) {
          const supabase = createAdminClient();
          const { count } = await supabase
            .from('mural_slots')
            .select('id', { count: 'exact', head: true })
            .eq('plan', 'corazon_eterno')
            .eq('is_founder', true);

          const currentCount = count || 0;
          const isFounder = currentCount < FOUNDER_CONFIG.maxFounders;

          if (isFounder) {
            finalFounderNumber = currentCount + 1;
            finalPlan = 'fundador';
          }

          // @ts-expect-error: These columns will be added to DB manually, TS might not know them yet
          await supabase.from('mural_slots').update({
            is_founder: isFounder,
            founder_number: isFounder ? finalFounderNumber : null,
          }).eq('id', slotCode);
        }
        
        // Crear orden de certificado
        await createCertificateOrder({
          orderId,
          userEmail,
          petName,
          plan: finalPlan,
          founderNumber: finalFounderNumber !== undefined && isNaN(finalFounderNumber) ? undefined : finalFounderNumber,
          slotCode,
          petPhotoUrl,
          profileUrl,
        });

        console.log(`✅ Orden de certificado procesada con éxito para pedido: ${orderId}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`❌ Error al procesar la orden del certificado para pedido ${orderId}:`, err);
        return NextResponse.json(
          { error: `Error al procesar la orden: ${errorMessage}` },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        `⚠️ Recibido pago exitoso pero faltan campos requeridos en la metadata para crear el certificado.`,
        { orderId, userEmail, petName, plan, petPhotoUrl }
      );
    }
  }

  return NextResponse.json({ received: true });
}
