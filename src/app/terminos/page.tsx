import Link from 'next/link';

export default function TerminosPage() {
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
          📜 Términos y Condiciones de Uso y Contratación
        </h1>
        <p style={{ color: '#9B8FB0', margin: 0, fontFamily: 'sans-serif', fontSize: 14 }}>
          Última actualización: octubre 2026 · Conforme a la legislación española y europea (TRLGDCU y RGPD)
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
        <h3 style={{ color: '#1E2A78', margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>
          Resumen para Familias (Transparencia en 1 minuto)
        </h3>
        <p style={{ color: '#7B6F9A', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
          Ángeles en el Cielo es un memorial digital interactivo. Al encender la estrella de tu mascota, su recuerdo se publica en el mural de forma permanente. Todos los precios incluyen IVA (21%). El servicio se activa de inmediato tras el pago. Si alguna vez experimentas un problema técnico o error en tus datos, nuestro equipo lo resolverá en menos de 48h.
        </p>
      </div>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>1. Objeto y Descripción del Servicio</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24 }}>
        Ángeles en el Cielo (accesible a través de <strong>todaslasmascotasvanalcielo.com</strong>) proporciona un servicio conmemorativo digital que permite a los usuarios reservar uno o varios espacios (<em>slots</em>) en una cuadrícula infinita interactiva en memoria de sus mascotas fallecidas, con tarjeta conmemorativa, foto, dedicatoria y emisión de un Certificado Digital Oficial de recuerdo.
      </p>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>2. Precios e Impuestos (IVA Incluido)</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Todos los precios indicados en el sitio web son <strong>precios finales completos e incluyen el Impuesto sobre el Valor Añadido (IVA del 21% aplicable en España</strong> o el gravamen correspondiente según el país de residencia del consumidor dentro de la Unión Europea).
      </p>

      <div style={{
        background: '#FFF8F4',
        border: '1px solid #F8C7D8',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        fontFamily: 'sans-serif',
      }}>
        <ul style={{ color: '#4A3F6B', margin: 0, paddingLeft: 20, fontSize: 14 }}>
          <li style={{ marginBottom: 10 }}>
            <strong>Plan Huellita (1,99 € IVA incl.):</strong> Reserva 1 casilla en el cielo para la foto, nombre y fecha de la mascota. Pago único.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Plan Estrella Brillante (4,99 € IVA incl.):</strong> Reserva un espacio ampliado de 4 casillas (2×2), tarjeta conmemorativa y dedicatoria. Pago único.
          </li>
          <li style={{ marginBottom: 0 }}>
            <strong>Plan Corazón Eterno (9,99 € IVA incl.):</strong> Reserva destacada de 9 casillas (3×3) en la Zona de Ángeles Fundadores (centro del cielo), insignia dorada y máxima visibilidad. Pago único.
          </li>
        </ul>
      </div>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>3. Política de Desistimiento y Devoluciones</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        De conformidad con el <strong>artículo 103, letra m) del Real Decreto Legislativo 1/2007</strong> (Ley General para la Defensa de los Consumidores y Usuarios) y la <strong>Directiva Europea 2011/83/UE</strong>:
      </p>
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        borderLeft: '4px solid #F65F8F',
        padding: '16px 20px',
        marginBottom: 20,
        fontFamily: 'sans-serif',
        fontSize: 14,
        color: '#4A3F6B',
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Excepción al derecho de desistimiento por ejecución inmediata:</strong> Al tratarse del suministro de contenido y servicios digitales personalizados sin soporte material, cuya ejecución y asignación de coordenadas en el mural comienza inmediatamente tras la confirmación de la compra, el usuario presta su consentimiento previo expreso para que el servicio dé comienzo de inmediato y reconoce perder su derecho de desistimiento una vez el memorial ha sido generado y publicado.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Compromiso y Garantía de Corrección:</strong> A pesar de la excepción legal anterior, si detectas cualquier error tipográfico, deseas actualizar la fotografía de tu mascota o experimentas cualquier incidencia técnica en los primeros <strong>14 días</strong> tras tu compra, contacta con nosotros en <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#F65F8F', fontWeight: 600 }}>hello@todaslasmascotasvanalcielo.com</a> y lo subsanaremos de inmediato de forma totalmente gratuita o, en caso de no ser posible por fallo técnico, procederemos al reembolso íntegro.
        </p>
      </div>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>4. Compromiso de Perpetuidad: ¿Qué ocurre si el proyecto cesa en el futuro?</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Una de las mayores preocupaciones legítimas de las familias al rendir homenaje a un ser querido es la permanencia del recuerdo en el tiempo. Ángeles en el Cielo asume el siguiente compromiso formal:
      </p>
      <ul style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, paddingLeft: 20, fontSize: 14 }}>
        <li style={{ marginBottom: 10 }}>
          <strong>Arquitectura autosuficiente:</strong> La plataforma está diseñada sobre infraestructura serverless de bajísimo coste de mantenimiento, permitiendo garantizar que los memoriales permanezcan activos sin requerir pagos recurrentes a las familias.
        </li>
        <li style={{ marginBottom: 10 }}>
          <strong>Custodia y Certificado Digital:</strong> Cada familia recibe y conserva de por vida el Certificado Oficial emitido en PDF y la ficha conmemorativa descargable en alta resolución, asegurando que el homenaje es propiedad inalienable de la familia con independencia de internet.
        </li>
        <li style={{ marginBottom: 0 }}>
          <strong>Cláusula de Continuidad y Archivo Histórico:</strong> En el hipotético e imprevisto caso de que el proyecto debiera cesar sus operaciones en un futuro lejano, Ángeles en el Cielo se compromete formalmente a: (i) preavisar por correo electrónico a todos los usuarios con al menos <strong>6 meses de antelación</strong>; (ii) habilitar una herramienta de descarga íntegra en alta resolución del memorial y sus dedicatorias; y (iii) ofrecer el traspaso del archivo del mural a una fundación o entidad sin ánimo de lucro de protección animal o archivo digital abierto (como <em>Internet Archive</em>) para garantizar que ninguna historia se pierda.
        </li>
      </ul>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>5. Moderación de Contenido y Subencargado de Visión Artificial</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 16 }}>
        Para garantizar la serenidad, respeto y dignidad de todos los memoriales:
      </p>
      <ul style={{ fontFamily: 'sans-serif', color: '#7B6F9A', marginBottom: 24, paddingLeft: 20, fontSize: 14 }}>
        <li style={{ marginBottom: 10 }}>
          Está terminantemente prohibido subir fotografías o textos de contenido sexual, violento, racista, difamatorio, comercial o ajeno a la temática de homenaje a animales de compañía.
        </li>
        <li style={{ marginBottom: 0 }}>
          Las imágenes son sometidas a un filtrado automático preventivo a través de la API de <strong>Google Cloud Vision (Google LLC)</strong>, que actúa como encargado del tratamiento para verificar que las fotos sean aptas y correspondan a mascotas, sin que Google emplee dichas imágenes para fines propios.
        </li>
      </ul>

      <h2 style={{ fontSize: 22, color: '#1E2A78', marginBottom: 12 }}>6. Contacto y Resolución de Conflictos</h2>
      <p style={{ fontFamily: 'sans-serif', color: '#7B6F9A', fontSize: 14 }}>
        Para cualquier duda, solicitud o rectificación respecto a las presentes condiciones, puedes ponerte en contacto en{' '}
        <a href="mailto:hello@todaslasmascotasvanalcielo.com" style={{ color: '#F65F8F', fontWeight: 600 }}>
          hello@todaslasmascotasvanalcielo.com
        </a>. Conforme al Art. 14.1 del Reglamento (UE) 524/2013, la Comisión Europea facilita una plataforma de resolución de litigios en línea en <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#7B6F9A' }}>ec.europa.eu/consumers/odr</a>.
      </p>
    </div>
  );
}
