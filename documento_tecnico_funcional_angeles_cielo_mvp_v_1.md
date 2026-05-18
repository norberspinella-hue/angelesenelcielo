# Documento Técnico-Funcional de Entrega
## Ángeles en el Cielo · MVP v1

---

## 0. Estado del documento

**Versión:** MVP v1  
**Proyecto:** Todas las mascotas van al cielo  
**Experiencia:** Ángeles en el Cielo  
**Producto:** Mural de Ángeles en el Cielo  
**Objetivo:** Construir la primera experiencia funcional de memorial para mascotas fallecidas, conectando landing, mural, flujo de creación, pago, perfil público y tarjeta compartible.

---

# 1. Resumen del producto

**Ángeles en el Cielo** es la experiencia memorial del universo **Todas las mascotas van al cielo**.

Permite a una persona subir la foto de una mascota fallecida, contar su historia con preguntas guiadas, elegir cuánto espacio ocupará su recuerdo dentro del **Mural de Ángeles en el Cielo**, pagar el plan elegido y obtener un perfil público compartible conectado al mural.

La web no debe sentirse como una app técnica ni como una tienda. Debe sentirse como una experiencia emocional para darle a una mascota un lugar simbólico en el Cielo.

**Idea central:**

> Tu mascota tuvo un lugar enorme en tu vida. Ahora puedes darle un lugar en el Cielo.

**Dream Outcome:**

> Mi mascota tiene un lugar en el Cielo para él/ella.

**Oferta principal:**

> Desde 1 €, reserva un lugar para tu angelito en el Mural de Ángeles en el Cielo.

**Mensaje de escasez sensible:**

> El Mural de Ángeles en el Cielo tiene 1.000.000 de espacios. Cada angelito ocupa un lugar único dentro de él.

---

# 2. Objetivo de conversión

## Objetivo principal

Que el usuario complete el flujo **“Darle su lugar en el Cielo”**.

## Conversión final

La conversión se considera completada cuando ocurre todo esto:

1. El usuario sube foto y datos básicos.
2. Responde o completa las preguntas guiadas.
3. Elige un slot o bloque de slots en el mural.
4. Selecciona plan.
5. Completa pago con Stripe.
6. El sistema confirma pago.
7. El sistema reserva definitivamente el/los slots.
8. Se crea el perfil memorial público.
9. Se genera tarjeta compartible.
10. El usuario llega a pantalla de confirmación emocional.

## CTA principal de toda la experiencia

> Darle su lugar en el Cielo

---

# 3. Framework emocional

La web debe guiar al usuario desde la emoción hacia la acción sin sentirse comercial.

## No comunicar como

- Compra un plan.
- Suscríbete.
- Paga para aparecer.
- Compra más visibilidad.
- Sube una foto.

## Comunicar como

- Dale su lugar en el Cielo.
- Reserva un espacio para su recuerdo.
- Elige cuánto lugar quieres darle dentro del mural.
- Cada recuerdo ocupa un lugar real.
- Un cielo finito para historias que merecen seguir brillando.

## Frases base

> No estamos subiendo una foto. Estamos dando un lugar en el Cielo a alguien que amamos.

> Cada foto guarda una historia. Cada historia deja una huella.

> Tu mascota tuvo un lugar enorme en tu vida. Ahora puede tener también un lugar en el Cielo.

---

# 4. Arquitectura de rutas

```text
/
Home madre: Todas las mascotas van al cielo.

/angeles-en-el-cielo
Landing principal de Ángeles en el Cielo.

/angeles-en-el-cielo/mural
Mural completo de Ángeles en el Cielo.

/angeles-en-el-cielo/crear
Flujo de creación del recuerdo.

/angeles-en-el-cielo/[slug]
Perfil público memorial de cada mascota.

/checkout
Integración de pago.

/gracias/[id]
Confirmación emocional después del pago.
```

---

# 5. Flujo completo de usuario

```text
1. Usuario llega a /angeles-en-el-cielo.
2. Ve hero emocional y CTA “Darle su lugar en el Cielo”.
3. Puede hacer clic en el CTA o explorar el mural.
4. En el mural, el usuario puede elegir directamente un slot disponible.
5. Al elegir slot, se abre la tarjeta CTA para iniciar creación.
6. Usuario entra en /angeles-en-el-cielo/crear.
7. Sube foto de su mascota.
8. Introduce nombre, especie, email y fecha de fallecimiento.
9. Responde preguntas guiadas.
10. Ve preview emocional del recuerdo.
11. Confirma o ajusta el espacio elegido.
12. Elige plan: 1, 4 o 9 espacios.
13. Se crea una reserva temporal de slots durante 15 minutos.
14. Usuario va a checkout con Stripe.
15. Completa pago.
16. Si el pago es correcto, los slots quedan reservados definitivamente.
17. Se crea el perfil público memorial.
18. Se genera tarjeta compartible.
19. Usuario llega a /gracias/[id].
20. Puede ver su recuerdo, verlo en el mural o compartirlo con su familia.
```

