/**
 * Ficha única de planes de Ángeles en el Cielo.
 *
 * Aquí vive TODO lo que define a un plan: tamaño, precios, textos y nombres
 * internos. El resto de la aplicación debe leer de este archivo en lugar de
 * repetir los datos.
 *
 * IMPORTANTE – dos juegos de nombres:
 *  - `id` es el nombre PÚBLICO del plan (web, Stripe, checkout).
 *  - `dbName` es el nombre HEREDADO que se guarda en Supabase
 *    (columnas `plan_type`). Se mantiene tal cual para no tocar los datos ya
 *    existentes. No lo cambies sin migrar antes la base de datos.
 *
 * Este archivo se importa también desde componentes de cliente, por eso NO
 * lee `process.env` aquí: solo guarda el NOMBRE de la variable de Stripe y es
 * el código de servidor quien la lee.
 */

export type PlanId =
  | 'huellita'
  | 'estrella_brillante'
  | 'corazon_eterno'
  | 'angelito_protector'
  | 'galaxia_amor'
  | 'vinculo_infinito';

/** Monedas con precio publicado. */
export type PlanCurrency = 'EUR' | 'USD';

export interface PlanConfig {
  /** Nombre público (web, Stripe, checkout). */
  id: PlanId;
  /** Título visible para el usuario. */
  title: string;
  /** Nombre heredado guardado en Supabase (`plan_type`). */
  dbName: string;
  /** Lado del bloque cuadrado en el mural (NxN). */
  size: number;
  /** Número de espacios que ocupa (size × size). */
  slotsCount: number;
  /** Nombre de la variable de entorno con el price_... de Stripe. */
  stripePriceEnvVar: string;
  /** Precio ya formateado para mostrar, por moneda. */
  price: Record<PlanCurrency, string>;
  /** Si el plan se cobra por periodo, texto del periodo (ej. 'año'). */
  period?: string;
  /** Duración en el selector de plan del drawer. */
  durationShort: string;
  /** Duración en el resumen de checkout. */
  durationLong: string;
  /** Icono/etiqueta del selector de plan del drawer. */
  drawerIcon: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  huellita: {
    id: 'huellita',
    title: 'Huellita',
    dbName: 'recuerdo_inicial',
    size: 1,
    slotsCount: 1,
    stripePriceEnvVar: 'STRIPE_PRICE_HUELLITA',
    price: { EUR: '1,99 €', USD: '$1.99' },
    period: 'año',
    durationShort: '/ año',
    durationLong: '1 año',
    drawerIcon: '⭐',
  },
  estrella_brillante: {
    id: 'estrella_brillante',
    title: 'Estrella Brillante',
    dbName: 'estrella_anual',
    size: 2,
    slotsCount: 4,
    stripePriceEnvVar: 'STRIPE_PRICE_ESTRELLA_BRILLANTE',
    price: { EUR: '4,99 €', USD: '$4.99' },
    durationShort: 'Para siempre',
    durationLong: 'Para siempre',
    drawerIcon: '⭐⭐⭐⭐',
  },
  corazon_eterno: {
    id: 'corazon_eterno',
    title: 'Corazón Eterno',
    dbName: 'recuerdo_eterno',
    size: 3,
    slotsCount: 9,
    stripePriceEnvVar: 'STRIPE_PRICE_CORAZON_ETERNO',
    price: { EUR: '9,99 €', USD: '$9.99' },
    durationShort: 'Para siempre',
    durationLong: 'Para siempre',
    drawerIcon: '⭐ 3x3',
  },
  angelito_protector: {
    id: 'angelito_protector',
    title: 'Ángelito Protector',
    dbName: 'angelito_protector',
    size: 4,
    slotsCount: 16,
    stripePriceEnvVar: 'STRIPE_PRICE_ANGELITO_PROTECTOR',
    price: { EUR: '14,99 €', USD: '$14.99' },
    durationShort: 'Para siempre',
    durationLong: 'Para siempre',
    drawerIcon: '🌟 4x4',
  },
  galaxia_amor: {
    id: 'galaxia_amor',
    title: 'Galaxia de Amor',
    dbName: 'galaxia_amor',
    size: 5,
    slotsCount: 25,
    stripePriceEnvVar: 'STRIPE_PRICE_GALAXIA_AMOR',
    price: { EUR: '19,99 €', USD: '$19.99' },
    durationShort: 'Para siempre',
    durationLong: 'Para siempre',
    drawerIcon: '💫 5x5',
  },
  vinculo_infinito: {
    id: 'vinculo_infinito',
    title: 'Vínculo Infinito',
    dbName: 'vinculo_infinito',
    size: 6,
    slotsCount: 36,
    stripePriceEnvVar: 'STRIPE_PRICE_VINCULO_INFINITO',
    price: { EUR: '29,99 €', USD: '$29.99' },
    durationShort: 'Para siempre',
    durationLong: 'Para siempre',
    drawerIcon: '♾️ 6x6',
  },
};

