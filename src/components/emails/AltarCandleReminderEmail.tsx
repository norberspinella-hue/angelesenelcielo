import * as React from 'react';

interface AltarCandleReminderEmailProps {
  petName: string;
  type: 'pre_extinction' | 'extinguished';
  candleUrl: string;
  reigniteUrl: string;
  muralUrl: string;
  unsubscribeUrl: string;
}

export const AltarCandleReminderEmail = ({
  petName,
  type,
  candleUrl,
  reigniteUrl,
  muralUrl,
  unsubscribeUrl,
}: AltarCandleReminderEmailProps) => {
  const isPre = type === 'pre_extinction';

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
        <span style={{ fontSize: '42px' }}>{isPre ? '🕯️' : '✨'}</span>
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#8C3F71',
        textAlign: 'center',
        margin: '0 0 16px'
      }}>
        {isPre 
          ? `La velita de ${petName} descansará pronto` 
          : `La llama de ${petName} reposa en el altar`}
      </h2>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
        Hola,
      </p>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
        {isPre
          ? `Han pasado 5 días desde que encendiste la velita por ${petName}. En 48 horas su llama descansará en el altar comunitario.`
          : `Se han cumplido los 7 días de luz viva de ${petName}. Su homenaje, fotografía y dedicatoria continúan visibles en el altar.`}
      </p>

      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
        Puedes volver a encenderla gratuitamente por 7 días más con un solo clic:
      </p>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href={reigniteUrl} style={{
          backgroundColor: '#B83C7E',
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: '9999px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '15px',
          display: 'inline-block'
        }}>
          Reavivar la llama de {petName} (Gratis) →
        </a>
      </div>

      <div style={{
        backgroundColor: '#FFF8F4',
        borderRadius: '16px',
        padding: '20px',
        margin: '28px 0',
        border: '1px solid #F0D5C2',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#8A4A1C', margin: '0 0 8px' }}>
          ⭐ ¿Deseas que su luz brille sin interrupción?
        </p>
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#6A4020', margin: '0 0 14px' }}>
          Su recuerdo permanece aquí. Si deseas mantener su luz encendida de forma continuada, puedes darle un lugar en nuestro Mural de Ángeles.
        </p>
        <a href={muralUrl} style={{
          color: '#A84412',
          fontWeight: 'bold',
          fontSize: '13px',
          textDecoration: 'underline'
        }}>
          Descubrir un espacio en el Mural Global →
        </a>
      </div>

      <p style={{ fontSize: '12px', color: '#9E869B', textAlign: 'center', marginTop: '32px', borderTop: '1px solid #F5E8F0', paddingTop: '16px' }}>
        Ángeles en el Cielo · <a href={candleUrl} style={{ color: '#8C3F71' }}>Ver altar</a>.<br />
        Si no deseas recibir más recordatorios sobre esta vela, puedes <a href={unsubscribeUrl} style={{ color: '#8C3F71' }}>darte de baja aquí</a>.
      </p>
    </div>
  );
};
