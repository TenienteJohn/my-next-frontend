// src/utils/dataTransformers.ts

// Función para normalizar las etiquetas recibidas del backend
export function normalizeTag(tagData: any): any {
  if (!tagData) return null;

  // Crea una copia para evitar modificar el original
  const normalizedTag = { ...tagData };

  // Normaliza las propiedades específicas
  if ('text_color' in normalizedTag) {
    normalizedTag.textColor = normalizedTag.text_color;
  }

  if ('disable_selection' in normalizedTag) {
    normalizedTag.disableSelection = normalizedTag.disable_selection;
  }

  if ('is_recommended' in normalizedTag) {
    normalizedTag.isRecommended = normalizedTag.is_recommended;
  }

  return normalizedTag;
}

// Función para normalizar un array de etiquetas
export function normalizeTags(tags: any[]): any[] {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.map(normalizeTag);
}