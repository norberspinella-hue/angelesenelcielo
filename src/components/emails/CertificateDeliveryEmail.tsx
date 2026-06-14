import * as React from 'react';

interface CertificateDeliveryEmailProps {
  petName: string;
  pdfUrl: string;
  pngUrl: string;
  profileUrl: string;
}

export const CertificateDeliveryEmail = ({
  petName,
  pdfUrl,
  pngUrl,
  profileUrl,
}: CertificateDeliveryEmailProps) => {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#4B3217',
      backgroundColor: '#FFF8F4',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      borderRadius: '24px',
      border: '1px solid #EED8C5'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '48px' }}>🎁</span>
      </div>

      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1E2A78',
        textAlign: 'center',
        margin: '0 0 16px'
      }}>
        ¡El certificado de {petName} ya está listo! 🎉
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Hola,
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Tu certificado personalizado ya ha sido elaborado por nuestro equipo de diseño.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px' }}>
        <strong>{petName}</strong> tiene ahora su lugar eterno en el <strong>Mural de Ángeles en el Cielo</strong>.
      </p>

      {/* Botones de acción */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a 
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            backgroundColor: '#1E2A78',
            color: '#FFFFFF',
            padding: '14px 24px',
            borderRadius: '9999px',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(30, 42, 120, 0.15)'
          }}
        >
          📄 DESCARGAR CERTIFICADO PDF (A4 Imprimible)
        </a>

        <a 
          href={pngUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            backgroundColor: '#FFF0D4',
            color: '#8A6033',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '15px',
            fontWeight: 'bold',
            textDecoration: 'none',
            marginBottom: '16px',
            border: '1px solid #F3DBB4'
          }}
        >
          ✨ DESCARGAR CERTIFICADO PNG (Para Redes)
        </a>

        {profileUrl && (
          <a 
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              color: '#1E2A78',
              textDecoration: 'underline',
              fontSize: '15px',
              fontWeight: 'medium',
              marginTop: '20px'
            }}
          >
            🐾 Ver el perfil de {petName} en el Mural
          </a>
        )}
      </div>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '24px 0 16px', color: '#706A95' }}>
        Comparte su historia en redes sociales para que tus seres queridos puedan visitar su espacio en el cielo y recordar el amor que dejó en tu corazón.
      </p>

      <div style={{
        borderTop: '1px solid #EED8C5',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#706A95'
      }}>
        <p style={{ margin: '0 0 4px' }}>Con cariño,</p>
        <strong>El equipo de Ángeles en el Cielo</strong>
      </div>
    </div>
  );
};

export default CertificateDeliveryEmail;
