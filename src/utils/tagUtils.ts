// src/utils/tagUtils.ts
import axios from 'axios';

// Funciones para gestionar etiquetas de opciones
export const assignTagToOption = async (optionId: number, tagId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    await axios.post(
      `/api/tags/assign-option/${optionId}/${tagId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error('Error al asignar etiqueta a opción:', error);
    throw error;
  }
};

export const removeTagFromOption = async (optionId: number, tagId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    await axios.delete(
      `/api/tags/assign-option/${optionId}/${tagId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error('Error al quitar etiqueta de opción:', error);
    throw error;
  }
};

// Funciones para gestionar etiquetas de ítems
export const assignTagToItem = async (itemId: number, tagId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    await axios.post(
      `/api/tags/assign-item/${itemId}/${tagId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error('Error al asignar etiqueta a ítem:', error);
    throw error;
  }
};

export const removeTagFromItem = async (itemId: number, tagId: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    await axios.delete(
      `/api/tags/assign-item/${itemId}/${tagId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error('Error al quitar etiqueta de ítem:', error);
    throw error;
  }
};

// Función para actualizar etiquetas (compara listas y hace las operaciones necesarias)
export const updateTagAssignments = async (
  entityId: number,
  currentTags: number[],
  newTags: number[],
  entityType: 'option' | 'item'
): Promise<void> => {
  try {
    // Determinar qué etiquetas hay que añadir
    const tagsToAdd = newTags.filter(id => !currentTags.includes(id));

    // Determinar qué etiquetas hay que quitar
    const tagsToRemove = currentTags.filter(id => !newTags.includes(id));

    // Realizar las operaciones
    const operations = [];

    if (entityType === 'option') {
      for (const tagId of tagsToAdd) {
        operations.push(assignTagToOption(entityId, tagId));
      }

      for (const tagId of tagsToRemove) {
        operations.push(removeTagFromOption(entityId, tagId));
      }
    } else { // 'item'
      for (const tagId of tagsToAdd) {
        operations.push(assignTagToItem(entityId, tagId));
      }

      for (const tagId of tagsToRemove) {
        operations.push(removeTagFromItem(entityId, tagId));
      }
    }

    // Ejecutar todas las operaciones
    await Promise.all(operations);
  } catch (error) {
    console.error(`Error al actualizar etiquetas de ${entityType}:`, error);
    throw error;
  }
};