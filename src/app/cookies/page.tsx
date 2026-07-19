export default function CookiesPage() {
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
        🍪 Política de Cookies
      </h1>
      <p style={{ color: '#9B8FB0', marginBottom: 40, fontFamily: 'sans-serif' }}>
        Última actualización: julio 2025
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>¿Qué son las cookies?</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Las cookies son pequeños archivos de texto que se almacenan en tu 
        dispositivo cuando visitas un sitio web. Nos ayudan a recordar tus 
        preferencias y a mejorar tu experiencia.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>¿Qué cookies usamos?</h2>
      
      <div style={{
        background: 'rgba(245,240,255,0.60)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        fontFamily: 'sans-serif',
      }}>
        <h3 style={{ color: '#EC6F9B', marginBottom: 12 }}>
          ✅ Cookies necesarias
        </h3>
        <p style={{ color: '#7B6F9A', marginBottom: 12 }}>
          Son imprescindibles para el funcionamiento del sitio. 
          No se pueden desactivar.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(180,150,220,0.30)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#4A3F6B' }}>Cookie</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#4A3F6B' }}>Proveedor</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#4A3F6B' }}>Finalidad</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: '__stripe_mid', provider: 'Stripe', purpose: 'Proceso de pago seguro' },
              { name: '__stripe_sid', provider: 'Stripe', purpose: 'Sesión de pago' },
              { name: 'sb-access-token', provider: 'Supabase', purpose: 'Autenticación de usuario' },
              { name: 'cookie-consent', provider: 'Propia', purpose: 'Guardar tus preferencias de cookies' },
            ].map((cookie, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(180,150,220,0.15)' }}>
                <td style={{ padding: '8px 0', color: '#4A3F6B', fontWeight: 600 }}>{cookie.name}</td>
                <td style={{ padding: '8px 0', color: '#7B6F9A' }}>{cookie.provider}</td>
                <td style={{ padding: '8px 0', color: '#7B6F9A' }}>{cookie.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        background: 'rgba(245,240,255,0.60)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        fontFamily: 'sans-serif',
      }}>
        <h3 style={{ color: '#EC6F9B', marginBottom: 12 }}>
          📊 Cookies de analítica
        </h3>
        <p style={{ color: '#7B6F9A' }}>
          Usamos Plausible Analytics, que NO utiliza cookies ni 
          rastrea datos personales. Es una alternativa respetuosa 
          con la privacidad al 100% conforme con el RGPD.
        </p>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>¿Cómo gestionar las cookies?</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Puedes configurar tu navegador para rechazar cookies o 
        eliminarlas en cualquier momento. Ten en cuenta que 
        desactivar las cookies necesarias puede afectar al 
        funcionamiento del sitio, especialmente al proceso de pago.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Contacto</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A' }}>
        Si tienes preguntas sobre nuestra política de cookies, 
        escríbenos a{' '}
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" 
           style={{ color: '#EC6F9B' }}>
          hello@todaslasmascotasvanalcielo.com
        </a>
      </p>
    </div>
  )
}