/** Planes en el orden en que se muestran al usuario. */
export const PLAN_ORDER: PlanId[] = [
  'huellita',
  'estrella_brillante',
  'corazon_eterno',
  'angelito_protector',
  'galaxia_amor',
  'vinculo_infinito',
];

/**
 * IDs por defecto para entornos donde la variable aún no se ha configurado en Vercel.
 * Permite que los nuevos planes funcionen inmediatamente sin esperar a guardar en el dashboard.
 */
export const DEFAULT_STRIPE_PRICES: Partial<Record<PlanId, string>> = {
  angelito_protector: 'price_1URSCnEky7gqHQh1vtALXm6Y',
  galaxia_amor: 'price_1URSCoEky7gqHQh1uFiMucpb',
  vinculo_infinito: 'price_1URSCoEky7gqHQh1a5QkhDMO',
};

/**
 * IDs de Stripe obsoletos o inactivos que deben ser redirigidos automáticamente
 * a su sustituto activo si las variables de entorno de producción no se han actualizado.
 */
export const LEGACY_STRIPE_PRICE_FALLBACKS: Record<string, string> = {
  // Precio one-time original de Huellita archivado en Stripe -> sustituto recurrente anual activo
  'price_1UPP2vEky7gqHQh1rua0O7EL': 'price_1UPiQnEky7gqHQh1JIGVjWLq',
};

/** Plan por defecto cuando el id recibido no se reconoce. */
export const DEFAULT_PLAN_ID: PlanId = 'huellita';

/** Devuelve true si `value` es un id público de plan válido. */
export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);
}

/** Plan a partir del id público; `undefined` si no existe. */
export function getPlan(id: string | null | undefined): PlanConfig | undefined {
  return isPlanId(id) ? PLANS[id] : undefined;
}

/** Plan a partir del id público, con el plan por defecto si no existe. */
export function getPlanOrDefault(id: string | null | undefined): PlanConfig {
  return getPlan(id) ?? PLANS[DEFAULT_PLAN_ID];
}

/** Plan a partir del nombre heredado de la base de datos; `undefined` si no existe. */
export function getPlanByDbName(dbName: string | null | undefined): PlanConfig | undefined {
  if (!dbName) return undefined;
  return PLAN_ORDER.map((id) => PLANS[id]).find((p) => p.dbName === dbName);
}

/** Etiqueta de espacios: '1 espacio' / '4 espacios'. */
export function slotsLabel(plan: PlanConfig): string {
  return plan.slotsCount === 1 ? '1 espacio' : `${plan.slotsCount} espacios`;
}

/**
 * Precio formateado. Con `showPeriod` y un plan por periodo añade ' / año'.
 * Reproduce el formato histórico de `formatPrice`.
 */
export function formatPlanPrice(
  plan: PlanConfig,
  currency: PlanCurrency,
  options?: { showPeriod?: boolean }
): string {
  const base = plan.price[currency];
  if (options?.showPeriod && plan.period) {
    return `${base} / ${plan.period}`;
  }
  return base;
}