---

# 6. Decisiones funcionales cerradas

## 6.1 Login o sin login

**Decisión MVP:** subida sin cuenta al principio, con email obligatorio.

El usuario podrá crear el recuerdo sin registrarse. Debe dejar email obligatorio para:

- recibir confirmación,
- recuperar su recuerdo,
- recuperar borrador,
- recibir enlace de edición,
- recibir email de aniversario,
- crear cuenta más adelante si lo desea.

## 6.2 Elección de posición

**Decisión MVP:** el usuario elige slot directamente en el mural.

Al seleccionar un slot disponible en el mural, se abre una tarjeta CTA para iniciar el flujo de creación.

El sistema debe contemplar:

- selección de 1 slot para Recuerdo Inicial,
- selección de bloque 2×2 para Estrella Anual,
- selección de bloque 3×3 para Recuerdo Eterno.

## 6.3 Reserva de slots antes del pago

Los slots se reservan definitivamente solo después del pago correcto.

Durante checkout se crea una reserva temporal de **15 minutos** para evitar que otro usuario tome el mismo espacio.

Si el pago falla, se cancela o expira el tiempo:

- los slots vuelven a estar disponibles,
- el memorial queda como borrador no publicado,
- el usuario puede recuperar el proceso por email.

## 6.4 Comentarios y reacciones

**Reacciones desde MVP:** sí.  
**Comentarios desde MVP:** sí, con moderación básica y opción de reportar.

## 6.5 Tarjeta compartible

**Desde MVP:** sí.

Debe generarse al completar el pago y publicar el recuerdo.

## 6.6 Pasarela de pago

**Pasarela:** Stripe.

Productos Stripe:

```text
recuerdo_inicial_1_slot
estrella_anual_4_slots
recuerdo_eterno_9_slots
```

---

# 7. Pantallas del flujo de creación

## 7.1 Pantalla 1 — Selección de slot desde el mural

El usuario puede iniciar el flujo desde el mural.

### Comportamiento

1. Usuario entra en `/angeles-en-el-cielo/mural`.
2. Ve el grid de 1.000.000 espacios.
3. Los espacios ocupados muestran miniaturas de mascotas.
4. Los espacios libres muestran estado disponible.
5. Usuario hace clic en un slot libre.
6. Se abre una tarjeta CTA.

### Tarjeta CTA al seleccionar slot

**Título:**

> Este espacio puede ser para tu angelito

**Texto:**

> Dale un lugar en el Cielo dentro de un mural creado para quienes dejaron huella.

**Botones:**

- Darle su lugar en el Cielo
- Ver planes
- Cancelar selección

---

## 7.2 Pantalla 2 — Subida inicial

### Campos

```text
Foto de la mascota
Nombre de la mascota
Especie
Fecha de fallecimiento
Email del usuario
```

### Copy emocional

> Elige esa imagen que todavía te hace sentir cerca de él/ella.

### CTA

> Continuar con su historia

### Validaciones

- Foto obligatoria.
- Nombre obligatorio.
- Especie obligatoria.
- Fecha de fallecimiento obligatoria.
- Email obligatorio.
- Formato de email válido.
- Imagen con formato aceptado: JPG, PNG, WebP.
- Peso máximo definido por backend.

---

## 7.3 Pantalla 3 — Preguntas guiadas

### Objetivo

Reducir el bloqueo emocional del usuario y ayudarle a construir una historia bonita sin tener que escribir desde cero.

### Preguntas MVP

```text
¿Cómo llegó a tu vida?
¿Qué era lo que más le hacía feliz?
¿Qué huella dejó en tu corazón?
¿Qué le dirías si pudieras abrazarlo una vez más?
```

### Tono

- cálido,
- humano,
- delicado,
- sin presión,
- sin lenguaje religioso explícito,
- sin frases comerciales.

### CTA

> Ver cómo quedará su recuerdo

---

## 7.4 Pantalla 4 — Preview emocional

### Título

> Así se verá su recuerdo

### Debe mostrar

```text
Foto
Nombre
Especie
Fecha de fallecimiento
Dedicatoria
Fragmento de historia
Vista de tarjeta compartible
Vista del espacio seleccionado en mural
```

### Objetivo

