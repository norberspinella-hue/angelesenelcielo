import * as React from 'react';

interface DesignerOrderEmailProps {
  orderId: string;
  userEmail: string;
  petName: string;
  plan: string;
  founderNumber?: number;
  petPhotoUrl: string;
  uploadUrl: string;
}

export const DesignerOrderEmail = ({
  orderId,
  userEmail,
  petName,
  plan,
  founderNumber,
  petPhotoUrl,
  uploadUrl,
}: DesignerOrderEmailProps) => {
  const planLabel: Record<string, string> = {
    fundador: 'Angelito Fundador',
    eterno: 'Recuerdo Eterno',
    estrella: 'Estrella Anual',
    inicial: 'Recuerdo Inicial',
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#333333',
      backgroundColor: '#FFFFFF',
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      borderRadius: '16px',
      border: '1px solid #E5E7EB'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1E2A78',
        margin: '0 0 20px',
        borderBottom: '2px solid #F3F4F6',
        paddingBottom: '12px'
      }}>
        🎨 NUEVO ENCARGO DE CERTIFICADO
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#4B5563', width: '120px' }}>Pedido:</td>
            <td style={{ padding: '8px 0', color: '#111827' }}>{orderId}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#4B5563' }}>Plan:</td>
            <td style={{ padding: '8px 0', color: '#111827' }}>{planLabel[plan] || plan}</td>
          </tr>
          {founderNumber && (
            <tr>
              <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#4B5563' }}>Fundador #:</td>
              <td style={{ padding: '8px 0', color: '#111827' }}>{founderNumber}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#4B5563' }}>Mascota:</td>
            <td style={{ padding: '8px 0', color: '#111827', fontWeight: 'bold' }}>{petName}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#4B5563' }}>Email:</td>
            <td style={{ padding: '8px 0', color: '#111827' }}>{userEmail}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <a 
          href={petPhotoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            color: '#1E2A78',
            textDecoration: 'underline',
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '20px'
          }}
        >
          [Ver foto de {petName} en alta resolución]
        </a>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '16px' }}>
          Una vez hayas diseñado el certificado, haz clic en el siguiente botón para subirlo (PDF y PNG). El sistema se encargará de entregarlo automáticamente al cliente.
        </p>
        <a 
          href={uploadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#1E2A78',
            color: '#FFFFFF',
            padding: '14px 28px',
            borderRadius: '9999px',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(30, 42, 120, 0.2)'
          }}
        >
          SUBIR CERTIFICADO
        </a>
      </div>
    </div>
  );
};

export default DesignerOrderEmail;
