/**
 * DoradoEternoCertificateA4.tsx
 * Certificado "Dorado Eterno" — Ángeles en el Cielo
 *
 * Tamaño real: 2480 × 3508 px (A4 @ 300 dpi)
 * Exportar con: Playwright screenshot o html-to-image a escala 1:1
 *
 * Uso:
 *   <DoradoEternoCertificateA4 data={certificateData} />
 *
 * Requiere en /public/images/certificates/:
 *   dorado-eterno-a4-background.png  (2480×3508)
 *
 * Fuentes (añadir en layout.tsx o _document.tsx):
 *   Playfair Display 400, 500 (normal + italic)
 *   Cormorant Garamond 400, 500 (normal + italic)
 *   Nunito Sans 400, 600
 */

import React from "react";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type CertificateType = "recuerdo_eterno" | "huella_eterna";
export type BadgeLabel = "Recuerdo Eterno" | "Huella Eterna" | "Angelito Fundador";

export interface DoradoEternoCertificateData {
  petName: string;
  petPhotoUrl: string;
  certificateType: CertificateType;
  certificateTitle?: string;         // override del título si se necesita
  planName: string;
  slotsCount: 1 | 4 | 9;
  slotLabel: string;
  creationDate: string;              // "22·05·2026"
  memoryCode: string;                // "AEC-000126"
  profileUrl: string;
  shortUrl: string;
  qrImageUrl: string;                // URL de la imagen del QR generado
  emotionalMessage?: string;         // override del texto emocional
  badgeLabel?: BadgeLabel;
}

// ─── Datos de ejemplo ────────────────────────────────────────────────────────

export const EXAMPLE_DATA: DoradoEternoCertificateData = {
  petName: "Rocky",
  petPhotoUrl: "/images/example-pet.jpg",
  certificateType: "recuerdo_eterno",
  planName: "Recuerdo Eterno",
  slotsCount: 9,
  slotLabel: "9 lugares en el Cielo",
  creationDate: "22·05·2026",
  memoryCode: "AEC-000126",
  profileUrl: "https://todaslasmascotasvanalcielo.com/angeles-en-el-cielo/rocky",
  shortUrl: "aec.link/rocky",
  qrImageUrl: "/qr/rocky.png",
  badgeLabel: "Recuerdo Eterno",
};

// ─── Textos emocionales por tipo ─────────────────────────────────────────────

const EMOTIONAL_TEXTS: Record<CertificateType, (name: string) => string> = {
  recuerdo_eterno: (name) =>
    `Con amor confirmamos que ${name} tiene un lugar\nen el Mural de Ángeles en el Cielo.\nSu amor, su luz y los momentos compartidos\nvivirán por siempre en nuestros corazones.`,
  huella_eterna: (name) =>
    `En honor a ${name}, por haber dejado una huella\nque el tiempo no borra.\nSu recuerdo forma parte del Mural de Ángeles en el Cielo,\ndonde su historia seguirá brillando para siempre.`,
};

// ─── Títulos por tipo ────────────────────────────────────────────────────────

const CERTIFICATE_SUBTITLES: Record<CertificateType, string> = {
  recuerdo_eterno: "DE RECUERDO ETERNO",
  huella_eterna: "DE HUELLA ETERNA",
};

// ─── Helper: tamaño de fuente para nombre según longitud ─────────────────────

