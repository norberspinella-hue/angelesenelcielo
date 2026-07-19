'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function UploadCertificateClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [certificate, setCertificate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pngFile, setPngFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token no válido')
      setLoading(false)
      return
    }
    loadCertificate()
  }, [token])

  const loadCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/verify-token?token=${token}`)
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }
      
      setCertificate(data.certificate)
      setLoading(false)
    } catch (err) {
      console.error('Error cargando certificado:', err)
      setError('Error de red o conexión al validar el token')
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!pdfFile || !pngFile || !certificate) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('token', token!)
      formData.append('pdf', pdfFile)
      formData.append('png', pngFile)

      const response = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el certificado')
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Error subiendo certificado:', err)
      setError(err.message || 'Error al subir los archivos. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <p style={styles.text}>Verificando token...</p>
    </div>
  )

  if (error) return (
    <div style={styles.container}>
      <p style={styles.error}>{error}</p>
    </div>
  )

  if (success) return (
    <div style={styles.container}>
      <h1 style={styles.title}>✅ Certificado subido correctamente</h1>
      <p style={styles.text}>
        El usuario recibirá un email con su certificado automáticamente.
      </p>
    </div>
  )

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Subir certificado</h1>
      
      <div style={styles.card}>
        <p style={styles.label}>Mascota: 
          <strong> {certificate.pet_name}</strong>
        </p>
        <p style={styles.label}>Plan: 
          <strong> {certificate.plan}</strong>
        </p>
        <p style={styles.label}>Email cliente: 
          <strong> {certificate.user_email}</strong>
        </p>
        <p style={styles.label}>Order ID: 
          <strong> {certificate.order_id}</strong>
        </p>
      </div>

      <div style={styles.uploadSection}>
        <div style={styles.uploadField}>
          <label style={styles.label}>PDF del certificado:</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            style={styles.input}
          />
        </div>

        <div style={styles.uploadField}>
          <label style={styles.label}>PNG para redes sociales:</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => setPngFile(e.target.files?.[0] || null)}
            style={styles.input}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!pdfFile || !pngFile || uploading}
          style={{
            ...styles.button,
            opacity: (!pdfFile || !pngFile || uploading) ? 0.5 : 1,
          }}
        >
          {uploading ? 'Subiendo...' : '✦ Subir certificado'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #ffe8f0 0%, #f5e8ff 50%, #ffe8d8 100%)',
    padding: '40px 20px',
    fontFamily: 'Georgia, serif',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#4A3F6B',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  card: {
    background: 'rgba(255,255,255,0.80)',
    borderRadius: 16,
    padding: '24px 32px',
    marginBottom: 32,
    width: '100%',
    maxWidth: 480,
    border: '1px solid rgba(180,150,220,0.30)',
  },
  uploadSection: {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  uploadField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#4A3F6B',
    marginBottom: 8,
    display: 'block',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid rgba(180,150,220,0.40)',
    fontSize: 14,
    background: 'rgba(255,255,255,0.80)',
  },
  button: {
    padding: '14px 28px',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(90deg, #ff82ad, #ec5f96)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(236,95,150,0.35)',
  },
  text: {
    fontSize: 16,
    color: '#7B6F9A',
    textAlign: 'center' as const,
  },
  error: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center' as const,
  },
}
