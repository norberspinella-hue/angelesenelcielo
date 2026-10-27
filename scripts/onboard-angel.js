/**
 * Script estándar y robusto para dar de alta un angelito manualmente.
 * Garantiza:
 * 1. Generación de WebP optimizado + thumbnail 400x400.
 * 2. Subida a Supabase Storage (original y thumbnail).
 * 3. Inserción en 'memorials' con todos los campos aprobados y públicos.
 * 4. Upsert en 'mural_slots' con status: 'occupied' garantizado y thumbnail_url vinculado.
 * 5. Envío transaccional vía Resend al dueño y copias.
 * 6. Auto-verificación de visibilidad en la API del mural.
 */

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cargar variables de entorno
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(env.RESEND_API_KEY);

async function onboardAngel({
  petName,
  species = 'perro',
  breed = 'Mestizo',
  birthDate = null,
  deathDate = null,
  dedication,
  socialHandle = '',
  email,
  copyEmails = [],
  imagePath,
  planType = 'recuerdo_eterno',
  size = 3, // 1, 2, 3, 4
  startX,
  startY,
  pricePaid = 29.00
}) {
  console.log(`\n========================================`);
  console.log(`[ONBOARDING] Iniciando alta para: ${petName}`);
  console.log(`========================================`);

  if (!fs.existsSync(imagePath)) {
    throw new Error(`La imagen no existe en la ruta: ${imagePath}`);
  }

  const timestamp = Date.now();
  const slug = `${petName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${timestamp}`;

  // 1. Procesar imágenes con sharp
  console.log('1. Procesando y optimizando imagen original y miniatura...');
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const originalWebpPath = path.join(tempDir, `${slug}_orig.webp`);
  const thumbWebpPath = path.join(tempDir, `${slug}_thumb.webp`);

  await sharp(imagePath)
    .resize(800, 800, { fit: 'cover', position: 'center' })
    .webp({ quality: 90 })
    .toFile(originalWebpPath);

  await sharp(imagePath)
    .resize(400, 400, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(thumbWebpPath);

  // 2. Subir a Supabase Storage
  console.log('2. Subiendo a Supabase Storage...');
  const originalFilename = `pets/original/${timestamp}_${petName.toLowerCase()}.webp`;
  const thumbFilename = `pets/thumbnails/${timestamp}_${petName.toLowerCase()}.webp`;

  const { error: errOrig } = await supabase.storage
    .from('pet-photos')
    .upload(originalFilename, fs.readFileSync(originalWebpPath), { contentType: 'image/webp', upsert: true });
  if (errOrig) throw new Error('Error subiendo foto original: ' + errOrig.message);

  const { error: errThumb } = await supabase.storage
    .from('pet-photos')
    .upload(thumbFilename, fs.readFileSync(thumbWebpPath), { contentType: 'image/webp', upsert: true });
  if (errThumb) throw new Error('Error subiendo miniatura: ' + errThumb.message);

  const photoUrl = supabase.storage.from('pet-photos').getPublicUrl(originalFilename).data.publicUrl;
  const thumbnailUrl = supabase.storage.from('pet-photos').getPublicUrl(thumbFilename).data.publicUrl;

  console.log('   - Foto principal:', photoUrl);
  console.log('   - Miniatura:', thumbnailUrl);

  // 3. Crear registro en memorials
  console.log('3. Creando registro en tabla memorials...');
  const memorialId = crypto.randomUUID();
  const slotAssigned = `${startX},${startY}`;

  const memorialPayload = {
    id: memorialId,
    user_id: null,
    email,
    pet_name: petName,
    species,
    breed,
    photo_url: photoUrl,
    birth_date: birthDate,
    death_date: deathDate,
    dedication,
    story_answers: {
      socialHandle,
      instagram: socialHandle,
      tiktok: socialHandle
    },
    plan_type: planType,
    price_paid: pricePaid,
    currency: 'EUR',
    slots_count: size * size,
    profile_slug: slug,
    visibility: 'public',
    payment_status: 'paid',
    publication_status: 'published',
    moderation_status: 'approved',
    deletion_token: crypto.randomUUID(),
    slot_assigned: slotAssigned,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error: memErr } = await supabase.from('memorials').insert([memorialPayload]);
  if (memErr) throw new Error('Error insertando memorial: ' + memErr.message);
  console.log(`   - Memorial creado con ID: ${memorialId}`);

  // 4. Crear slots en mural_slots con status: occupied y thumbnail_url ESTRICTAMENTE garantizados
  console.log(`4. Registrando ${size * size} slots (${size}x${size}) en mural_slots...`);
  const slotsToUpsert = [];
  for (let dx = 0; dx < size; dx++) {
    for (let dy = 0; dy < size; dy++) {
      slotsToUpsert.push({
        x: startX + dx,
        y: startY + dy,
        status: 'occupied',
        memorial_id: memorialId,
        plan_type: planType,
        thumbnail_url: thumbnailUrl
      });
    }
  }

  const { error: slotsErr } = await supabase.from('mural_slots').upsert(slotsToUpsert, { onConflict: 'x,y' });
  if (slotsErr) throw new Error('Error al registrar slots: ' + slotsErr.message);
  console.log(`   - Slots ocupados de (${startX}, ${startY}) a (${startX + size - 1}, ${startY + size - 1})`);

  // 5. Envío de correos de confirmación
  console.log('5. Enviando correos con Resend...');
  const fromEmail = env.RESEND_FROM_EMAIL || 'hello@todaslasmascotasvanalcielo.com';
  const appUrl = env.NEXT_PUBLIC_URL || 'https://todaslasmascotasvanalcielo.com';
  const muralLink = `${appUrl}/mural-global?highlight=${startX},${startY}&zoom=true`;

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family:Arial,sans-serif;background:#f5e8ff;padding:24px;">
    <h2>¡${petName} ya brilla en el Mural de Ángeles! ✨</h2>
    <p>Su recuerdo ha sido dado de alta con éxito en el cielo de las mascotas.</p>
    <p><a href="${muralLink}" style="display:inline-block;padding:12px 24px;background:#F65F8F;color:#fff;border-radius:24px;text-decoration:none;">Ver en el Mural Global</a></p>
  </body>
  </html>
  `;

  try {
    await resend.emails.send({
      from: `Ángeles en el Cielo <${fromEmail}>`,
      to: email,
      cc: copyEmails.length > 0 ? copyEmails : undefined,
      subject: `✨ El recuerdo de ${petName} ya brilla en el cielo`,
      html: emailHtml
    });
    console.log(`   - Correo enviado a ${email} ${copyEmails.length ? `(CC: ${copyEmails.join(', ')})` : ''}`);
  } catch (err) {
    console.error('Aviso: error enviando correo:', err.message);
  }

  // 6. Limpieza temporal
  try {
    fs.unlinkSync(originalWebpPath);
    fs.unlinkSync(thumbWebpPath);
  } catch (_) {}

  // 7. Auto-verificación
  console.log('6. Verificando que el navegador lo reciba correctamente...');
  const { data: verifyData } = await supabase
    .from('mural_slots')
    .select('x, y, status, thumbnail_url')
    .eq('memorial_id', memorialId);

  const allOccupied = (verifyData || []).every(s => s.status === 'occupied' && s.thumbnail_url);
  if (!allOccupied || verifyData.length !== size * size) {
    throw new Error('Fallo de verificación: algunos slots no quedaron correctamente en estado occupied');
  }

  console.log(`✅ ¡Verificación superada! ${verifyData.length} slots listos y visibles inmediatamente.`);
  return { memorialId, slug, photoUrl, thumbnailUrl, muralLink };
}

module.exports = { onboardAngel };