Que el usuario sienta que su mascota ya empieza a tener su lugar antes del pago.

### Acciones

- Editar información.
- Editar historia.
- Cambiar slot.
- Continuar a elección de plan.

---

## 7.5 Pantalla 5 — Elección de plan / espacio

### Título

> Elige el lugar que quieres darle en el Cielo

### Planes

#### Recuerdo Inicial

```text
Precio: 1 €
Ocupa: 1 espacio
CTA: Darle 1 espacio
```

Texto:

> Un primer lugar para que su recuerdo forme parte del mural.

#### Estrella Anual

```text
Precio: 4,99 €/año
Ocupa: 4 espacios
CTA: Darle 4 espacios
```

Texto:

> Para renovar cada año su estrella y mantener viva su presencia en el Cielo.

#### Recuerdo Eterno

```text
Precio: 9,99 € pago único
Ocupa: 9 espacios
CTA: Darle 9 espacios
```

Texto:

> Para dedicarle un lugar más grande y permanente dentro del Cielo.

---

## 7.6 Pantalla 6 — Checkout

### Pasarela

Stripe.

### Copy de continuidad emocional

> Estás a un paso de darle su lugar en el Cielo.

### Comportamiento

1. Usuario selecciona plan.
2. Sistema crea reserva temporal de slots por 15 minutos.
3. Usuario entra en checkout.
4. Stripe procesa pago.
5. Web recibe confirmación por webhook.
6. Si pago correcto: publicar memorial y reservar slots definitivamente.
7. Si pago fallido: mantener borrador no publicado y liberar slots al expirar reserva.

---

## 7.7 Pantalla 7 — Confirmación emocional

### No usar como título principal

> Pago completado

### Usar

> Tu angelito ya tiene su lugar en el Cielo

### Subtexto

> Su recuerdo forma parte del mural. Puedes visitar su perfil, compartir su historia o ver el lugar que ocupa en el Cielo.

### Botones

```text
Ver su recuerdo
Verlo en el mural
Compartir con mi familia
```

---

# 8. Planes y lógica de slots

## 8.1 Planes oficiales

| Plan | Precio | Slots | Visual |
|---|---:|---:|---|
| Recuerdo Inicial | 1 € | 1 | 1 celda |
| Estrella Anual | 4,99 €/año | 4 | bloque 2×2 |
| Recuerdo Eterno | 9,99 € pago único | 9 | bloque 3×3 |

## 8.2 Reglas técnicas

```text
Recuerdo Inicial = 1 slot individual.
Estrella Anual = bloque 2×2 de 4 slots contiguos.
Recuerdo Eterno = bloque 3×3 de 9 slots contiguos.
```

## 8.3 Disponibilidad

Antes de mostrar como disponible un bloque 2×2 o 3×3, el sistema debe comprobar que todos los slots del bloque están libres.

## 8.4 Reserva temporal

```text
Duración: 15 minutos.
Estado: reserved_pending_payment.
Si checkout se completa: occupied.
Si checkout falla o expira: available.
```

## 8.5 Estados de slot

```text
available
reserved_pending_payment
occupied
blocked_admin
sponsor_private
```

---

# 9. Modelo de datos

## 9.1 Memorial

```ts
type HeavenMemorial = {
  id: string;
  userId?: string;
  email: string;

  petName: string;
  species: "perro" | "gato" | "conejo" | "pájaro" | "caballo" | "otro";
  photoUrl: string;

  deathDate: string;
  dedication: string;

  storyAnswers: {
    arrival?: string;
    happiness?: string;
    legacy?: string;
    finalMessage?: string;
  };

  generatedStory?: string;

  planType: "recuerdo_inicial" | "estrella_anual" | "recuerdo_eterno";
  pricePaid: number;
  currency: "EUR";
  slotsCount: 1 | 4 | 9;

  slotPositions: Array<{
    x: number;
    y: number;
  }>;

  profileSlug: string;
  visibility: "public" | "private";

  reactionsCount: number;
  commentsCount: number;

  paymentStatus: "draft" | "pending" | "paid" | "failed";
  publicationStatus: "draft" | "published" | "archived";

  createdAt: string;
  updatedAt: string;
};
```

## 9.2 Slot

```ts
type HeavenMuralSlot = {
  id: string;
  x: number;
  y: number;
  status: "available" | "reserved_pending_payment" | "occupied" | "blocked_admin" | "sponsor_private";
  memorialId?: string;
  reservedUntil?: string;
  planType?: "recuerdo_inicial" | "estrella_anual" | "recuerdo_eterno";
  createdAt: string;
  updatedAt: string;
};
```

