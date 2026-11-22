'use client';

import React from 'react';
import { buildWorld3DDeepLink, isValidWorldSpaceId } from '@/lib/world3d/contracts';

const DEFAULT_WORLD_3D_BASE_URL =
  process.env.NEXT_PUBLIC_WORLD3D_URL ||
  'https://cielo-jardin-de-los-recuerdos.norber-spinella.chatgpt.site/cielo3d/';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface VisitarEnElCieloLinkProps {
  memorialId?: string | null;
  nombre?: string | null;
  profileSlug?: string | null;
  spaceId?: string | null;
  mode?: 'portal' | 'memorial' | 'space';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Construye la URL hacia el Mundo 3D preservando compatibilidad con `?homenaje={memorial_id}`
 * y soportando `#lugar-{space_id}` cuando la plaza esté confirmada.
 */
export function getWorld3DHref(options?: {
  memorialId?: string | null;
  profileSlug?: string | null;
  spaceId?: string | null;
  mode?: 'portal' | 'memorial' | 'space';
}): string {
  const base = DEFAULT_WORLD_3D_BASE_URL;
  if (options?.mode === 'space' && options?.spaceId && isValidWorldSpaceId(options.spaceId)) {
    return `${base.replace(/#.*$/, '')}#lugar-${options.spaceId.trim()}`;
  }

  if (options?.mode === 'portal' || !options?.memorialId) {
    return `${base.replace(/#.*$/, '')}#portal`;
  }

  const cleanId = options.memorialId.trim();
  if (!UUID_REGEX.test(cleanId)) {
    return `${base.replace(/#.*$/, '')}#portal`;
  }

  // En el cliente 3D (world.js), ?homenaje=<id> debe ir SIN fragmento #hash para abrir garden.visitById(id).
  const url = new URL(buildWorld3DDeepLink(base, {
    memorialId: cleanId,
    profileSlug: options.profileSlug,
  }));
  url.searchParams.set('homenaje', cleanId);
  url.searchParams.delete('memorial_id');
  url.hash = '';

  return url.toString();
}

export function VisitarEnElCieloLink({
  memorialId,
  nombre,
  profileSlug,
  spaceId,
  mode = 'memorial',
  label,
  className = '',
  style,
}: VisitarEnElCieloLinkProps) {
  if (mode === 'memorial' && (!memorialId || !UUID_REGEX.test(memorialId.trim()))) {
    return null;
  }

  const href = getWorld3DHref({ memorialId, profileSlug, spaceId, mode });
  const text =
    label ||
    (mode === 'portal'
      ? 'Explorar el cielo en 3D'
      : nombre
        ? `Visitar a ${nombre} en el cielo 3D`
        : 'Visitar en el cielo 3D');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={text}
      className={className}
      style={style}
    >
      {text}
    </a>
  );
}
