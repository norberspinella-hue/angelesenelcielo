import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Token requerido' }, 
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('upload_token', token)
    .eq('status', 'pending')
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Token no válido o certificado no encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json({ certificate: data })
}
