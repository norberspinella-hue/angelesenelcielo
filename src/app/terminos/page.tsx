export default function TerminosPage() {
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
        📜 Términos y Condiciones de Uso
      </h1>
      <p style={{ color: '#9B8FB0', marginBottom: 40, fontFamily: 'sans-serif' }}>
        Última actualización: julio 2026
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>El Servicio</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Ángeles en el Cielo ofrece un servicio de memorial digital para mascotas en un mural interactivo online. A través de este servicio, el usuario puede reservar uno o varios espacios (slots) en la cuadrícula del cielo para colocar la foto y la historia de su mascota.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Planes y Tarifas</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Ofrecemos tres tipos de planes para adaptarnos a las necesidades de cada usuario:
      </p>

      <div style={{
        background: 'rgba(245,240,255,0.60)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        fontFamily: 'sans-serif',
      }}>
        <ul style={{ color: '#4A3F6B', margin: 0, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Huellita (1,99 € / año):</strong> Ocupa 1 slot en la cuadrícula. Se renueva anualmente.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Estrella Brillante (4,99 €):</strong> Ocupa un espacio de 4 slots (2x2). Pago único para siempre.
          </li>
          <li style={{ marginBottom: 0 }}>
            <strong>Corazón Eterno (9,99 €):</strong> Ocupa un espacio de 9 slots (3x3) en la zona destacada del mural. Pago único para siempre.
          </li>
        </ul>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Responsabilidad del Contenido</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        El usuario es el único responsable de la imagen y los textos que sube a la plataforma. Está estrictamente prohibido subir fotos que no correspondan a mascotas, o contenido ofensivo, violento, pornográfico o inapropiado.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Moderación y Retirada de Contenido</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Nos reservamos el derecho de moderar, ocultar o eliminar cualquier memorial que incumpla las reglas de contenido establecidas en estos términos, sin derecho a reembolso, con el fin de preservar la armonía y el respeto del espacio conmemorativo.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Ley Aplicable y Jurisdicción</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Estos términos se rigen por la legislación española. Cualquier controversia relacionada con el servicio se resolverá ante los juzgados y tribunales de la ciudad correspondiente al titular.
      </p>

      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Contacto</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A' }}>
        Para cualquier duda o reclamación relacionada con las condiciones de servicio, puedes escribirnos a{' '}
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#EC6F9B' }}>
          hello@todaslasmascotasvanalcielo.com
        </a>.
      </p>
    </div>
  )
}
