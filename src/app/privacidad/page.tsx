import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div style={{
      maxWidth: 840,
      margin: '0 auto',
      padding: '80px 24px',
      fontFamily: 'Georgia, serif',
      color: '#4A3F6B',
      lineHeight: 1.8,
    }}>
      <div style={{ marginBottom: 40, borderBottom: '1px solid rgba(180, 150, 220, 0.25)', paddingBottom: 24 }}>
        <Link href="/" style={{ color: '#7B6F9A', textDecoration: 'none', fontSize: 14, fontFamily: 'sans-serif' }}>
          ← Volver a Ángeles en el Cielo
        </Link>
        <h1 style={{ fontSize: 36, color: '#1E2A78', marginTop: 16, marginBottom: 8 }}>
          🔒 Política de Privacidad y Protección de Datos
        </h1>
        <p style={{ color: '#9B8FB0', margin: 0, fontFamily: 'sans-serif', fontSize: 14 }}>
          Última actualización: octubre 2026 · Adaptada al Reglamento General de Protección de Datos (RGPD UE 2016/679) y LOPDGDD 3/2018
        </p>
      </div>

      <div style={{
        background: 'rgba(245,240,255,0.60)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        fontFamily: 'sans-serif',
        border: '1px solid rgba(180, 150, 220, 0.3)',
      }}>
        <h3 style={{ color: '#1E2A78', margin: '0 0 12px 0', fontSize: 16, fontWeight: 700 }}>
          Responsable del Tratamiento
        </h3>
        <p style={{ color: '#7B6F9A', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
          <strong>Denominación:</strong> Ángeles en el Cielo (todaslasmascotasvanalcielo.com)<br />
          <strong>Email de atención de Privacidad:</strong>{' '}
          <a href="mailto:privacidad@todaslasmascotasvanalcielo.com" style={{ color: '#F65F8F', fontWeight: 600 }}>
            privacidad@todaslasmascotasvanalcielo.com
          </a><br />
          <strong>Contacto general:</strong>{' '}
          <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#F65F8F', fontWeight: 600 }}>
            hello@todaslasmascotasvanalcielo.com
          </a>
        </p>
      </div>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>1. Datos que Recopilamos y Finalidad</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Tratamos los datos estrictamente necesarios para prestar el servicio del memorial conmemorativo:
      </p>
      <ul style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, paddingLeft: 20, fontSize: 14 }}>
        <li style={{ marginBottom: 8 }}>
          <strong>Dirección de correo electrónico:</strong> Para enviarte el comprobante de compra, enlace a tu espacio en el mural, entrega de certificados y avisos del estado de tu memorial o nuevos vecinos cercanos (con opción de baja en 1 clic).
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Datos del memorial de la mascota:</strong> Nombre, especie, raza, fechas de nacimiento/despedida, ubicación opcional y dedicatoria para su publicación en el mural público.
        </li>
        <li style={{ marginBottom: 0 }}>
          <strong>Fotografía de la mascota:</strong> Imagen proporcionada para su colocación en el mosaico celestial y en la tarjeta del memorial.
        </li>
      </ul>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>2. Moderación Automatizada con Google Cloud Vision API</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Con el único propósito de salvaguardar el respeto, la solemnidad y la seguridad de la comunidad frente a imágenes no deseadas, violentas o inapropiadas:
      </p>
      <div style={{
        background: '#FFF8F4',
        border: '1px solid #F8C7D8',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        fontFamily: 'sans-serif',
        fontSize: 14,
        color: '#4A3F6B',
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Subencargado Google Cloud Vision (Google LLC):</strong> Las fotografías subidas se someten a un escaneo algorítmico automatizado a través de la API segura de Google Cloud Vision. Este análisis se realiza en tránsito de forma cifrada para clasificar la adecuación del contenido (detección de contenido para adultos, violencia o imágenes que no contengan animales).
        </p>
        <p style={{ margin: 0 }}>
          Google actúa estrictamente como encargado de tratamiento técnico: <strong>Google no almacena permanentemente las imágenes, no las indexa públicamente ni las utiliza para entrenar modelos publicitarios comerciales ni perfiles de usuario</strong>, cumpliendo con las Cláusulas Contractuales Tipo de la Unión Europea y estándares ISO/IEC 27001.
        </p>
      </div>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>3. Difusión Opcional en Redes Sociales</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, fontSize: 14 }}>
        Al crear un memorial, el usuario puede marcar voluntariamente la casilla opcional para autorizar a Ángeles en el Cielo a compartir la fotografía y dedicatoria de su mascota en nuestras redes sociales oficiales (Instagram: <code>@angeles_en_el_cielo_</code>, TikTok: <code>@angeles_en_elcielo</code> y Facebook). <strong>Esta autorización es 100% voluntaria</strong>. Si el usuario no la marca, su memorial solo será visible en el mural interactivo de la web y nunca será compartido en redes sociales externas. El usuario puede revocar este permiso en cualquier momento escribiendo a nuestro buzón.
      </p>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>4. Otros Encargados del Tratamiento y Seguridad</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Colaboramos con proveedores de primer nivel que cumplen estrictamente con la normativa europea:
      </p>
      <ul style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, paddingLeft: 20, fontSize: 14 }}>
        <li style={{ marginBottom: 8 }}>
          <strong>Stripe Payments Europe, Ltd.:</strong> Procesador de pagos certificado PCI-DSS Nivel 1. Ángeles en el Cielo nunca almacena ni tiene acceso a números de tarjetas bancarias.
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Supabase Inc.:</strong> Base de datos y almacenamiento de fotografías, alojado en centros de datos con altos estándares de seguridad en la Unión Europea.
        </li>
        <li style={{ marginBottom: 0 }}>
          <strong>Resend Inc.:</strong> Envío de correos transaccionales de confirmación y certificados, con servidores seguros y enlaces directos de desuscripción.
        </li>
      </ul>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>5. Tus Derechos (Acceso, Rectificación, Supresión)</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, fontSize: 14 }}>
        Tienes derecho a acceder a tus datos personales, solicitar la rectificación de información inexacta, solicitar la eliminación del memorial (derecho al olvido), limitar u oponerte a su tratamiento. Para ejercer cualquiera de estos derechos, basta con enviar un email a{' '}
        <a href="mailto:privacidad@todaslasmascotasvanalcielo.com" style={{ color: '#F65F8F', fontWeight: 600 }}>
          privacidad@todaslasmascotasvanalcielo.com
        </a>{' '}
        indicando tu dirección de correo y el nombre de tu mascota. Responderemos en un plazo máximo de 30 días. Asimismo, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: '#7B6F9A' }}>aepd.es</a>).
      </p>
    </div>
  );
}
