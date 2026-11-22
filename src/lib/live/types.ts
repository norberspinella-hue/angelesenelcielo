export type LiveEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'quitado';
export type LiveRitmo = 'normal' | 'rapido';
export type LiveEscenaOutput = 'video' | 'cielo';
export type LiveLectorEstado = 'desconectado' | 'conectando' | 'conectado' | 'error';
export type LiveOrigen = 'chat' | 'manual' | 'prueba';

export interface LiveSesion {
  id: string;
  titulo: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface LiveAjustesPublicos {
  id: number;
  sesion_id: string | null;
  max_perritos: number;
  por_usuario: number;
  comando: string;
  centro: string;
  ritmo: LiveRitmo;
  instruccion: boolean;
  escena_output: LiveEscenaOutput;
  updated_at: string;
}

export interface LiveAjustes extends LiveAjustesPublicos {
  auto_aprobar: boolean;
  tiktok_usuario: string | null;
  lector_activo: boolean;
  lector_estado: LiveLectorEstado;
  lector_detalle: string | null;
  lector_visto_at: string | null;
}

export interface LivePerrito {
  id: string;
  sesion_id: string;
  estado: LiveEstado;
  nombre: string;
  tiempo: string;
  tiktok_usuario: string | null;
  tiktok_apodo: string | null;
  texto_original: string | null;
  origen: LiveOrigen;
  slot: number | null;
  sube_at: string | null;
  duracion_ms: number | null;
  created_at: string;
  aprobado_at: string | null;
  quitado_at: string | null;
}
