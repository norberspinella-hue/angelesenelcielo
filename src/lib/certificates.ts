import { createAdminClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import crypto from 'crypto';
import React from 'react';
import { CertificatePendingEmail } from '@/components/emails/CertificatePendingEmail';
import { DesignerOrderEmail } from '@/components/emails/DesignerOrderEmail';
import { CertificateDeliveryEmail } from '@/components/emails/CertificateDeliveryEmail';

export interface CreateCertificateOrderParams {
  orderId: string;
  userEmail: string;
  petName: string;
  plan: string;
  founderNumber?: number;
  slotCode: string;
  petPhotoUrl: string;
  profileUrl: string;
}

const PLAN_LABELS: Record<string, string> = {
  fundador: 'Angelito Fundador',
  corazon_eterno: 'Corazón Eterno',
  estrella_brillante: 'Estrella Brillante',
  huellita: 'Huellita',
};

/**
 * Crea una orden de certificado en la base de datos Supabase
 * y envía el email de confirmación al cliente y de encargo al diseñador.
 */
export async function createCertificateOrder(params: CreateCertificateOrderParams) {
  const supabase = createAdminClient();
  
  // Generar un token único de 64 caracteres hex (32 bytes) para seguridad
  const uploadToken = crypto.randomBytes(32).toString('hex');

  const { data, error } = await (supabase
    .from('certificates') as any)
    .insert({
      order_id: params.orderId,
      user_email: params.userEmail,
      pet_name: params.petName,
      plan: params.plan,
      founder_number: params.founderNumber ?? null,
      slot_code: params.slotCode,
      pet_photo_url: params.petPhotoUrl,
      profile_url: params.profileUrl,
      upload_token: uploadToken,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting certificate order:', error);
    throw error;
  }

  // 1. Enviar email de confirmación (Espera) al usuario
  try {
    await sendUserPendingEmail(params.userEmail, params.petName, params.plan);
  } catch (emailError) {
    console.error('Error sending user pending email:', emailError);
  }

  // 2. Enviar email de encargo (Upload link) al diseñador
  try {
    await sendDesignerEmail({
      orderId: params.orderId,
      userEmail: params.userEmail,
      petName: params.petName,
      plan: params.plan,
      founderNumber: params.founderNumber,
      petPhotoUrl: params.petPhotoUrl,
      uploadToken,
    });
  } catch (emailError) {
    console.error('Error sending designer email:', emailError);
  }

  return data;
}

/**
 * Envia email al usuario confirmando que su certificado está en proceso.
 */
export async function sendUserPendingEmail(
  userEmail: string,
  petName: string,
  plan: string
) {
  const planLabel = PLAN_LABELS[plan] || plan;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hola@todaslasmascotasvanalcielo.com';

  const { error } = await resend.emails.send({
    from: `Ángeles en el Cielo <${fromEmail}>`,
    to: userEmail,
    subject: `✨ El certificado de ${petName} está en camino`,
    react: React.createElement(CertificatePendingEmail, { petName, planLabel }),
  });

  if (error) {
    throw error;
  }
}

/**
 * Envia email al diseñador notificando un nuevo encargo con el link único de subida.
 */
export async function sendDesignerEmail(params: {
  orderId: string;
  userEmail: string;
  petName: string;
  plan: string;
  founderNumber?: number;
  petPhotoUrl: string;
  uploadToken: string;
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hola@todaslasmascotasvanalcielo.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@todaslasmascotasvanalcielo.com';
  
  // URL base de la aplicación
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://todaslasmascotasvanalcielo.com';
  const uploadUrl = `${baseUrl}/admin/upload-certificate?token=${params.uploadToken}`;

  const { error } = await resend.emails.send({
    from: `Ángeles en el Cielo Sistema <${fromEmail}>`,
    to: adminEmail,
    subject: `🎨 Nuevo certificado · ${params.petName} · ${params.plan} · ${params.orderId}`,
    react: React.createElement(DesignerOrderEmail, {
      orderId: params.orderId,
      userEmail: params.userEmail,
      petName: params.petName,
      plan: params.plan,
      founderNumber: params.founderNumber,
      petPhotoUrl: params.petPhotoUrl,
      uploadUrl,
    }),
  });

  if (error) {
    throw error;
  }
}

/**
 * Envia email de entrega final al usuario con el certificado PDF y PNG.
 */
export async function sendUserDeliveryEmail(params: {
  userEmail: string;
  petName: string;
  plan: string;
  certificatePdfUrl: string;
  certificatePngUrl: string;
  profileUrl: string;
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hola@todaslasmascotasvanalcielo.com';

  const { error } = await resend.emails.send({
    from: `Ángeles en el Cielo <${fromEmail}>`,
    to: params.userEmail,
    subject: `🎁 El certificado de ${params.petName} ya está listo`,
    react: React.createElement(CertificateDeliveryEmail, {
      petName: params.petName,
      pdfUrl: params.certificatePdfUrl,
      pngUrl: params.certificatePngUrl,
      profileUrl: params.profileUrl,
    }),
  });

  if (error) {
    throw error;
  }
}
