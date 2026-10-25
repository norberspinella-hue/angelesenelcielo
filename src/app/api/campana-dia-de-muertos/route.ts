import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      petName, 
      guardianName, 
      contactType, 
      contactValue, 
      dedication, 
      photoUrl, 
      authorizedSocials 
    } = body;

    if (!petName || typeof petName !== 'string' || !petName.trim()) {
      return NextResponse.json({ error: 'El nombre de tu angelito es obligatorio' }, { status: 400 });
    }

    if (!contactValue || typeof contactValue !== 'string' || !contactValue.trim()) {
      return NextResponse.json({ error: 'Indícanos tu email o usuario de redes para poder avisarte' }, { status: 400 });
    }

    if (!dedication || typeof dedication !== 'string' || !dedication.trim()) {
      return NextResponse.json({ error: 'Por favor escribe unas palabras o recuerdo especial' }, { status: 400 });
    }

    if (!authorizedSocials) {
      return NextResponse.json({ 
        error: 'Debes autorizar la publicación de la historia en el homenaje conmemorativo' 
      }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const cleanPetName = petName.trim();
    const cleanGuardianName = guardianName ? guardianName.trim() : 'Familia';
    const cleanContactType = contactType || 'email';
    const cleanContactValue = contactValue.trim();
    const cleanDedication = dedication.trim();
    const safePhotoUrl = photoUrl && typeof photoUrl === 'string' ? photoUrl.trim() : '';

    // 1. Guardar localmente en JSON para respaldo y registro completo
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, 'dia-de-muertos-stories.json');
      let existingStories: any[] = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          existingStories = JSON.parse(fileContent);
        } catch {
          existingStories = [];
        }
      }
      existingStories.unshift({
        id: `story_${Date.now()}`,
        petName: cleanPetName,
        guardianName: cleanGuardianName,
        contactType: cleanContactType,
        contactValue: cleanContactValue,
        dedication: cleanDedication,
        photoUrl: safePhotoUrl,
        authorizedSocials: true,
        createdAt: timestamp,
      });
      fs.writeFileSync(filePath, JSON.stringify(existingStories, null, 2), 'utf8');
    } catch (saveError) {
      console.warn('Advertencia guardando historia en JSON local:', saveError);
    }

    // 2. Notificar por email a Norbert con formato visual de lujo
    const recipientEmail = 'norber.spinella@gmail.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';

    await resend.emails.send({
      from: `Ángeles en el Cielo · Campaña <${fromEmail}>`,
      to: recipientEmail,
      subject: `🐾 [Día de Muertos] Nueva historia recibida: ${cleanPetName} (${cleanContactType}: ${cleanContactValue})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0B071A; color: #FFF; border-radius: 16px; border: 1px solid #F5C842;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 28px;">🕯️ 🐾 ⭐</span>
            <h2 style="color: #FDE68A; margin: 8px 0 4px; font-family: Georgia, serif;">Nueva Historia para el Homenaje</h2>
            <p style="color: #E9D5FF; font-size: 13px; margin: 0;">Campaña Día de Muertos 2026 · «El amor siempre encuentra el camino»</p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(245, 200, 66, 0.25);">
            <div style="margin-bottom: 14px;">
              <strong style="color: #FBBF24; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Nombre del Angelito:</strong>
              <div style="font-size: 20px; font-weight: bold; color: #FFF; margin-top: 2px;">${escapeHtml(cleanPetName)}</div>
            </div>

            <div style="margin-bottom: 14px;">
              <strong style="color: #FBBF24; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Familia / Tutor:</strong>
              <div style="font-size: 15px; color: #E2E8F0; margin-top: 2px;">${escapeHtml(cleanGuardianName)}</div>
            </div>

            <div style="margin-bottom: 14px;">
              <strong style="color: #FBBF24; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Vía de Contacto (${escapeHtml(cleanContactType)}):</strong>
              <div style="font-size: 15px; color: #38BDF8; margin-top: 2px;">${escapeHtml(cleanContactValue)}</div>
            </div>

            <div style="margin-bottom: 16px;">
              <strong style="color: #FBBF24; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Dedicatoria / Recuerdo:</strong>
              <div style="background: rgba(0, 0, 0, 0.35); border-left: 3px solid #F59E0B; padding: 12px; border-radius: 6px; font-size: 14px; font-style: italic; color: #F8FAFC; margin-top: 6px; line-height: 1.6; white-space: pre-wrap;">
                "${escapeHtml(cleanDedication)}"
              </div>
            </div>

            ${safePhotoUrl ? `
              <div style="margin-top: 16px; text-align: center;">
                <strong style="color: #FBBF24; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Fotografía Adjunta:</strong>
                <a href="${escapeHtml(safePhotoUrl)}" target="_blank" rel="noopener noreferrer">
                  <img src="${escapeHtml(safePhotoUrl)}" alt="${escapeHtml(cleanPetName)}" style="max-width: 100%; max-height: 320px; border-radius: 8px; border: 2px solid #F5C842; object-fit: contain;" />
                </a>
                <div style="margin-top: 6px;">
                  <a href="${escapeHtml(safePhotoUrl)}" target="_blank" style="color: #FCD34D; font-size: 12px; text-decoration: underline;">Abrir fotografía en alta resolución ↗</a>
                </div>
              </div>
            ` : `
              <div style="font-size: 12px; color: #94A3B8; font-style: italic;">(Sin fotografía adjunta)</div>
            `}
          </div>

          <div style="margin-top: 20px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; text-align: center; font-size: 12px; color: #86EFAC;">
            ✓ Autorización confirmada para publicación en homenaje colectivo y redes sociales.
          </div>

          <p style="font-size: 11px; color: #64748B; margin-top: 20px; text-align: center;">
            Enviado desde el formulario oficial de campaña en todaslasmascotasvanalcielo.com/dia-de-muertos · ${timestamp}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `¡La historia de ${cleanPetName} ha sido recibida con todo el amor! Pronto encenderemos su estrella.`,
    });

  } catch (error: any) {
    console.error('Error in /api/campana-dia-de-muertos:', error);
    return NextResponse.json({
      error: 'Ocurrió un error al enviar tu historia. Por favor inténtalo de nuevo o escríbenos por Instagram/TikTok.',
    }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
