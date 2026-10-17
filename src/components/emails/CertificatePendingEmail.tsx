import * as React from 'react';

interface CertificatePendingEmailProps {
  petName: string;
  planLabel: string;
  plan?: string;
}

export const CertificatePendingEmail = ({
  petName,
  planLabel,
  plan,
}: CertificatePendingEmailProps) => {
  const isVinculoInfinito = plan === 'vinculo_infinito' || planLabel.toLowerCase().includes('infinito');

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
        <span style={{ fontSize: '48px' }}>🐾</span>
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1E2A78',
        textAlign: 'center',
        margin: '0 0 16px'
      }}>
        ✨ El certificado de {petName} está en camino
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Hola,
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Estamos creando con mucho amor el <strong>Certificado {planLabel}</strong> de <strong>{petName}</strong>.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Nuestro equipo de diseño lo está elaborando especialmente para ti. Lo recibirás en tu bandeja de entrada en las próximas 24-72 horas.
      </p>

      {isVinculoInfinito && (
        <div style={{
          backgroundColor: '#FFF0F5',
          border: '1.5px solid #F8C7D8',
          borderRadius: '16px',
          padding: '16px 20px',
          margin: '0 0 20px',
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#A0285D',
            margin: '0 0 6px',
          }}>
            📸 Tu galería conmemorativa ampliada (4 fotos más)
          </h3>
          <p style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#6E2548',
            margin: 0,
          }}>
            Al haber elegido el plan <strong>Vínculo Infinito</strong>, nos pondremos en contacto contigo muy pronto a este mismo correo para que nos compartas las 4 fotos adicionales con las que crearemos la galería conmemorativa de <strong>{petName}</strong>.
          </p>
        </div>
      )}

      <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px' }}>
        Mientras tanto, {petName} ya tiene su espacio reservado en el Mural de Ángeles en el Cielo, donde su recuerdo brillará para siempre.
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

export default CertificatePendingEmail;
