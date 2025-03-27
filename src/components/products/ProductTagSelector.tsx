// src/components/products/ProductTagSelector.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { Tag } from '@/types/tags';
import api from '@/utils/api';
import { getProductTags } from '@/utils/tagUtils';

interface ProductTagSelectorProps {
  productId?: number;
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const ProductTagSelector: React.FC<ProductTagSelectorProps> = ({
  productId,
  selectedTags = [],
  onChange
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar etiquetas disponibles al montar el componente
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/tags');

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

  // Cargar etiquetas asignadas al producto cuando tenemos un ID de producto
  useEffect(() => {
    if (!productId) return;

    const fetchAssignedTags = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener etiquetas asignadas a este producto
        const assignedTags = await getProductTags(productId);

        if (Array.isArray(assignedTags) && assignedTags.length > 0) {
          console.log(`Etiquetas asignadas al producto ${productId}:`, assignedTags);

          // Solo actualizar si hay cambios para evitar bucles
          if (JSON.stringify(selectedTags.map(t => t.id).sort()) !==
              JSON.stringify(assignedTags.map(t => t.id).sort())) {
            onChange(assignedTags);
          }
        } else {
          console.log(`No se encontraron etiquetas para el producto ${productId}`);
        }
      } catch (err) {
        console.error('Error al cargar etiquetas asignadas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTags();
  }, [productId]);

  // Verifica si una etiqueta está seleccionada
  const isTagSelected = (tagId: number | undefined): boolean => {
    if (!tagId) return false;
    return selectedTags.some(tag => tag.id === tagId);
  };

  // Función para asignar etiqueta directamente a través de la API
  const handleAssignTag = async (tag: Tag) => {
    if (!productId || !tag.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Asignando etiqueta ${tag.id} al producto ${productId}`);

      // Llamada directa a la API para asignar la etiqueta
      await api.post(`/api/tags/assign-product/${productId}/${tag.id}`, {});

      // Actualizar el estado local
      onChange([...selectedTags, tag]);

      console.log(`Etiqueta ${tag.id} asignada correctamente`);
    } catch (err) {
      console.error(`Error al asignar etiqueta ${tag.id}:`, err);
      setError(`Error al asignar etiqueta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar etiqueta directamente a través de la API
  const handleRemoveTag = async (tag: Tag) => {
    if (!productId || !tag.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`Eliminando etiqueta ${tag.id} del producto ${productId}`);

      // Llamada directa a la API para eliminar la etiqueta
      await api.delete(`/api/tags/assign-product/${productId}/${tag.id}`);

      // Actualizar el estado local
      onChange(selectedTags.filter(t => t.id !== tag.id));

      console.log(`Etiqueta ${tag.id} eliminada correctamente`);
    } catch (err) {
      console.error(`Error al eliminar etiqueta ${tag.id}:`, err);
      setError(`Error al eliminar etiqueta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Maneja la selección/deselección de etiquetas
  const handleToggleTag = (tag: Tag, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    console.log(`Toggling product tag: ${tag.name} (${tag.id})`);

    if (isTagSelected(tag.id)) {
                console.log(`Deseleccionando etiqueta de producto: ${tag.name} (${tag.id})`);

                if (productId) {
                  // Si tenemos un ID de producto, usar la API directa
                  handleRemoveTag(tag);
                } else {
                  // Si no hay ID de producto, solo actualizar el estado local
                  const newTags = selectedTags.filter(t => t.id !== tag.id);
                  console.log('Nueva lista de etiquetas:', newTags);
                  onChange(newTags);
                }
              } else {
                console.log(`Seleccionando etiqueta de producto: ${tag.name} (${tag.id})`);

                if (productId) {
                  // Si tenemos un ID de producto, usar la API directa
                  handleAssignTag(tag);
                } else {
                  // Si no hay ID de producto, solo actualizar el estado local
                  const newTags = [...selectedTags, tag];
                  console.log('Nueva lista de etiquetas:', newTags);
                  onChange(newTags);
                }
              }
            };

            // Función específica para eliminar etiqueta desde la sección de seleccionadas
            const handleRemoveTagFromSelected = (tag: Tag, event: React.MouseEvent) => {
              event.preventDefault();
              event.stopPropagation();

              console.log(`Eliminando etiqueta de producto: ${tag.name} (${tag.id})`);

              if (productId) {
                // Si tenemos un ID de producto, usar la API directa
                handleRemoveTag(tag);
              } else {
                // Si no hay ID de producto, solo actualizar el estado local
                const newTags = selectedTags.filter(t => t.id !== tag.id);
                console.log('Nueva lista de etiquetas después de eliminar:', newTags);
                onChange(newTags);
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
                  No hay etiquetas disponibles. <a href="/config/tags" className="text-blue-500 hover:underline">Crear etiquetas</a>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas de Producto
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
                            onClick={(e) => handleRemoveTagFromSelected(tag, e)}
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
                      onClick={(e) => handleToggleTag(tag, e)}
                      className={`relative group flex items-center rounded-md ${
                        isTagSelected(tag.id) ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
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
                        <div className="bg-white rounded-full -mr-1 ml-1 w-4 h-4 flex items-center justify-center">
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