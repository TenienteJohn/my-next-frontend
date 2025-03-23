// src/components/products/ProductTagSelector.tsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { Tag } from '@/types/tags';

interface ProductTagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const ProductTagSelector: React.FC<ProductTagSelectorProps> = ({ selectedTags = [], onChange }) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar etiquetas disponibles al montar el componente
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const response = await axios.get('/api/tags', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filtrar etiquetas por tipo 'product'
        const productTags = response.data.filter((tag: Tag) => tag.type === 'product');
        setAvailableTags(productTags);
      } catch (err) {
        console.error('Error al cargar etiquetas:', err);
        setError('Error al cargar etiquetas');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Verifica si una etiqueta está seleccionada
  const isTagSelected = (tagId: number | undefined): boolean => {
    if (!tagId) return false;
    return selectedTags.some(tag => tag.id === tagId);
  };

  // Maneja la selección/deselección de etiquetas
  const handleToggleTag = (tag: Tag) => {
    if (isTagSelected(tag.id)) {
      // Eliminar etiqueta si ya está seleccionada
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      // Agregar etiqueta si no está seleccionada
      onChange([...selectedTags, tag]);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Cargando etiquetas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (availableTags.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No hay etiquetas disponibles. <a href="/config/tags" className="text-blue-500 hover:underline">Crear etiquetas</a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Etiquetas de Producto
      </label>
      <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
        {availableTags.map(tag => (
          <button
            key={tag.id}
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

export default ProductTagSelector;