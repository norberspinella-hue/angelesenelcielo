export default function AvisoLegalPage() {
  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '80px 40px',
      fontFamily: 'Georgia, serif',
      color: '#4A3F6B',
      lineHeight: 1.8,
    }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>
        ⚖️ Aviso Legal
      </h1>
      <p style={{ color: '#9B8FB0', marginBottom: 40, fontFamily: 'sans-serif' }}>
        Última actualización: julio 2026
      </p>

      <div style={{
        background: 'rgba(245,240,255,0.60)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        fontFamily: 'sans-serif',
      }}>
        <h3 style={{ color: '#EC6F9B', marginBottom: 12 }}>
          Datos Identificativos
        </h3>
        <p style={{ color: '#7B6F9A', margin: 0 }}>
          <strong>Denominación social:</strong> Ángeles en el Cielo<br />
          <strong>Sitio Web:</strong> todaslasmascotasvanalcielo.com<br />
          <strong>Email de contacto:</strong>{' '}
          <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#EC6F9B' }}>
            hello@todaslasmascotasvanalcielo.com
          </a>
        </p>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Propiedad Intelectual e Industrial</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Todos los contenidos de este sitio web, incluyendo textos, diseños gráficos, códigos fuente, logotipos, iconos, nombres comerciales e imágenes, son propiedad exclusiva de Ángeles en el Cielo o de sus legítimos licenciantes, estando protegidos por las leyes de propiedad intelectual e industrial vigentes.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Condiciones de Acceso y Uso</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación total y sin reservas de todas las disposiciones incluidas en este Aviso Legal, así como de nuestra Política de Privacidad y Términos de Servicio. El usuario se compromete a hacer un uso lícito del portal de conformidad con la ley y el orden público.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Exclusión de Responsabilidad</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Ángeles en el Cielo no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la falta de disponibilidad del portal, de la transmisión de virus o programas dañinos en los contenidos (a pesar de adoptar medidas tecnológicas preventivas), o de los contenidos vertidos por los usuarios en las descripciones de las mascotas.
      </p>
    </div>
  )
}
