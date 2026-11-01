import * as React from 'react';

interface AltarCandleConfirmationEmailProps {
  petName: string;
  authorName?: string;
  candleUrl: string;
  reigniteUrl: string;
  unsubscribeUrl: string;
}

export const AltarCandleConfirmationEmail = ({
  petName,
  authorName,
  candleUrl,
  reigniteUrl,
  unsubscribeUrl,
}: AltarCandleConfirmationEmailProps) => {
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#2D0F31',
      backgroundColor: '#FFFDFB',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      borderRadius: '24px',
      border: '1px solid #F2DEE9'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '42px' }}>🕯️</span>
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#8C3F71',
        textAlign: 'center',
        margin: '0 0 16px'
      }}>
        Una luz brilla por {petName} en el Cielo de Luces ♡
      </h2>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Hola{authorName && authorName !== 'Familia amorosa' ? ` ${authorName}` : ''},
      </p>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Tu velita en memoria de <strong>{petName}</strong> ya está encendida en nuestro altar comunitario. Su luz viva permanecerá ardiendo durante los próximos <strong>7 días</strong>.
      </p>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
        Cumplidos los 7 días, la llama reposará, pero su fotografía y dedicatoria permanecerán visibles en el santuario para siempre. Podrás volver a encenderla gratuitamente tantas veces como desees.
      </p>

      <div style={{ textAlign: 'center', margin: '28px 0' }}>
        <a href={candleUrl} style={{
          backgroundColor: '#B83C7E',
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: '9999px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '15px',
          display: 'inline-block'
        }}>
          Ver la vela de {petName} en el Altar →
        </a>
      </div>

      <div style={{
        backgroundColor: '#FFF0F6',
        borderRadius: '16px',
        padding: '16px 20px',
        margin: '28px 0',
        border: '1px solid #F5D5E4'
      }}>
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#722B58', margin: 0 }}>
          <strong>Enlace seguro de gestión:</strong> Guarda este correo. Cuando la llama descanse, podrás reactivarla con un clic desde <a href={reigniteUrl} style={{ color: '#8C3F71', textDecoration: 'underline' }}>este enlace directo</a>.
        </p>
      </div>

      <p style={{ fontSize: '12px', color: '#9E869B', textAlign: 'center', marginTop: '32px', borderTop: '1px solid #F5E8F0', paddingTop: '16px' }}>
        Ángeles en el Cielo · Un lugar para recordar con amor.<br />
        Si no deseas recibir recordatorios sobre esta vela, puedes <a href={unsubscribeUrl} style={{ color: '#8C3F71' }}>darte de baja aquí</a>.
      </p>
    </div>
  );
};
