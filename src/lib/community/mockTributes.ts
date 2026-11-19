export interface MockTributeLetter {
  id: string;
  tributeId: string;
  title: string;
  category: 'despedida' | 'cumpleanos' | 'aniversario' | 'espontanea';
  categoryLabel: string;
  message: string;
  authorName: string;
  publishedAt: string;
  displayDate: string;
  candlesCount: number;
  hugsCount: number;
  envelopeColor: 'crema' | 'lavanda' | 'rosa';
}

export interface MockTribute {
  id: string;
  slug: string;
  petName: string;
  species: 'perro' | 'gato' | 'otro';
  speciesLabel: string; // 'Perrita', 'Perro', 'Gatita', 'Gato', etc.
  photoUrl: string | null;
  yearsOrDates: string;
  authorName: string;
  guardianEmail: string;
  muralSlot?: {
    assigned: boolean;
    row: number;
    col: number;
    slotLabel: string;
  } | null;
  letters: MockTributeLetter[];
  candlesCount: number;
  supportCount: number;
  hugsCount: number;
}

export const INITIAL_MOCK_TRIBUTES: MockTribute[] = [
  // 1. ESCENARIO 2: Chloe (Perrita) - 2 cartas (1 larga de varios párrafos y 1 corta)
  {
    id: 'tribute-chloe',
    slug: 'chloe-spinella',
    petName: 'Chloe',
    species: 'perro',
    speciesLabel: 'Perrita',
    photoUrl: '/images/comunidad/chloe.jpg',
    yearsOrDates: '2014 - 2026',
    authorName: 'Familia Spinella',
    guardianEmail: 'familia.spinella@ejemplo.com',
    muralSlot: null,
    candlesCount: 156,
    supportCount: 48,
    hugsCount: 72,
    letters: [
      {
        id: 'letter-chloe-2',
        tributeId: 'tribute-chloe',
        title: 'Tu primer cumpleaños en el cielo',
        category: 'cumpleanos',
        categoryLabel: '🎂 Cumpleaños en el cielo',
        displayDate: '15 de mayo, 2027',
        publishedAt: '2027-05-15T09:30:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 84,
        hugsCount: 42,
        envelopeColor: 'lavanda',
        message: `Hoy cumplirías 13 años con nosotros, mi pequeña Chloe. Esta mañana pusimos flores frescas en el rincón del jardín donde tanto te gustaba tumbarte al sol a media tarde. La casa se siente silenciosa sin ti, pero cada rincón guarda la ternura infinita con la que nos acompañaste durante tantos años.

Todavía nos parece escuchar el tintineo de tus patitas por el pasillo de madera cuando llegábamos de trabajar. Nos enseñaste a querer sin condiciones, con esa mirada dulce que todo lo comprendía y ese entusiasmo con el que recibías cada caricia.

Mira hacia abajo hoy y siente todo nuestro amor. Sé que estás corriendo libre por praderas de luz eterna, sin dolores ni cansancio. Te amamos con toda el alma, hoy y siempre.`,
      },
      {
        id: 'letter-chloe-1',
        tributeId: 'tribute-chloe',
        title: 'Nuestra primera carta de despedida',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '23 de octubre, 2026',
        publishedAt: '2026-10-23T18:44:56Z',
        authorName: 'Familia Spinella',
        candlesCount: 76,
        hugsCount: 25,
        envelopeColor: 'crema',
        message: 'Te fuiste como llegaste de manera inesperada, pero nos llenaste de vida y de amor. Nos enseñaste a querer de nuevo y nos curaste heridas que no sabíamos que se podían curar. Te agradecemos todo lo que nos diste, pequeñita. Te echaremos de menos siempre.',
      },
    ],
  },

  // 2. ESCENARIO 3: Luna Spinella (Gatita) - 10 cartas
  // Corrección: Su fotografía corresponde a una gatita, especie fijada a 'gato'.
  {
    id: 'tribute-luna-spinella',
    slug: 'luna-spinella',
    petName: 'Luna',
    species: 'gato',
    speciesLabel: 'Gatita',
    photoUrl: '/images/comunidad/luna_real_clean.webp',
    yearsOrDates: '2010 - 2024',
    authorName: 'Familia Spinella',
    guardianEmail: 'familia.spinella@ejemplo.com',
    muralSlot: null,
    candlesCount: 312,
    supportCount: 94,
    hugsCount: 145,
    letters: [
      {
        id: 'letter-luna-10',
        tributeId: 'tribute-luna-spinella',
        title: 'Ayer soñé que venías a ronronearme',
        category: 'espontanea',
        categoryLabel: '🌿 Recuerdo espontáneo',
        displayDate: '14 de noviembre, 2026',
        publishedAt: '2026-11-14T21:15:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 31,
        hugsCount: 18,
        envelopeColor: 'rosa',
        message: 'Ayer soñé que saltabas a la cama y te acurrucabas a mi lado con ese ronroneo dulce que me calmaba el alma. Me desperté con una sensación tan dulce que sé con certeza que viniste a visitarme. Te amo siempre, mi reina felina.',
      },
      {
        id: 'letter-luna-9',
        tributeId: 'tribute-luna-spinella',
        title: 'Dos años de tu partida',
        category: 'aniversario',
        categoryLabel: '🕊️ Segundo Aniversario',
        displayDate: '10 de noviembre, 2026',
        publishedAt: '2026-11-10T10:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 45,
        hugsCount: 22,
        envelopeColor: 'crema',
        message: 'Dos años ya desde que cruzaste el arcoíris. Tu rincón favorito junto al ventanal sigue lleno de tu luz. Siempre serás nuestra pequeña princesa de ojos brillantes.',
      },
      {
        id: 'letter-luna-8',
        tributeId: 'tribute-luna-spinella',
        title: 'Las tardes de verano en el balcón',
        category: 'espontanea',
        categoryLabel: '🌿 Recuerdo espontáneo',
        displayDate: '15 de julio, 2026',
        publishedAt: '2026-07-15T18:30:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 24,
        hugsCount: 12,
        envelopeColor: 'lavanda',
        message: 'Hoy soplaba la misma brisa tibia que tanto te gustaba cuando mirabas a los gorriones desde la barandilla. Dejé una flor en tu sitio pensando en ti.',
      },
      {
        id: 'letter-luna-7',
        tributeId: 'tribute-luna-spinella',
        title: 'Segunda primavera en el cielo',
        category: 'cumpleanos',
        categoryLabel: '🎂 Cumpleaños celestial',
        displayDate: '20 de abril, 2026',
        publishedAt: '2026-04-20T09:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 29,
        hugsCount: 14,
        envelopeColor: 'rosa',
        message: 'Segunda primavera que florece en el cielo para ti, mi Luna. Sé que allá arriba duermes en nubes mullidas y cazas mariposas de luz.',
      },
      {
        id: 'letter-luna-6',
        tributeId: 'tribute-luna-spinella',
        title: 'Un nuevo año contigo en el corazón',
        category: 'espontanea',
        categoryLabel: '🌿 Recuerdo espontáneo',
        displayDate: '31 de diciembre, 2025',
        publishedAt: '2025-12-31T23:50:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 27,
        hugsCount: 15,
        envelopeColor: 'crema',
        message: 'Cerramos otro año llevándote bien adentro del pecho. Ningún año nuevo empieza sin darte las gracias por catorce años de pura compañía y ternura.',
      },
      {
        id: 'letter-luna-5',
        tributeId: 'tribute-luna-spinella',
        title: 'Un año entero recordándote',
        category: 'aniversario',
        categoryLabel: '🕊️ Primer Aniversario',
        displayDate: '10 de noviembre, 2025',
        publishedAt: '2025-11-10T11:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 39,
        hugsCount: 20,
        envelopeColor: 'lavanda',
        message: 'Un año entero sin escuchar tus pasos sigilosos ni sentir tus caricias en mis tobillos al llegar del trabajo. Te extrañamos tanto como el primer día.',
      },
      {
        id: 'letter-luna-4',
        tributeId: 'tribute-luna-spinella',
        title: 'Hoy cumplirías 15 años',
        category: 'cumpleanos',
        categoryLabel: '🎂 Cumpleaños en el cielo',
        displayDate: '20 de abril, 2025',
        publishedAt: '2025-04-20T10:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 33,
        hugsCount: 16,
        envelopeColor: 'rosa',
        message: 'Hoy cumplirías 15 años, mi viejita sabia. Recordamos todas las travesuras de cachorra y la serenidad con la que nos mirabas en tus últimos años.',
      },
      {
        id: 'letter-luna-3',
        tributeId: 'tribute-luna-spinella',
        title: 'Amor puro y silencioso',
        category: 'espontanea',
        categoryLabel: '🌿 Recuerdo espontáneo',
        displayDate: '14 de febrero, 2025',
        publishedAt: '2025-02-14T12:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 22,
        hugsCount: 11,
        envelopeColor: 'crema',
        message: 'El amor más leal y discreto que conocí me lo diste tú con tus ojitos entrecerrados y tus patitas amasando mi manta. Siempre serás mi gran amor.',
      },
      {
        id: 'letter-luna-2',
        tributeId: 'tribute-luna-spinella',
        title: 'Nuestra primera Navidad sin ti',
        category: 'espontanea',
        categoryLabel: '🌿 Recuerdo espontáneo',
        displayDate: '24 de diciembre, 2024',
        publishedAt: '2024-12-24T20:00:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 26,
        hugsCount: 13,
        envelopeColor: 'lavanda',
        message: 'Nuestra primera Nochebuena sin ti. Pusimos tu adorno en el árbol y dejamos tu mantita en su sillón. Sentimos tu calor presente con nosotros.',
      },
      {
        id: 'letter-luna-1',
        tributeId: 'tribute-luna-spinella',
        title: 'Carta de despedida a nuestra compañera',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '10 de noviembre, 2024',
        publishedAt: '2024-11-10T16:30:00Z',
        authorName: 'Familia Spinella',
        candlesCount: 36,
        hugsCount: 14,
        envelopeColor: 'crema',
        message: 'Gracias por catorce años de puro amor incondicional. Fuiste mi refugio en los días grises y la paz más dulce de mi vida. Descansa en paz, mi niña bonita.',
      },
    ],
  },

  // 3. ESCENARIO 5: Luna Navarro (Homónima - Perrita Golden Retriever) - 1 carta
  // Demuestra que dos homenajes con el mismo nombre tienen colecciones y fotos 100% aisladas.
  {
    id: 'tribute-luna-navarro',
    slug: 'luna-navarro',
    petName: 'Luna',
    species: 'perro',
    speciesLabel: 'Perrita',
    photoUrl: '/images/comunidad/golden_retriever_celestial_clean.webp',
    yearsOrDates: '2015 - 2025',
    authorName: 'Familia Navarro',
    guardianEmail: 'familia.navarro@ejemplo.com',
    muralSlot: null,
    candlesCount: 118,
    supportCount: 32,
    hugsCount: 54,
    letters: [
      {
        id: 'letter-luna-navarro-1',
        tributeId: 'tribute-luna-navarro',
        title: 'Nuestra noble guardiana dorada',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '5 de marzo, 2025',
        publishedAt: '2025-03-05T14:20:00Z',
        authorName: 'Familia Navarro',
        candlesCount: 118,
        hugsCount: 54,
        envelopeColor: 'lavanda',
        message: 'Nuestra preciosa Luna dorada, compañera incansable de juegos de los niños y protectora del hogar. Gracias por diez años de lealtad absoluta y sonrisas infinitas. Esta colección pertenece únicamente a ti y a nuestra familia.',
      },
    ],
  },

  // 4. ESCENARIO 4: Toby (Perro - Sin foto) - 1 carta
  // Demuestra el diseño con monograma celestial floral sin foto rota.
  {
    id: 'tribute-toby-gomez',
    slug: 'toby-gomez',
    petName: 'Toby',
    species: 'perro',
    speciesLabel: 'Perro',
    photoUrl: null, // Sin foto deliberadamente
    yearsOrDates: '2012 - 2024',
    authorName: 'Familia Gómez',
    guardianEmail: 'familia.gomez@ejemplo.com',
    muralSlot: null,
    candlesCount: 105,
    supportCount: 30,
    hugsCount: 48,
    letters: [
      {
        id: 'letter-toby-1',
        tributeId: 'tribute-toby-gomez',
        title: 'Amor sin condiciones',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '20 de octubre, 2026',
        publishedAt: '2026-10-20T14:00:00Z',
        authorName: 'Familia Gómez',
        candlesCount: 105,
        hugsCount: 48,
        envelopeColor: 'crema',
        message: 'Gracias por enseñarme lo que es el amor incondicional y por estar siempre a mi lado en cada paso. No hace falta una fotografía para ver tus ojos nobles; están grabados en mi corazón para siempre.',
      },
    ],
  },

  // 5. ESCENARIO SIN CARTAS: Milo (Gatito - Sin cartas publicadas aún) - 0 cartas
  // Demuestra el tratamiento respetuoso de colecciones vacías sin cartas disponibles.
  {
    id: 'tribute-milo-alvarez',
    slug: 'milo-alvarez',
    petName: 'Milo',
    species: 'gato',
    speciesLabel: 'Gatito',
    photoUrl: null, // Sin fotografía (usa medallón celestial)
    yearsOrDates: '2019 - 2026',
    authorName: 'Familia Álvarez',
    guardianEmail: 'familia.alvarez@ejemplo.com',
    muralSlot: null,
    candlesCount: 14,
    supportCount: 5,
    hugsCount: 9,
    letters: [], // Cero cartas deliberadamente
  },

  // 6. ESCENARIO 6B: Bruno (Perro - Con Casilla en Mural Global) - 2 cartas
  // Corrección: Imagen cambiada a 'dog_crop_from_desktop.png' (foto limpia de perro sin texto "Max").
  {
    id: 'tribute-bruno-morales',
    slug: 'bruno-morales',
    petName: 'Bruno',
    species: 'perro',
    speciesLabel: 'Perro',
    photoUrl: '/images/comunidad/dog_crop_from_desktop.png',
    yearsOrDates: '2013 - 2025',
    authorName: 'Familia Morales',
    guardianEmail: 'familia.morales@ejemplo.com',
    muralSlot: {
      assigned: true,
      row: 14,
      col: 20,
      slotLabel: 'Fila 14, Casilla 20',
    },
    candlesCount: 147,
    supportCount: 42,
    hugsCount: 65,
    letters: [
      {
        id: 'letter-bruno-2',
        tributeId: 'tribute-bruno-morales',
        title: 'Un año contemplando tu estrella en el Mural',
        category: 'aniversario',
        categoryLabel: '🕊️ Primer Aniversario',
        displayDate: '12 de enero, 2026',
        publishedAt: '2026-01-12T10:00:00Z',
        authorName: 'Familia Morales',
        candlesCount: 48,
        hugsCount: 22,
        envelopeColor: 'rosa',
        message: 'Un año ya sin ti, gran Bruno. Cada noche abrimos el Mural Global de Ángeles en el Cielo para mirar tu casilla y sabemos que tu estrella nunca dejará de brillar. Gracias por cuidarnos desde las alturas.',
      },
      {
        id: 'letter-bruno-1',
        tributeId: 'tribute-bruno-morales',
        title: 'Vuela alto, compañero noble',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '12 de enero, 2025',
        publishedAt: '2025-01-12T17:40:00Z',
        authorName: 'Familia Morales',
        candlesCount: 99,
        hugsCount: 43,
        envelopeColor: 'crema',
        message: 'Tu alegría contagiaba a todos. Eras nobleza pura, un amigo fiel que nunca se separó de nuestro lado. Descansa en paz entre las constelaciones celestiales.',
      },
    ],
  },

  // 6. ESCENARIO 1: Nano (Perro) - 1 carta
  {
    id: 'tribute-nano-cerro',
    slug: 'nano-cerro',
    petName: 'Nano',
    species: 'perro',
    speciesLabel: 'Perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/nano_1792605318398.jpg',
    yearsOrDates: '2011 - 2026',
    authorName: 'Familia Cerro',
    guardianEmail: 'familia.cerro@ejemplo.com',
    muralSlot: null,
    candlesCount: 142,
    supportCount: 45,
    hugsCount: 68,
    letters: [
      {
        id: 'letter-nano-1',
        tributeId: 'tribute-nano-cerro',
        title: 'Quince años de miradas salvadoras',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '21 de octubre, 2026',
        publishedAt: '2026-10-21T17:55:20Z',
        authorName: 'Familia Cerro',
        candlesCount: 142,
        hugsCount: 68,
        envelopeColor: 'lavanda',
        message: 'Cómo siempre te decía dándote besitos: no te amaré toda tu vida, te amaré toda la mía. Gracias por quince años de miradas que me salvaron cada día.',
      },
    ],
  },

  // 7. Martín (Perro)
  {
    id: 'tribute-martin-zarate',
    slug: 'martin-zarate',
    petName: 'Martín',
    species: 'perro',
    speciesLabel: 'Perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/1793136505911_martin.jpg',
    yearsOrDates: '2011 - 2026',
    authorName: 'Marcos Zárate',
    guardianEmail: 'marcos@ejemplo.com',
    muralSlot: null,
    candlesCount: 129,
    supportCount: 38,
    hugsCount: 59,
    letters: [
      {
        id: 'letter-martin-1',
        tributeId: 'tribute-martin-zarate',
        title: 'Ventana directa al alma',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '27 de octubre, 2026',
        publishedAt: '2026-10-27T22:28:00Z',
        authorName: 'Marcos Zárate',
        candlesCount: 129,
        hugsCount: 59,
        envelopeColor: 'crema',
        message: 'Dicen que los ojos de un perro son una ventana directa al alma, y en los tuyos, Martín, solo había bondad. Llegaste a mi vida para llenarla de una paz que no se puede explicar con palabras. Gracias por haber sido mi refugio, mi alegría y mi mejor amigo.',
      },
    ],
  },

  // 8. House (Perro)
  {
    id: 'tribute-house',
    slug: 'house',
    petName: 'House',
    species: 'perro',
    speciesLabel: 'Perro',
    photoUrl: 'https://hmfdauxrpolpvbzlxenq.supabase.co/storage/v1/object/public/pet-photos/pets/original/house_1791661708523.jpg',
    yearsOrDates: '2007 - 2020',
    authorName: 'Familia House',
    guardianEmail: 'familia.house@ejemplo.com',
    muralSlot: null,
    candlesCount: 115,
    supportCount: 35,
    hugsCount: 54,
    letters: [
      {
        id: 'letter-house-1',
        tributeId: 'tribute-house',
        title: 'Trece años de noble lealtad',
        category: 'despedida',
        categoryLabel: '💌 Primera Despedida',
        displayDate: '20 de octubre, 2026',
        publishedAt: '2026-10-20T12:00:00Z',
        authorName: 'Familia House',
        candlesCount: 115,
        hugsCount: 54,
        envelopeColor: 'rosa',
        message: 'Trece años corriendo a mi lado, esperándome tras cada puerta con la misma alegría del primer día. Descansa en paz, mi viejo y noble amigo.',
      },
    ],
  },
];
