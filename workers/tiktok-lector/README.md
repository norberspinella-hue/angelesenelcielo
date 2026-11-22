# Lector de chat de TikTok LIVE · Ángeles en el Cielo

Este script ligero se ejecuta en el PC de emisión para leer el chat de TikTok LIVE en modo **solo lectura** (sin iniciar sesión ni publicar mensajes en el chat) y reenviar únicamente los comandos configurados a tu web.

## Configuración (una sola vez)

1. Copia `.env.example` a `.env` dentro de esta carpeta (`workers/tiktok-lector/.env`).
2. Rellena:
   - `LIVE_API_URL`: URL de tu web (`https://todaslasmascotasvanalcielo.com` o tu URL de Preview).
   - `LIVE_INGEST_SECRET`: el mismo secreto largo (32+ caracteres) configurado en Vercel.
   - `EULER_API_KEY` *(opcional)*: solo si utilizas Euler Stream ante límites de conexión.

## Uso el día del directo

1. Haz doble clic en **`iniciar-lector.bat`** y deja la ventana abierta durante el directo.
2. En tu móvil abre `/live-tiktok/control`, entra con el PIN, escribe tu `@usuario` y pulsa **Encender lector**.
3. El panel pasará a verde en menos de 30 segundos al recibir el heartbeat.
4. Al terminar el directo, pulsa **Apagar lector** en el panel y cierra la ventana.
