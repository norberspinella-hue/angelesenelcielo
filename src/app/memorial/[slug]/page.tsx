import { Suspense } from 'react'
import MemorialClient from './MemorialClient'

export default function MemorialPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #f5e8ff, #ffe8f0)',
        fontFamily: 'Georgia, serif',
        fontSize: 22,
        color: '#4A3F6B',
      }}>
        Cargando recuerdo... ✨
      </div>
    }>
      <MemorialClient slug={params.slug} />
    </Suspense>
  )
}