## 9.3 Comment

```ts
type MemorialComment = {
  id: string;
  memorialId: string;
  authorName: string;
  authorEmail?: string;
  message: string;
  status: "visible" | "pending_moderation" | "reported" | "hidden";
  createdAt: string;
};
```

## 9.4 Reaction

```ts
type MemorialReaction = {
  id: string;
  memorialId: string;
  type: "huellita" | "estrella" | "corazon" | "luz";
  userId?: string;
  ipHash?: string;
  createdAt: string;
};
```

---

# 10. Mural

## Nombre

> Mural de Ángeles en el Cielo

## Capacidad

```text
1.000.000 espacios
Grid 1000 × 1000
```

## Comportamiento

- Cada memorial ocupa 1, 4 o 9 slots.
- Cada bloque conecta al perfil público.
- El usuario puede seleccionar un slot disponible para iniciar creación.
- Si el plan elegido requiere 4 o 9 slots, el sistema debe validar disponibilidad del bloque completo.
- Los slots reservados temporalmente deben mostrarse como no disponibles durante 15 minutos.

## Hover / click en memorial ocupado

Mini card:

```text
Luna
Ahora brilla en el Cielo
“Gracias por enseñarnos que el amor también tiene patitas.”
[Ver su recuerdo]
```

## Click en slot libre

Mostrar tarjeta CTA:

```text
Este espacio puede ser para tu angelito
Dale un lugar en el Cielo dentro de un mural creado para quienes dejaron huella.
[Darle su lugar en el Cielo]
```

---

# 11. Perfil público memorial

## Ruta

```text
/angeles-en-el-cielo/[slug]
```

## Contenido obligatorio

```text
Foto principal
Nombre
Especie
Fecha de fallecimiento
Dedicatoria
Historia
Plan visual
Slots ocupados
Botón compartir
Botón verlo en el mural
Reacciones
Comentarios
```

## CTA secundarios

```text
Dejar una huellita
Encender una estrella
Compartir su recuerdo
Verlo en el mural
```

---

# 12. Tarjeta compartible

## Generación

Debe generarse después del pago correcto y publicación.

## Formato

```text
1080 × 1080 px
Formato recomendado para Instagram, WhatsApp, TikTok, X, Pinterest.
```

## Contenido

```text
Foto de mascota
Nombre
Frase: “[Nombre] ya tiene su lugar en Ángeles en el Cielo”
Claim: “Cada foto guarda una historia. Cada historia deja una huella.”
URL o QR
Marca visible
```

## Acciones

```text
Descargar tarjeta
Compartir enlace
Copiar URL
```

---

# 13. Checkout y Stripe

## Productos Stripe

```text
recuerdo_inicial_1_slot
estrella_anual_4_slots
recuerdo_eterno_9_slots
```

## Precios

```text
recuerdo_inicial_1_slot = 1 € pago único
estrella_anual_4_slots = 4,99 €/año
recuerdo_eterno_9_slots = 9,99 € pago único
```

## Flujo técnico

```text
1. Crear memorial draft.
2. Guardar datos básicos y respuestas.
3. Crear reserva temporal de slots por 15 minutos.
4. Crear Stripe Checkout Session.
5. Redirigir a Stripe.
6. Recibir webhook de pago.
7. Si pago correcto:
   - marcar paymentStatus = paid
   - marcar publicationStatus = published
   - marcar slots = occupied
   - generar perfil público
   - generar tarjeta compartible
   - enviar email confirmación
8. Si pago falla:
   - marcar paymentStatus = failed
   - mantener draft
   - liberar slots al expirar reserva
```

---

# 14. Emails

## 14.1 Email de confirmación

**Asunto:**

> [Nombre] ya tiene su lugar en el Cielo

**Contenido:**

> Su recuerdo ya forma parte del Mural de Ángeles en el Cielo. Puedes visitarlo, compartirlo o verlo dentro del mural.

## 14.2 Email de recuperación de borrador

**Asunto:**

> El recuerdo de [Nombre] está casi listo

**Contenido:**

> Guardamos el recuerdo que empezaste a crear. Puedes volver y terminarlo cuando quieras.

## 14.3 Email de aniversario

Se enviará usando `deathDate`.

**Asunto:**

> Hoy recordamos a [Nombre]

**Contenido:**

> Hoy hace un año más que [Nombre] empezó a brillar en el Cielo. Si quieres, puedes volver a visitar su recuerdo o compartirlo con quienes también lo quisieron.

---

# 15. SEO y Open Graph

Cada perfil debe tener metadatos únicos.

## Title

```text
Luna ya tiene su lugar en Ángeles en el Cielo
```

