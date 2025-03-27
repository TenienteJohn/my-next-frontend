// src/hooks/useTagManager.ts
import { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/types/tags';
import api from '@/utils/api';
import {
  assignTagToProduct,
  removeTagFromProduct,
  assignTagToOption,
  removeTagFromOption,
  assignTagToItem,
  removeTagFromItem,
  showToast
} from '@/utils/tagUtils';

interface UseTagManagerProps {
  entityId?: number;
  entityType: 'product' | 'option' | 'item';
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

export function useTagManager({
  entityId,
  entityType,
  initialTags = [],
  onTagsChange
}: UseTagManagerProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar etiquetas disponibles
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/tags');

        // Filtrar por tipo de entidad
        const filteredTags = response.data.filter((tag: Tag) => tag.type === entityType);
        setAvailableTags(filteredTags);
      } catch (err) {
        console.error(`Error al cargar etiquetas de ${entityType}:`, err);
        setError(`Error al cargar etiquetas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTags();
  }, [entityType]);

  // Función para actualizar las etiquetas
  const updateTags = useCallback((newTags: Tag[]) => {
    setTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  }, [onTagsChange]);

  // Función para añadir una etiqueta
  const addTag = useCallback(async (tag: Tag) => {
    try {
      setLoading(true);
      setError(null);

      // Si no hay ID de entidad, solo actualiza el estado local
      if (!entityId) {
        updateTags([...tags, tag]);
        return;
      }

      // Intentar asignar la etiqueta mediante la API
      if (entityType === 'product') {
        await assignTagToProduct(entityId, tag.id);
      } else if (entityType === 'option') {
        await assignTagToOption(entityId, tag.id);
      } else { // item
        await assignTagToItem(entityId, tag.id);
      }

      // Actualizar el estado local
      updateTags([...tags, tag]);

      // Mostrar notificación de éxito
      showToast(`Etiqueta "${tag.name}" añadida correctamente`, 'success');
    } catch (err) {
      console.error(`Error al añadir etiqueta ${tag.id} a ${entityType} ${entityId}:`, err);
      setError(`Error al añadir etiqueta: ${err.message}`);
      showToast(`Error al añadir etiqueta: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, tags, updateTags]);

  // Función para eliminar una etiqueta
  const removeTag = useCallback(async (tag: Tag) => {
    try {
      setLoading(true);
      setError(null);

      // Si no hay ID de entidad, solo actualiza el estado local
      if (!entityId) {
        updateTags(tags.filter(t => t.id !== tag.id));
        return;
      }

      // Intentar eliminar la etiqueta mediante la API
      if (entityType === 'product') {
        await removeTagFromProduct(entityId, tag.id);
      } else if (entityType === 'option') {
        await removeTagFromOption(entityId, tag.id);
      } else { // item
        await removeTagFromItem(entityId, tag.id);
      }

      // Actualizar el estado local
      updateTags(tags.filter(t => t.id !== tag.id));

      // Mostrar notificación de éxito
      showToast(`Etiqueta "${tag.name}" eliminada correctamente`, 'success');
    } catch (err) {
      console.error(`Error al eliminar etiqueta ${tag.id} de ${entityType} ${entityId}:`, err);
      setError(`Error al eliminar etiqueta: ${err.message}`);
      showToast(`Error al eliminar etiqueta: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, tags, updateTags]);

  // Función para comprobar si una etiqueta está seleccionada
  const isTagSelected = useCallback((tagId: number) => {
    return tags.some(tag => tag.id === tagId);
  }, [tags]);

  // Función para alternar una etiqueta (añadir o eliminar)
  const toggleTag = useCallback(async (tag: Tag) => {
    if (isTagSelected(tag.id)) {
      await removeTag(tag);
    } else {
      await addTag(tag);
    }
  }, [isTagSelected, removeTag, addTag]);

  return {
    tags,
    availableTags,
    loading,
    error,
    setTags: updateTags,
    addTag,
    removeTag,
    toggleTag,
    isTagSelected
  };
}