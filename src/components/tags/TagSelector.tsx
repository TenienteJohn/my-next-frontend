// src/components/tags/TagSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X } from 'lucide-react';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { Tag } from '@/types/tags';
import api from '@/utils/api'; // Importamos la instancia de api configurada

interface TagSelectorProps {
  type: 'product' | 'option' | 'item';
  entityId?: number; // ID de la entidad (producto, opción o ítem)
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  type,
  entityId,
  selectedTags = [],
  onChange
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/tags');

        // Filtrar etiquetas por tipo
        const filteredTags = response.data.filter(tag => tag.type === type);
        setAvailableTags(filteredTags);
      } catch (err) {
        console.error('Error al cargar etiquetas:', err);
        setError('Error al cargar etiquetas');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [type]);

  const isTagSelected = (tagId: number) => {
    return selectedTags.some(tag => tag.id === tagId);
  };

  const handleToggleTag = (tag: Tag) => {
    if (isTagSelected(tag.id)) {
      // Si hay un entityId, intentar eliminar directamente a través de la API
      if (entityId) {
        handleRemoveTagFromEntity(tag);
      } else {
        // Eliminar etiqueta del estado local si no tenemos entityId
        onChange(selectedTags.filter(t => t.id !== tag.id));
      }
    } else {
      // Agregar etiqueta
      if (entityId) {
        handleAddTagToEntity(tag);
      } else {
        onChange([...selectedTags, tag]);
      }
    }
  };

  // Función para eliminar etiqueta directamente a través de la API
  const handleRemoveTagFromEntity = async (tag: Tag) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Eliminando etiqueta ${tag.id} de ${type} ${entityId}`);

      // Determinar la URL basada en el tipo de entidad
      let endpoint;
      if (type === 'product') {
        endpoint = `/api/tags/assign-product/${entityId}/${tag.id}`;
      } else if (type === 'option') {
        endpoint = `/api/tags/assign-option/${entityId}/${tag.id}`;
      } else { // 'item'
        endpoint = `/api/tags/assign-item/${entityId}/${tag.id}`;
      }

      // Realizar la solicitud DELETE
      await api.delete(endpoint);

      // Actualizar el estado local si la eliminación fue exitosa
      onChange(selectedTags.filter(t => t.id !== tag.id));

      console.log(`Etiqueta ${tag.id} eliminada correctamente`);
    } catch (err) {
      console.error(`Error al eliminar etiqueta ${tag.id}:`, err);
      setError(`Error al eliminar etiqueta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir etiqueta directamente a través de la API
  const handleAddTagToEntity = async (tag: Tag) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Asignando etiqueta ${tag.id} a ${type} ${entityId}`);

      // Determinar la URL basada en el tipo de entidad
      let endpoint;
      if (type === 'product') {
        endpoint = `/api/tags/assign-product/${entityId}/${tag.id}`;
      } else if (type === 'option') {
        endpoint = `/api/tags/assign-option/${entityId}/${tag.id}`;
      } else { // 'item'
        endpoint = `/api/tags/assign-item/${entityId}/${tag.id}`;
      }

      // Realizar la solicitud POST
      await api.post(endpoint, {});

      // Actualizar el estado local si la asignación fue exitosa
      onChange([...selectedTags, tag]);

      console.log(`Etiqueta ${tag.id} asignada correctamente`);
    } catch (err) {
      console.error(`Error al asignar etiqueta ${tag.id}:`, err);
      setError(`Error al asignar etiqueta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar etiqueta directamente
  const handleRemoveTag = (tag: Tag, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (entityId) {
      handleRemoveTagFromEntity(tag);
    } else {
      onChange(selectedTags.filter(t => t.id !== tag.id));
    }
  };

  if (loading && !selectedTags.length && !availableTags.length) {
    return <div className="text-gray-500 text-sm">Cargando etiquetas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (availableTags.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No hay etiquetas disponibles. <a href="/admin/tags" className="text-blue-500 hover:underline">Crear etiquetas</a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Etiquetas ({type === 'product' ? 'Producto' : type === 'option' ? 'Opción' : 'Ítem'})
      </label>

      {/* Mostrar etiquetas seleccionadas en una sección separada para facilitar eliminación */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-500 mb-1">Etiquetas seleccionadas:</div>
          <div className="flex flex-wrap gap-2 p-2 border rounded bg-blue-50">
            {selectedTags.map(tag => (
              <div key={`selected-${tag.id}`} className="flex items-center">
                <TagComponent
                  name={tag.name}
                  color={tag.color}
                  textColor={tag.textColor || '#FFFFFF'}
                  discount={tag.discount}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(tag, e)}
                  className="bg-white rounded-full -ml-1 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-red-50"
                  title="Quitar etiqueta"
                >
                  <X size={12} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
        {availableTags.map(tag => (
          <button
            key={`available-${tag.id}`}
            type="button"
            onClick={() => handleToggleTag(tag)}
            className={`flex items-center rounded-md ${
              isTagSelected(tag.id) ? 'ring-2 ring-offset-1 ring-blue-500' : ''
            }`}
            title={isTagSelected(tag.id) ? "Quitar etiqueta" : "Añadir etiqueta"}
          >
            <TagComponent
              name={tag.name}
              color={tag.color}
              textColor={tag.textColor || '#FFFFFF'}
              discount={tag.discount}
              size="sm"
            />
            {isTagSelected(tag.id) && (
              <div className="bg-white rounded-full ml-1 -mr-1 w-4 h-4 flex items-center justify-center">
                <Check size={12} className="text-green-600" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;