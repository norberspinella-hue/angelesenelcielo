# El Libro de los Ángeles · Jardín de rosas al amanecer

Prototipo local para Antigravity. Extraer todo el ZIP y abrir index.html en un navegador. Las fotos y cartas de la demo son ilustrativas.

## Integración
- Reemplazar únicamente la presentación del Libro en /comunidad. Reutilizar la consulta y publicación existentes. Pasar a renderLibro una lista de cartas públicas con nombre, texto, foto opcional y alt opcional. En la demo la primera carta abre el Libro. En producción usar la elección editorial si existe, o la primera del orden vigente.
- Conectar «Leer las cartas» a #libro-de-los-angeles y conservar la acción existente de escritura. Adaptar las rutas de assets al sistema de archivos públicos de la web. Los fondos incluidos son copias de las variantes WebP ya aprobadas. El AVIF del paquete anterior puede añadirse a picture.
- Los tres sobres completos se sirven como WebP, con el nombre y la primera línea en HTML. Cada sobre, el sello alado y el retrato ilustrativo incluyen un PNG maestro. El sello ya está integrado en el sobre abierto y se entrega además como recurso independiente. El marco y el papel son SVG reutilizables.
- Integrar filtros, paginación, acciones y enlaces existentes desde la experiencia actual, sin sustituir la capa de datos por la demo. Usar el diálogo incluido como referencia o llevar sus estilos al lector existente.
- Verificar en la integración final apertura, Escape, devolución del foco, texto largo, enlaces existentes, contraste sobre el jardín y tamaños de pantalla. Mantener rosas y destellos en la ilustración. El texto de carta va sobre papel opaco.