## Meta description

```text
Un recuerdo creado para Luna, un angelito que dejó huella y ahora brilla en el Mural de Ángeles en el Cielo.
```

## Open Graph image

Usar la tarjeta compartible generada automáticamente.

## Requisitos

```text
Slug legible
Title dinámico
Meta description dinámica
OG image personalizada
URL pública compartible
```

---

# 16. Moderación y seguridad

## Imagen

```text
Validar formato.
Validar peso máximo.
Evitar archivos ejecutables.
Guardar en storage seguro.
```

## Comentarios

```text
Moderación básica.
Filtro de palabras ofensivas.
Botón reportar comentario.
Estado pending_moderation opcional.
```

## Perfil

```text
Botón reportar perfil.
Revisión manual si hay denuncia.
```

## Antispam

```text
Rate limit por IP/email.
Protección en formulario.
Protección en reacciones.
Evitar abuso de comentarios.
```

---

# 17. Analytics

Eventos mínimos:

```text
hero_cta_click
mural_cta_click
slot_selected
slot_cta_opened
photo_upload_started
photo_upload_completed
basic_info_completed
guided_questions_started
guided_questions_completed
preview_viewed
plan_selected
checkout_started
checkout_completed
payment_failed
profile_created
share_card_downloaded
profile_shared
mural_slot_clicked
comment_added
reaction_added
```

Objetivo de analytics:

- saber dónde cae la conversión,
- medir interés por planes,
- medir uso del mural,
- medir viralidad de tarjetas,
- medir perfiles compartidos.

---

# 18. Estados de error y recuperación

## Errores previstos

```text
Foto demasiado pesada
Formato de imagen no permitido
Email inválido
Campos obligatorios incompletos
Slot no disponible
Bloque 2×2 no disponible
Bloque 3×3 no disponible
Reserva temporal expirada
Pago cancelado
Pago fallido
Error al generar perfil
Error al generar tarjeta compartible
```

## Recuperación recomendada

```text
Si formulario incompleto: mostrar ayuda suave.
Si slot no disponible: sugerir otro espacio cercano.
Si pago falla: mantener borrador 24 horas.
Si reserva expira: permitir elegir nuevo slot.
Si tarjeta falla: generar en segundo plano y avisar.
```

---

# 19. Checklist de aceptación

```text
[ ] CTA principal dice “Darle su lugar en el Cielo”.
[ ] La landing no lleva directamente a checkout.
[ ] El usuario puede elegir slot en el mural.
[ ] Al elegir slot se abre tarjeta CTA.
[ ] El usuario sube foto antes de elegir plan.
[ ] Email obligatorio sin necesidad de cuenta.
[ ] Hay preguntas guiadas.
[ ] Hay preview antes del pago.
[ ] Los planes son 1 €, 4,99 €/año y 9,99 € pago único.
[ ] Los slots son 1, 4 y 9.
[ ] 4 slots se comportan como bloque 2×2.
[ ] 9 slots se comportan como bloque 3×3.
[ ] La reserva temporal dura 15 minutos.
[ ] El mural es finito de 1.000.000 espacios.
[ ] Cada foto conecta con perfil público.
[ ] Stripe está integrado.
[ ] Pago correcto publica perfil y reserva slots.
[ ] Pago fallido no publica perfil.
[ ] Hay confirmación emocional.
[ ] Se genera tarjeta compartible.
[ ] Se guarda fecha de fallecimiento.
[ ] Existe estructura para email de aniversario.
[ ] Hay comentarios desde MVP.
[ ] Hay reacciones desde MVP.
[ ] Hay moderación básica y reportes.
[ ] Hay eventos analytics mínimos.
[ ] La experiencia se siente emocional y no técnica.
```

---

# 20. Pendientes para fase 2

```text
Cuenta de usuario completa.
Panel privado del usuario.
Edición avanzada del perfil.
Elección avanzada de zona premium.
Emails automáticos completos.
Renovar estrella anual.
Add-ons: vela, certificado, QR, lámina.
Productos físicos.
Marketplace.
IA para mejorar dedicatorias.
Moderación avanzada.
Sistema de patrocinadores.
Zonas fundadores.
Dashboard de métricas.
```

---

# 21. Nota final para el programador

Este documento define el comportamiento funcional del MVP. Debe implementarse respetando el prompt maestro visual y el CSS de marca.

La prioridad no es solo que funcione. La prioridad es que funcione **sin romper la emoción**.

La experiencia debe sentirse como:

> Estoy dando a mi mascota el lugar que merece en el Cielo.

No como:

> Estoy comprando un producto digital.

