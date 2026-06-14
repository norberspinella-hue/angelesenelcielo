import * as React from 'react';

interface CertificatePendingEmailProps {
  petName: string;
  planLabel: string;
}

export const CertificatePendingEmail = ({
  petName,
  planLabel,
}: CertificatePendingEmailProps) => {
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
