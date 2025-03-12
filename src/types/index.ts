// src/types/index.ts

// Tipo genérico para errores
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// Tipo para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Tipo para manejadores de errores
export type ErrorHandler = (error: unknown) => void;