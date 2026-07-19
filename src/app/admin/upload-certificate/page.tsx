import { Suspense } from 'react'
import UploadCertificateClient from './UploadCertificateClient'

export default function UploadCertificatePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UploadCertificateClient />
    </Suspense>
  )
}
