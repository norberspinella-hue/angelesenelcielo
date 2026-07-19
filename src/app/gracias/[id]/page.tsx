import { Suspense } from 'react'
import GraciasClient from './GraciasClient'

export default function GraciasPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <GraciasClient sessionId={params.id} />
    </Suspense>
  )
}
