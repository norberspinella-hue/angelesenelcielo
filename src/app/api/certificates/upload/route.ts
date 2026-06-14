import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = formData.get('token') as string;
    const pdfFile = formData.get('pdf') as File;
    const pngFile = formData.get('png') as File;

    if (!token || !pdfFile || !pngFile) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Validar token y verificar que está en estado pending
    const { data, error: fetchError } = await (supabase
      .from('certificates') as any)
      .select('*')
      .eq('upload_token', token)
      .eq('status', 'pending')
      .single();

    const cert = data as any;

    if (fetchError || !cert) {
      return NextResponse.json(
        { error: 'Token de subida inválido o pedido ya procesado' }, 
        { status: 404 }
      );
    }

    const orderId = cert.order_id;

    // 2. Subir archivos a Supabase Storage
    const pdfPath = `${orderId}/certificate.pdf`;
    const pngPath = `${orderId}/certificate.png`;

    // Convertir los archivos cargados a Buffer
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pngBuffer = Buffer.from(await pngFile.arrayBuffer());

    // Subir PDF al bucket privado 'certificates'
    const { error: pdfUploadError } = await supabase.storage
      .from('certificates')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (pdfUploadError) {
      console.error('Error uploading PDF to storage:', pdfUploadError);
      throw new Error(`Error al subir el archivo PDF: ${pdfUploadError.message}`);
    }

    // Subir PNG al bucket privado 'certificates'
    const { error: pngUploadError } = await supabase.storage
      .from('certificates')
      .upload(pngPath, pngBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (pngUploadError) {
      console.error('Error uploading PNG to storage:', pngUploadError);
      throw new Error(`Error al subir el archivo PNG: ${pngUploadError.message}`);
    }

    // Generar URLs firmadas de larga duración (10 años = 315,360,000 segundos) para servir los archivos privados de forma duradera
    const { data: pdfSignedData, error: pdfSignError } = await supabase.storage
      .from('certificates')
      .createSignedUrl(pdfPath, 315360000);

    if (pdfSignError || !pdfSignedData) {
      throw new Error(`Error al firmar URL del PDF: ${pdfSignError?.message}`);
    }

    const { data: pngSignedData, error: pngSignError } = await supabase.storage
      .from('certificates')
      .createSignedUrl(pngPath, 315360000);

    if (pngSignError || !pngSignedData) {
      throw new Error(`Error al firmar URL del PNG: ${pngSignError?.message}`);
    }

    // 3. Actualizar tabla a 'uploaded'
    const { error: updateError } = await (supabase
      .from('certificates') as any)
      .update({
        status: 'uploaded',
        certificate_pdf_url: pdfSignedData.signedUrl,
        certificate_png_url: pngSignedData.signedUrl,
        uploaded_at: new Date().toISOString()
      })
      .eq('id', cert.id);

    if (updateError) {
      throw new Error(`Error al actualizar estado del certificado: ${updateError.message}`);
    }

    // 4. Llamar a la API de entrega (/api/certificates/deliver) para procesar el envío del correo electrónico al cliente
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://todaslasmascotasvanalcielo.com';
    const deliverRes = await fetch(`${baseUrl}/api/certificates/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (!deliverRes.ok) {
      const deliverErr = await deliverRes.json();
      throw new Error(`Error al enviar el certificado al cliente: ${deliverErr.error || 'Desconocido'}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('❌ Error general en la subida del certificado:', err);
    const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}
