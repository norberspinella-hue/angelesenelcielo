import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('photo') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se recibió ninguna foto' },
        { status: 400 }
      )
    }

    // Validar tamaño máximo 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La foto no puede superar 20MB' },
        { status: 400 }
      )
    }

    // Validar formato (HEIC/HEIF eliminado del MVP)
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no permitido. Usa JPG, PNG o WebP' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const timestamp = Date.now()
    const fileExt = file.type === 'image/png' ? 'png' : 'jpg'
    
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // ── ORIGINAL (para certificado A4) ──
    const originalBuffer = await sharp(buffer)
      .rotate() // Auto-rotar según EXIF
      .jpeg({ quality: 90 })
      .toBuffer()

    const originalPath = `pets/original/${timestamp}.${fileExt}`
    const { error: originalError } = await supabase.storage
      .from('pet-photos')
      .upload(originalPath, originalBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (originalError) throw originalError

    // ── THUMBNAIL (para el mural canvas) ──
    const thumbnailBuffer = await sharp(buffer)
      .rotate() // Auto-rotar según EXIF
      .resize(120, 120, { 
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: 85 })
      .toBuffer()

    const thumbnailPath = `pets/thumbnails/${timestamp}.webp`
    const { error: thumbnailError } = await supabase.storage
      .from('pet-photos')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (thumbnailError) throw thumbnailError

    // Obtener URLs públicas
    const { data: originalUrl } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(originalPath)

    const { data: thumbnailUrl } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(thumbnailPath)

    return NextResponse.json({
      success: true,
      originalUrl: originalUrl.publicUrl,
      thumbnailUrl: thumbnailUrl.publicUrl,
    })

  } catch (error) {
    console.error('Error procesando foto:', error)
    return NextResponse.json(
      { error: 'Error al procesar la foto' },
      { status: 500 }
    )
  }
}