function petNameFontSize(name: string): number {
  if (name.length <= 6) return 210;
  if (name.length <= 10) return 165;
  if (name.length <= 14) return 125;
  return 95;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export interface DoradoEternoCertificateA4Props {
  data: DoradoEternoCertificateData;
  /** Escala visual para preview en pantalla. Por defecto 1 (tamaño real 2480×3508). */
  scale?: number;
}

export function DoradoEternoCertificateA4({
  data,
  scale = 1,
}: DoradoEternoCertificateA4Props) {
  const subtitle = CERTIFICATE_SUBTITLES[data.certificateType];
  const emotionalText =
    data.emotionalMessage ?? EMOTIONAL_TEXTS[data.certificateType](data.petName);
  const badgeText = data.badgeLabel ?? "Recuerdo Eterno";
  const nameFontSize = petNameFontSize(data.petName);

  // Escalar todo el certificado con transform
  const containerStyle: React.CSSProperties = {
    width: 2480 * scale,
    height: 3508 * scale,
    overflow: "hidden",
    flexShrink: 0,
  };

  const innerStyle: React.CSSProperties = {
    width: 2480,
    height: 3508,
    transformOrigin: "top left",
    transform: scale !== 1 ? `scale(${scale})` : undefined,
  };

  return (
    <div style={containerStyle}>
      <div id="certificate-dorado-eterno" style={innerStyle}>
        <div
          style={{
            width: 2480,
            height: 3508,
            position: "relative",
            overflow: "hidden",
            fontFamily: '"Nunito Sans", sans-serif',
            color: "#4B3217",
            backgroundImage:
              "url('/images/certificates/dorado-eterno-a4-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* ── ZONA 1 · Marca superior ─────────────────── */}
          <header
            style={{
              position: "absolute",
              top: 80,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            {/* Icono pezuña con alas — aquí puedes sustituir por SVG real */}
            <div
              style={{
                fontSize: 110,
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              🐾
            </div>

            <p
              style={{
                fontSize: 36,
                letterSpacing: "0.26em",
                color: "#9A641C",
                margin: "0 0 18px",
                fontWeight: 400,
              }}
            >
              TODAS LAS MASCOTAS VAN AL CIELO
            </p>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 88,
                fontWeight: 500,
                color: "#6F4518",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Ángeles en el Cielo
            </h2>

            {/* Separador dorado */}
            <div
              style={{
                width: 520,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, #C9963A 30%, #C9963A 70%, transparent)",
                margin: "32px auto 0",
              }}
            />
          </header>

          {/* ── ZONA 2 · Título del certificado ─────────── */}
          <section
            style={{
              position: "absolute",
              top: 510,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 178,
                fontWeight: 500,
                letterSpacing: "0.12em",
                color: "#6F4518",
                margin: 0,
                lineHeight: 1,
              }}
            >
              CERTIFICADO
            </h1>
            <h3
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 104,
                fontWeight: 400,
                letterSpacing: "0.10em",
                color: "#9A641C",
                margin: "14px 0 0",
                lineHeight: 1,
              }}
            >
              {data.certificateTitle ?? subtitle}
            </h3>
          </section>

          {/* ── ZONA 3 · Foto protagonista + halo ───────── */}
          <section
            style={{
              position: "absolute",
              top: 880,
              left: "50%",
              transform: "translateX(-50%)",
              width: 1040,
              height: 1040,
            }}
          >
            {/* Halo luminoso */}
            <div
              style={{
                position: "absolute",
                top: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 680,
                height: 130,
                border: "12px solid rgba(232,201,120,0.9)",
                borderRadius: "50%",
                filter: "blur(1px)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Medallón circular */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "8px solid #C9963A",
                boxShadow:
                  "0 0 80px rgba(232,201,120,0.65), 0 0 140px rgba(232,201,120,0.3)",
                overflow: "hidden",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.petPhotoUrl}
                alt={`Foto de ${data.petName}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Marco ornamental exterior (segundo anillo) */}
            <div
              style={{
                position: "absolute",
                top: -28,
                left: -28,
                right: -28,
                bottom: -28,
                borderRadius: "50%",
                border: "3px solid rgba(201,150,58,0.35)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          </section>

          {/* ── ZONA 4 · Nombre + texto emocional ──────── */}
          <section
            style={{
              position: "absolute",
              top: 2030,
              left: 300,
              right: 300,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: nameFontSize,
                fontWeight: 500,
                color: "#9A641C",
                margin: "0 0 56px",
                lineHeight: 1,
              }}
            >
              {data.petName}
            </h2>

            <p
              style={{
                fontSize: 52,
                lineHeight: 1.48,
                color: "#4B3217",
                margin: "0 auto",
                maxWidth: 1600,
                whiteSpace: "pre-line",
              }}
            >
              {emotionalText}
            </p>
          </section>

          {/* ── ZONA 5 · Datos variables ────────────────── */}
          <div
            style={{
              position: "absolute",
              top: 2585,
              left: 260,
              right: 260,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              textAlign: "center",
              padding: "48px 0",
              borderTop: "2px solid rgba(201,150,58,0.35)",
              borderBottom: "2px solid rgba(201,150,58,0.35)",
            }}
          >
            {[
              { label: "PLAN", value: data.planName },
              { label: "ESPACIO", value: data.slotLabel },
              { label: "FECHA", value: data.creationDate },
              { label: "CÓDIGO", value: data.memoryCode },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  padding: "0 28px",
                  borderRight:
                    i < arr.length - 1
                      ? "2px solid rgba(201,150,58,0.35)"
                      : "none",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 30,
                    letterSpacing: "0.20em",
                    color: "#9A641C",
                    marginBottom: 18,
                  }}
                >
                  {item.label}
                </span>
                <strong
                  style={{
                    display: "block",
                    fontSize: 42,
                    fontWeight: 600,
                    color: "#4B3217",
                  }}
                >
                  {item.value}
                </strong>
              </div>
            ))}
          </div>

          {/* ── ZONA 6 · Sello + QR ─────────────────────── */}
          <div
            style={{
              position: "absolute",
              top: 2870,
              left: 260,
              right: 260,
              display: "grid",
              gridTemplateColumns: "1fr 480px",
              alignItems: "center",
              gap: 40,
            }}
          >
            {/* Sello circular */}
            <div
              style={{
                width: 420,
                height: 420,
                margin: "0 auto",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #f5d98f 0%, #c9963a 70%, #9a641c 100%)",
                border: "8px solid #f6e8c8",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontFamily: '"Playfair Display", serif',
                fontSize: 56,
                lineHeight: 1.1,
                color: "#6f4518",
                boxShadow: "0 14px 40px rgba(122,82,24,0.18)",
                padding: 32,
              }}
            >
              <span style={{ fontSize: 88, lineHeight: 1, marginBottom: 10 }}>
                ✦
              </span>
              {badgeText.toUpperCase()}
            </div>

            {/* QR block */}
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontSize: 32,
                  letterSpacing: "0.18em",
                  color: "#9A641C",
                  marginBottom: 16,
                }}
              >
                VER PERFIL
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.qrImageUrl}
                alt={`QR al perfil de ${data.petName}`}
                style={{
                  width: 300,
                  height: 300,
                  background: "#fff",
                  padding: 18,
                  border: "3px solid #C9963A",
                  display: "block",
                  margin: "0 auto",
                }}
              />
              <strong
                style={{
                  display: "block",
                  fontSize: 36,
                  marginTop: 16,
                  color: "#4B3217",
                  letterSpacing: "0.04em",
                }}
              >
                {data.shortUrl}
              </strong>
            </div>
          </div>

          {/* ── ZONA 7 · Claim final ─────────────────────── */}
          <footer
            style={{
              position: "absolute",
              bottom: 120,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 36,
              lineHeight: 1.5,
              letterSpacing: "0.16em",
              color: "#9A641C",
            }}
          >
            CADA FOTO GUARDA UNA HISTORIA.
            <br />
            CADA HISTORIA DEJA UNA HUELLA.
          </footer>

        </div>
      </div>
    </div>
  );
}

export default DoradoEternoCertificateA4;
