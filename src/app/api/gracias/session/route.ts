import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID requerido' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada en Stripe' },
        { status: 404 }
      )
    }

    const { plan, slotId, petName, email, photoUrl, thumbnailUrl, petDate, species, breed, birthDate, location, dedication } = session.metadata || {}

    const supabase = createAdminClient()

    const isBlockFree = async (
      startX: number,
      startY: number, 
      size: number
    ): Promise<boolean> => {
      const { data } = await (supabase
        .from('mural_slots') as any)
        .select('status')
        .gte('x', startX)
        .lt('x', startX + size)
        .gte('y', startY)
        .lt('y', startY + size)
      
      if (data && data.some((s: any) => s.status === 'occupied')) {
        return false
      }
      return true
    }

    // Verificar si ya existe un memorial para esta sesión
    const { data: existingMemorial } = await (supabase
      .from('memorials') as any)
      .select('id, slot_assigned')
      .eq('stripe_session_id', sessionId)
      .maybeSingle()

    let finalSlotId = existingMemorial?.slot_assigned || slotId || ''

    if (!existingMemorial && petName && email) {
      console.log('Creando memorial desde la página de gracias (fallback local/webhook)...')
      
      const planMapping: Record<string, string> = {
        'huellita': 'recuerdo_inicial',
        'estrella_brillante': 'estrella_anual',
        'corazon_eterno': 'recuerdo_eterno',
      }
      const planDb = planMapping[plan || ''] ?? 'recuerdo_inicial'
      const orderId = `AEC-${Date.now()}`
      const uploadToken = crypto.randomUUID()

      let finalX: number | null = null
      let finalY: number | null = null
      let slotAssignedStr = ''

      if (slotId && slotId !== 'auto') {
        const [xStr, yStr] = slotId.split(',')
        const xVal = parseInt(xStr)
        const yVal = parseInt(yStr)

        if (!isNaN(xVal) && !isNaN(yVal)) {
          finalX = xVal
          finalY = yVal

          const planSize = planDb === 'recuerdo_eterno' ? 3 :
                           planDb === 'estrella_anual' ? 2 : 1

          // Verificar si el bloque completo está libre
          const blockFree = await isBlockFree(xVal, yVal, planSize)

          if (!blockFree) {
            console.log(`Bloque (${xVal}, ${yVal}) de tamaño ${planSize}x${planSize} ocupado en fallback, buscando alternativo...`)
            
            let found = false
            for (let radius = 1; radius <= 50 && !found; radius++) {
              const candidates = []
              for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                  if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                    candidates.push({ 
                      x: xVal + dx, 
                      y: yVal + dy,
                      dist: Math.sqrt(dx*dx + dy*dy)
                    })
                  }
                }
              }
              candidates.sort((a, b) => a.dist - b.dist)
              
              for (const candidate of candidates) {
                if (candidate.x < 0 || candidate.y < 0) continue
                const free = await isBlockFree(candidate.x, candidate.y, planSize)
                if (free) {
                  finalX = candidate.x
                  finalY = candidate.y
                  found = true
                  console.log(`Bloque alternativo asignado en fallback: (${finalX}, ${finalY}) de tamaño ${planSize}x${planSize}`)
                  break
                }
              }
            }
          }

          slotAssignedStr = `${finalX},${finalY}`
        }
      }

      try {
        // 1. Guardar en tabla memorials
        const { data: memorial, error: memorialError } = await (supabase
          .from('memorials') as any)
          .insert({
            stripe_session_id: sessionId,
            stripe_payment_intent_id: session.payment_intent as string,
            payment_status: 'paid',
            price_paid: (session.amount_total ?? 0) / 100,
            plan_type: planDb,
            email: email,
            pet_name: petName,
            species: (species || 'otro') as any,
            breed: breed || '',
            birth_date: birthDate || null,
            location: location || '',
            photo_url: photoUrl || '',
            death_date: petDate || new Date().toISOString().split('T')[0],
            slots_count: plan === 'corazon_eterno' ? 9 : plan === 'estrella_brillante' ? 4 : 1,
            profile_slug: `${petName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
            visibility: 'public',
            publication_status: 'published',
            moderation_status: 'approved',
            dedication: dedication || '',
            slot_assigned: slotAssignedStr,
          })
          .select()
          .single()

        if (memorialError) {
          console.error('Error guardando memorial en fallback:', memorialError)
        } else if (memorial) {
          console.log('Memorial guardado en fallback:', memorial.id)
          finalSlotId = slotAssignedStr

          // 2. Registrar/actualizar los slots en mural_slots
          if (finalX !== null && finalY !== null) {
            const size = plan === 'corazon_eterno' ? 3 : plan === 'estrella_brillante' ? 2 : 1
            const slotsToUpsert = []

            for (let dx = 0; dx < size; dx++) {
              for (let dy = 0; dy < size; dy++) {
                slotsToUpsert.push({
                  x: finalX + dx,
                  y: finalY + dy,
                  status: 'occupied',
                  memorial_id: memorial.id,
                  plan_type: planDb,
                  thumbnail_url: thumbnailUrl || '',
                })
              }
            }

            const { error: slotError } = await (supabase
              .from('mural_slots') as any)
              .upsert(slotsToUpsert, { onConflict: 'x,y' })

            if (slotError) {
              console.error('Error actualizando slots en fallback:', slotError)
            } else {
              console.log(`Slots de tamaño ${size}x${size} registrados/actualizados en fallback en (${finalX}, ${finalY})`)
            }
          }

          // 3. Crear registro en certificates
          const { error: certError } = await (supabase
            .from('certificates') as any)
            .insert({
              order_id: orderId,
              user_email: email,
              pet_name: petName,
              plan: planDb,
              upload_token: uploadToken,
              status: 'pending',
              pet_photo_url: photoUrl || '',
            })

          if (certError) {
            console.error('Error creando certificado en fallback:', certError)
          } else {
            console.log('Certificado pendiente creado en fallback:', orderId)
          }
        }
      } catch (err) {
        console.error('Error procesando fallback de creación:', err)
      }
    }

    return NextResponse.json({
      petName: session.metadata?.petName || 'Tu ángel',
      petDate: session.metadata?.petDate || '',
      plan: session.metadata?.plan || '',
      email: session.metadata?.email || '',
      photoUrl: session.metadata?.photoUrl || '',
      thumbnailUrl: session.metadata?.thumbnailUrl || '',
      species: session.metadata?.species || '',
      breed: session.metadata?.breed || '',
      birthDate: session.metadata?.birthDate || '',
      location: session.metadata?.location || '',
      slotId: finalSlotId,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Sesión no encontrada' },
      { status: 404 }
    )
  }
}
