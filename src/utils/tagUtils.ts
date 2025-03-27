// src/utils/tagUtils.ts
import api from './api';

// Funciones para gestionar etiquetas de productos con mejor manejo de errores
export const assignTagToProduct = async (productId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Asignando etiqueta ${tagId} al producto ${productId}`);

    // Verificar que los valores sean válidos
    if (isNaN(Number(productId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: productId=${productId}, tagId=${tagId}`);
    }

    const response = await api.post(
      `/api/tags/assign-product/${productId}/${tagId}`,
      {}
    );

    console.log(`Etiqueta ${tagId} asignada al producto ${productId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al asignar etiqueta a producto:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

export const removeTagFromProduct = async (productId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Eliminando etiqueta ${tagId} del producto ${productId}`);

    // Verificar que los valores sean válidos
    if (isNaN(Number(productId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: productId=${productId}, tagId=${tagId}`);
    }

    const response = await api.delete(
      `/api/tags/assign-product/${productId}/${tagId}`
    );

    console.log(`Etiqueta ${tagId} eliminada del producto ${productId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al quitar etiqueta de producto:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

// Funciones para gestionar etiquetas de opciones
export const assignTagToOption = async (optionId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Asignando etiqueta ${tagId} a la opción ${optionId}`);

    // Verificar que los valores sean válidos
    if (isNaN(Number(optionId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: optionId=${optionId}, tagId=${tagId}`);
    }

    const response = await api.post(
      `/api/tags/assign-option/${optionId}/${tagId}`,
      {}
    );

    console.log(`Etiqueta ${tagId} asignada a la opción ${optionId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al asignar etiqueta a opción:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

export const removeTagFromOption = async (optionId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Eliminando etiqueta ${tagId} de la opción ${optionId}`);

    // Verificar que los valores sean válidos
    if (isNaN(Number(optionId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: optionId=${optionId}, tagId=${tagId}`);
    }

    const response = await api.delete(
      `/api/tags/assign-option/${optionId}/${tagId}`
    );

    console.log(`Etiqueta ${tagId} eliminada de la opción ${optionId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al quitar etiqueta de opción:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

// Funciones para gestionar etiquetas de ítems
export const assignTagToItem = async (itemId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Asignando etiqueta ${tagId} al ítem ${itemId}`);

    // Verificar que los valores sean válidos
    if (isNaN(Number(itemId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: itemId=${itemId}, tagId=${tagId}`);
    }

    const response = await api.post(
      `/api/tags/assign-item/${itemId}/${tagId}`,
      {}
    );

    console.log(`Etiqueta ${tagId} asignada al ítem ${itemId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al asignar etiqueta a ítem:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

export const removeTagFromItem = async (itemId: number, tagId: number): Promise<void> => {
  try {
    console.log(`Eliminando etiqueta ${tagId} del ítem ${itemId}`);

    // Asegurar que los parámetros sean números
    if (isNaN(Number(itemId)) || isNaN(Number(tagId))) {
      throw new Error(`Parámetros inválidos: itemId=${itemId}, tagId=${tagId}`);
    }

    const response = await api.delete(
      `/api/tags/assign-item/${itemId}/${tagId}`
    );

    console.log(`Etiqueta ${tagId} eliminada del ítem ${itemId}`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error al quitar etiqueta de ítem:', error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    throw error;
  }
};

// Función para obtener las etiquetas de un producto
export const getProductTags = async (productId: number) => {
  try {
    console.log(`Obteniendo etiquetas para el producto ${productId}`);

    // Verificar que el ID de producto sea válido
    if (isNaN(Number(productId))) {
      throw new Error(`ID de producto inválido: ${productId}`);
    }

    const response = await api.get(`/api/tags/product/${productId}`);
    console.log(`Etiquetas obtenidas para el producto ${productId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener etiquetas del producto ${productId}:`, error);
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
      console.error('Estado HTTP:', error.response.status);
    }
    // Si hay un error, devolvemos un array vacío para manejar mejor la situación
    return [];
  }
};

// Función para actualizar etiquetas (compara listas y hace las operaciones necesarias)
export const updateTagAssignments = async (
  entityId: number,
  currentTags: number[],
  newTags: number[],
  entityType: 'product' | 'option' | 'item'
): Promise<void> => {
  try {
    console.log('Iniciando actualización de etiquetas:', {
      entityType,
      entityId,
      currentTags,
      newTags
    });

    // Filtrar etiquetas nulas o indefinidas
    const filteredCurrentTags = currentTags.filter(id => id !== undefined && id !== null);
    const filteredNewTags = newTags.filter(id => id !== undefined && id !== null);

    console.log('Etiquetas filtradas:', {
      filteredCurrentTags,
      filteredNewTags
    });

    // Determinar qué etiquetas hay que añadir
    const tagsToAdd = filteredNewTags.filter(id => !filteredCurrentTags.includes(id));

    // Determinar qué etiquetas hay que quitar
    const tagsToRemove = filteredCurrentTags.filter(id => !filteredNewTags.includes(id));

    console.log('Operaciones a realizar:', {
      tagsToAdd,
      tagsToRemove
    });

    if (entityType === 'product') {
      // Primero procesar eliminaciones
      for (const tagId of tagsToRemove) {
        try {
          console.log(`Intentando eliminar etiqueta ${tagId} del producto ${entityId}...`);
          await api.delete(`/api/tags/assign-product/${entityId}/${tagId}`);
          console.log(`Etiqueta ${tagId} eliminada con éxito del producto ${entityId}`);
        } catch (err) {
          console.error(`Error al eliminar etiqueta ${tagId} del producto ${entityId}:`, err);
        }
      }

      // Después procesar adiciones
      for (const tagId of tagsToAdd) {
        try {
          await api.post(`/api/tags/assign-product/${entityId}/${tagId}`, {});
          console.log(`Etiqueta ${tagId} asignada con éxito al producto ${entityId}`);
        } catch (err) {
          console.error(`Error al asignar etiqueta ${tagId} al producto ${entityId}:`, err);
        }
      }
    } else if (entityType === 'option') {
      // Primero procesar eliminaciones
      for (const tagId of tagsToRemove) {
        try {
          console.log(`Intentando eliminar etiqueta ${tagId} de la opción ${entityId}...`);
          await api.delete(`/api/tags/assign-option/${entityId}/${tagId}`);
          console.log(`Etiqueta ${tagId} eliminada con éxito de la opción ${entityId}`);
        } catch (err) {
          console.error(`Error al eliminar etiqueta ${tagId} de la opción ${entityId}:`, err);
        }
      }

      // Después procesar adiciones
      for (const tagId of tagsToAdd) {
        try {
          await api.post(`/api/tags/assign-option/${entityId}/${tagId}`, {});
          console.log(`Etiqueta ${tagId} asignada con éxito a la opción ${entityId}`);
        } catch (err) {
          console.error(`Error al asignar etiqueta ${tagId} a la opción ${entityId}:`, err);
        }
      }
    } else { // 'item'
      // Primero procesar eliminaciones
      for (const tagId of tagsToRemove) {
        try {
          console.log(`Intentando eliminar etiqueta ${tagId} del ítem ${entityId}...`);
          await api.delete(`/api/tags/assign-item/${entityId}/${tagId}`);
          console.log(`Etiqueta ${tagId} eliminada con éxito del ítem ${entityId}`);
        } catch (err) {
          console.error(`Error al eliminar etiqueta ${tagId} del ítem ${entityId}:`, err);
        }
      }

      // Después procesar adiciones
      for (const tagId of tagsToAdd) {
        try {
          await api.post(`/api/tags/assign-item/${entityId}/${tagId}`, {});
          console.log(`Etiqueta ${tagId} asignada con éxito al ítem ${entityId}`);
        } catch (err) {
          console.error(`Error al asignar etiqueta ${tagId} al ítem ${entityId}:`, err);
        }
      }
    }

    console.log('Actualización de etiquetas completada');
  } catch (error) {
    console.error(`Error al actualizar etiquetas de ${entityType}:`, error);
    throw error;
  }
};

// Función para mostrar notificaciones toast
export const showToast = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  duration: number = 3000
): void => {
  // Crear el elemento toast
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 flex items-center transition-opacity duration-300 ease-in-out`;

  // Configurar el estilo según el tipo
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500', 'text-white');
      break;
    case 'error':
      toast.classList.add('bg-red-500', 'text-white');
      break;
    case 'warning':
      toast.classList.add('bg-yellow-500', 'text-white');
      break;
    case 'info':
    default:
      toast.classList.add('bg-blue-500', 'text-white');
      break;
  }

  // Crear icono según el tipo
  const icon = document.createElement('span');
  icon.className = 'mr-2';
  switch (type) {
    case 'success':
      icon.innerHTML = '✓';
      break;
    case 'error':
      icon.innerHTML = '✗';
      break;
    case 'warning':
      icon.innerHTML = '⚠';
      break;
    case 'info':
    default:
      icon.innerHTML = 'ℹ';
      break;
  }

  // Agregar el icono y el mensaje al toast
  toast.appendChild(icon);
  toast.appendChild(document.createTextNode(message));

  // Agregar el toast al documento
  document.body.appendChild(toast);

  // Después de un momento, iniciar la animación de desvanecimiento
  setTimeout(() => {
    toast.classList.add('opacity-0');

    // Eliminar el elemento después de que termine la animación
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
};