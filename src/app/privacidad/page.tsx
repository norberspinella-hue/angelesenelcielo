export default function PrivacidadPage() {
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
        🔒 Política de Privacidad
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
          Responsable del Tratamiento
        </h3>
        <p style={{ color: '#7B6F9A', margin: 0 }}>
          <strong>Titular:</strong> Ángeles en el Cielo<br />
          <strong>Web:</strong> todaslasmascotasvanalcielo.com<br />
          <strong>Email de contacto:</strong>{' '}
          <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#EC6F9B' }}>
            hello@todaslasmascotasvanalcielo.com
          </a>
        </p>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>¿Qué datos recogemos?</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Recogemos únicamente la información necesaria para prestar el servicio del memorial digital:
      </p>
      <ul style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, paddingLeft: 20 }}>
        <li>Dirección de correo electrónico (para notificaciones, certificados y gestión).</li>
        <li>Nombre de la mascota.</li>
        <li>Fotografía de la mascota.</li>
        <li>Detalles del memorial (fecha de fallecimiento, fecha de nacimiento, especie, raza y ubicación opcional).</li>
      </ul>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Finalidad del Tratamiento</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Los datos se recopilan y tratan con la finalidad exclusiva de gestionar el memorial digital de tu mascota en nuestro mural global, así como para la generación y envío del certificado de recuerdo.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Base Legal y Conservación</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        La base legal para el tratamiento de tus datos es el <strong>consentimiento del usuario</strong> otorgado al registrar el memorial y realizar el pago. Conservaremos los datos mientras el memorial permanezca activo en el sitio web o hasta que solicites su eliminación.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Seguridad y Proveedores</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Nuestra base de datos está alojada de forma segura en <strong>Supabase</strong> dentro de servidores ubicados en la Unión Europea. Los pagos se procesan de forma externa y segura a través de <strong>Stripe</strong>. Nosotros no almacenamos ni tenemos acceso a tus datos bancarios ni de tarjeta de crédito.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Tus Derechos</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad enviando un correo electrónico a{' '}
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#EC6F9B' }}>
          hello@todaslasmascotasvanalcielo.com
        </a>.
      </p>
    </div>
  )
}
