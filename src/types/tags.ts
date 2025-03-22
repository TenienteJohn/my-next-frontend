// src/types/tags.ts
export interface Tag {
  id?: number;
  name: string;
  color: string;
  textColor?: string;
  type: 'product' | 'option' | 'item';
  visible: boolean;
  priority?: number; // Para ordenar etiquetas cuando hay múltiples
  discount?: number; // Para etiquetas de descuento (ej. 10% OFF)
  disableSelection?: boolean; // Para etiquetas como "Agotado" que no permiten selección
  isRecommended?: boolean; // Para etiquetas como "Sugerido"
}

// Tipos específicos de etiquetas
export type ProductTag = Tag & { type: 'product' };
export type OptionTag = Tag & { type: 'option' };
export type ItemTag = Tag & { type: 'item' };

// Colores predefinidos para etiquetas
export const TAG_COLORS = {
  primary: '#3b82f6', // Blue
  secondary: '#6b7280', // Gray
  success: '#10b981', // Green
  danger: '#ef4444', // Red
  warning: '#f59e0b', // Amber
  info: '#3b82f6', // Blue
  promotion: '#8b5cf6', // Purple
  new: '#ec4899', // Pink
};