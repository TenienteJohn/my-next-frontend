// src/components/products/ProductOptionsEditor.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Plus, X, Trash2, Edit, Check, Upload, Image as ImageIcon, Tag as TagIcon } from 'lucide-react';
import Image from 'next/image';
import { OptionItem, ProductOption } from '@/types/product-options';
import { Tag } from '@/types/tags';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { updateTagAssignments, assignTagToOption, removeTagFromOption, assignTagToItem, removeTagFromItem } from '@/utils/tagUtils';
import api from '@/utils/api';

// Componente selector de etiquetas mejorado
const TagSelector = ({ type, entityId, selectedTags = [], onChange }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const isTagSelected = (tagId) => {
    return selectedTags.some(tag => tag.id === tagId);
  };

  // Función para eliminar etiqueta directamente a través de la API
  const handleRemoveTagFromEntity = async (tag) => {
    if (!entityId) {
      // Si no hay ID, solo actualizar estado local
      onChange(selectedTags.filter(t => t.id !== tag.id));
      return;
    }

    try {
      setLoading(true);

      console.log(`Eliminando etiqueta ${tag.id} de ${type} ${entityId}`);

      // Determinar endpoint según tipo
      let endpoint;
      if (type === 'option') {
        endpoint = `/api/tags/assign-option/${entityId}/${tag.id}`;
      } else { // 'item'
        endpoint = `/api/tags/assign-item/${entityId}/${tag.id}`;
      }

      // Realizar la solicitud DELETE
      await api.delete(endpoint);

      // Actualizar estado local
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
  const handleAddTagToEntity = async (tag) => {
    if (!entityId) {
      // Si no hay ID, solo actualizar estado local
      onChange([...selectedTags, tag]);
      return;
    }

    try {
      setLoading(true);

      console.log(`Asignando etiqueta ${tag.id} a ${type} ${entityId}`);

      // Determinar endpoint según tipo
      let endpoint;
      if (type === 'option') {
        endpoint = `/api/tags/assign-option/${entityId}/${tag.id}`;
      } else { // 'item'
        endpoint = `/api/tags/assign-item/${entityId}/${tag.id}`;
      }

      // Realizar la solicitud POST
      await api.post(endpoint, {});

      // Actualizar estado local
      onChange([...selectedTags, tag]);

      console.log(`Etiqueta ${tag.id} asignada correctamente`);
    } catch (err) {
      console.error(`Error al asignar etiqueta ${tag.id}:`, err);
      setError(`Error al asignar etiqueta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tag) => {
    if (isTagSelected(tag.id)) {
      handleRemoveTagFromEntity(tag);
    } else {
      handleAddTagToEntity(tag);
    }
  };

  // Función para eliminar etiqueta desde la sección de seleccionadas
  const handleRemoveTag = (tag, event) => {
    event.preventDefault();
    event.stopPropagation();
    handleRemoveTagFromEntity(tag);
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
        No hay etiquetas disponibles. <a href="/admin/tags" className="text-blue-500 hover:underline">Crear etiquetas</a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Etiquetas ({type === 'option' ? 'Opción' : 'Ítem'})
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
                  textColor={tag.textColor}
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
              textColor={tag.textColor}
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

interface ProductOptionsEditorProps {
  productId: number;
  onUpdateComplete?: () => void;
}

export default function ProductOptionsEditor({ productId, onUpdateComplete }: ProductOptionsEditorProps) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<{[key: number]: boolean}>({});
  const [newOption, setNewOption] = useState<ProductOption>({
    id: 0,
    product_id: productId,
    name: '',
    required: false,
    multiple: false,
    items: [],
    tags: [], // Inicializar tags vacío
  });
  const [newItem, setNewItem] = useState<OptionItem>({
    id: 0,
    option_id: 0,
    name: '',
    price_addition: 0,
    available: true,
    tags: [], // Inicializar tags vacío
  });

  // Estados para manejo de imágenes
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUploadItemId, setImageUploadItemId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar opciones existentes
  useEffect(() => {
    if (productId) {
      fetchOptions();
    }
  }, [productId]);

  // Inicializar el estado de expansión al cargar opciones
  useEffect(() => {
    const initialExpandedState = {};
    options.forEach(option => {
      if (option.id) {
        initialExpandedState[option.id] = false;
      }
    });
    setExpandedOptions(initialExpandedState);
  }, [options]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Añadir timestamp para evitar caché
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/product-options/${productId}?_=${timestamp}`);

      console.log('Opciones cargadas del servidor:', response.data);
      setOptions(response.data || []);
    } catch (err) {
      console.error('Error al cargar opciones:', err);
      setError(err.response?.data?.error || 'Error al cargar las opciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar que la opción tenga nombre
      if (!newOption.name.trim()) {
        setError('El nombre de la opción es obligatorio');
        return;
      }

      // Validar que tenga al menos un item
      if (newOption.items.length === 0) {
        setError('Debe agregar al menos un item a la opción');
        return;
      }

      // Guardar etiquetas temporalmente
      const optionTags = [...(newOption.tags || [])];

      // Eliminar las etiquetas del objeto que enviamos a la API actual (para compatibilidad)
      const optionToSave = { ...newOption, product_id: productId };
      delete optionToSave.tags;

      // Crear la opción sin etiquetas
      const response = await api.post("/api/product-options", optionToSave);

      const optionId = response.data.id;

      // Si hay etiquetas seleccionadas, asignarlas a la opción
      if (optionTags.length > 0) {
        try {
          const tagIds = optionTags.map(tag => tag.id);
          await updateTagAssignments(optionId, [], tagIds, 'option');
        } catch (tagError) {
          console.error('Error al asignar etiquetas a opción:', tagError);
          // No interrumpimos el proceso principal si falla la asignación de etiquetas
        }
      }

      // Refrescar la lista de opciones
      await fetchOptions();

      // Reiniciar el formulario
      setNewOption({
        id: 0,
        product_id: productId,
        name: '',
        required: false,
        multiple: false,
        items: [],
        tags: [], // Reiniciar tags
      });
      setShowAddForm(false);

      if (onUpdateComplete) {
        onUpdateComplete();
      }

      showSuccessMessage('Opción agregada correctamente');

    } catch (err: any) {
      console.error('Error al agregar opción:', err);
      setError(err.response?.data?.error || 'Error al agregar la opción');
    } finally {
      setLoading(false);
    }
  };

  // Función para añadir items directamente a una opción
  const addItemDirectly = async (optionId, itemData) => {
    try {
      // Extraer etiquetas si existen
      const tags = itemData.tags || [];

      // Crear una copia sin etiquetas para la API actual
      const itemDataWithoutTags = { ...itemData };
      delete itemDataWithoutTags.tags;

      // Hacer la petición POST para agregar el ítem (sin etiquetas)
      const response = await api.post(
        `/api/product-options/${optionId}/items`,
        itemDataWithoutTags
      );

      // Si hay etiquetas y el ítem se creó correctamente
      if (tags.length > 0 && response.data.id) {
        const itemId = response.data.id;
        const tagIds = tags.map(tag => tag.id);

        await updateTagAssignments(itemId, [], tagIds, 'item');
      }

      // Registrar el resultado en la consola
      console.log('Ítem agregado directamente:', response.data);

      // Devolver la respuesta
      return response.data;
    } catch (error) {
      // Manejar errores
      console.error('Error al agregar ítem directamente:', error);
      throw error;
    }
  };

  const handleUpdateOption = async () => {
    if (!editingOption || !editingOption.id) return;

    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (!editingOption.name.trim()) {
        setError('El nombre de la opción es obligatorio');
        return;
      }

      if (editingOption.items.length === 0) {
        setError('Debe agregar al menos un item a la opción');
        return;
                    }

                    // Guardar las etiquetas temporalmente
                    const optionTags = [...(editingOption.tags || [])];

                    // Separar ítems existentes de ítems nuevos
                    const existingItems = editingOption.items.filter(item => item.id);
                    const newItems = editingOption.items.filter(item => !item.id);

                    console.log('Ítems existentes:', existingItems);
                    console.log('Ítems nuevos:', newItems);

                    // Crear copia sin etiquetas para compatibilidad con API actual
                    const existingItemsWithoutTags = existingItems.map(item => {
                      const itemCopy = { ...item };
                      delete itemCopy.tags;
                      return itemCopy;
                    });

                    // 1. Primero actualizar la opción con los ítems existentes (sin etiquetas)
                    const optionData = {
                      name: editingOption.name,
                      required: editingOption.required,
                      multiple: editingOption.multiple,
                      max_selections: editingOption.max_selections,
                      items: existingItemsWithoutTags
                    };

                    console.log('1. Actualizando opción con ítems existentes:', optionData);

                    const updateResponse = await api.put(
                      `/api/product-options/${editingOption.id}`,
                      optionData
                    );

                    console.log('Opción actualizada:', updateResponse.data);

                    // 2. Actualizar etiquetas de la opción
                    const originalOption = options.find(opt => opt.id === editingOption.id);
                    const originalTagIds = (originalOption?.tags || []).map(tag => tag.id);
                    const newTagIds = optionTags.map(tag => tag.id);

                    await updateTagAssignments(editingOption.id, originalTagIds, newTagIds, 'option');

                    // 3. Actualizar etiquetas de ítems existentes
                    for (const item of existingItems) {
                      if (item.id && item.tags) {
                        const originalItem = originalOption?.items.find(i => i.id === item.id);
                        const originalItemTagIds = (originalItem?.tags || []).map(tag => tag.id);
                        const newItemTagIds = item.tags.map(tag => tag.id);

                        await updateTagAssignments(item.id, originalItemTagIds, newItemTagIds, 'item');
                      }
                    }

                    // 4. Luego agregar cada ítem nuevo individualmente
                    if (newItems.length > 0) {
                      console.log('2. Agregando ítems nuevos individualmente:', newItems);

                      for (const newItem of newItems) {
                        const itemData = {
                          name: newItem.name,
                          price_addition: Number(newItem.price_addition) || 0,
                          available: newItem.available !== false,
                          image_url: newItem.image_url || null,
                          tags: newItem.tags || [] // Incluir etiquetas para el nuevo ítem
                        };

                        console.log(`Agregando ítem: ${newItem.name}`);
                        await addItemDirectly(editingOption.id, itemData);
                      }
                    }

                    // 5. Refrescar opciones
                    console.log('3. Refrescando lista de opciones');
                    await fetchOptions();

                    // 6. Reiniciar el formulario de edición
                    setEditingOption(null);

                    if (onUpdateComplete) {
                      onUpdateComplete();
                    }

                    // 7. Mostrar mensaje de éxito
                    showSuccessMessage('Opción actualizada correctamente');

                  } catch (err) {
                    console.error('Error al actualizar opción:', err);
                    setError(err.response?.data?.error || 'Error al actualizar la opción');
                  } finally {
                    setLoading(false);
                  }
                };

                const handleDeleteOption = async (optionId: number) => {
                  if (!confirm('¿Está seguro que desea eliminar esta opción?')) return;

                  try {
                    setLoading(true);
                    setError(null);

                    await api.delete(`/api/product-options/${optionId}`);

                    // Refrescar la lista de opciones
                    await fetchOptions();

                    if (onUpdateComplete) {
                      onUpdateComplete();
                    }

                    showSuccessMessage('Opción eliminada correctamente');

                  } catch (err: any) {
                    console.error('Error al eliminar opción:', err);
                    setError(err.response?.data?.error || 'Error al eliminar la opción');
                  } finally {
                    setLoading(false);
                  }
                };

                const updateItem = async (optionId: number, itemId: number, updatedItem: Partial<OptionItem>) => {
                  try {
                    setLoading(true);
                    setError(null);

                    // Si hay etiquetas en el ítem actualizado, manejarlas por separado
                    const itemTags = updatedItem.tags || [];

                    // Crear copia sin etiquetas para compatibilidad con API actual
                    const updatedItemWithoutTags = { ...updatedItem };
                    delete updatedItemWithoutTags.tags;

                    await api.put(
                      `/api/product-options/${optionId}/items/${itemId}`,
                      updatedItemWithoutTags
                    );

                    // Si hay etiquetas, actualizar asignaciones
                    if (itemTags.length > 0) {
                      const option = options.find(opt => opt.id === optionId);
                      const originalItem = option?.items.find(item => item.id === itemId);
                      const originalTagIds = (originalItem?.tags || []).map(tag => tag.id);
                      const newTagIds = itemTags.map(tag => tag.id);

                      await updateTagAssignments(itemId, originalTagIds, newTagIds, 'item');
                    }

                    // Refrescar opciones después de la actualización
                    await fetchOptions();

                  } catch (err: any) {
                    console.error('Error al actualizar item:', err);
                    setError(err.response?.data?.error || 'Error al actualizar el item');
                  } finally {
                    setLoading(false);
                  }
                };

                const deleteItem = async (optionId: number, itemId: number) => {
                  if (!confirm('¿Está seguro que desea eliminar este ítem?')) return;

                  try {
                    setLoading(true);
                    setError(null);

                    await api.delete(
                      `/api/product-options/${optionId}/items/${itemId}`
                    );

                    // Refrescar opciones después de la eliminación
                    await fetchOptions();

                  } catch (err: any) {
                    console.error('Error al eliminar item:', err);
                    setError(err.response?.data?.error || 'Error al eliminar el ítem');
                  } finally {
                    setLoading(false);
                  }
                };

                const toggleExpandOption = (optionId) => {
                  setExpandedOptions(prev => ({
                    ...prev,
                    [optionId]: !prev[optionId]
                  }));
                };

                const addItemToNewOption = () => {
                  // Validar que el item tenga nombre
                  if (!newItem.name.trim()) {
                    setError('El nombre del item es obligatorio');
                    return;
                  }

                  // Agregar item a la opción que se está creando
                  setNewOption({
                    ...newOption,
                    items: [...newOption.items, { ...newItem }]
                  });

                  // Reiniciar el formulario de item
                  setNewItem({
                    id: 0,
                    option_id: 0,
                    name: '',
                    price_addition: 0,
                    available: true,
                    tags: [], // Reiniciar tags
                  });
                };

                const addItemToEditingOption = () => {
                  if (!editingOption) return;

                  // Validar que el item tenga nombre
                  if (!newItem.name.trim()) {
                    setError('El nombre del item es obligatorio');
                    return;
                  }

                  // Limpiar cualquier error previo
                  setError(null);

                  // Crear el objeto de ítem con la estructura correcta
                  const itemToAdd = {
                    // Sin ID para que el backend lo identifique como nuevo
                    id: 0,
                    option_id: editingOption.id,
                    name: newItem.name.trim(),
                    price_addition: Number(newItem.price_addition) || 0,
                    available: newItem.available !== false,
                    image_url: newItem.image_url || null,
                    tags: newItem.tags || [] // Incluir etiquetas
                  };

                  // Actualizar el estado de editingOption
                  setEditingOption({
                    ...editingOption,
                    items: [...editingOption.items, itemToAdd]
                  });

                  console.log(`Ítem "${newItem.name}" agregado a la opción "${editingOption.name}"`);

                  // Reiniciar el formulario de item
                  setNewItem({
                    id: 0,
                    option_id: 0,
                    name: '',
                    price_addition: 0,
                    available: true,
                    tags: [], // Reiniciar tags
                  });
                };

                const removeItemFromNewOption = (index: number) => {
                  const updatedItems = [...newOption.items];
                  updatedItems.splice(index, 1);
                  setNewOption({ ...newOption, items: updatedItems });
                };

                const removeItemFromEditingOption = (index) => {
                  if (!editingOption) return;

                  const updatedItems = [...editingOption.items];
                  updatedItems.splice(index, 1);
                  setEditingOption({ ...editingOption, items: updatedItems });
                };

                const updateItemInEditingOption = (itemIndex: number, updatedFields: Partial<OptionItem>) => {
                  if (!editingOption) return;

                  const updatedItems = [...editingOption.items];
                  updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    ...updatedFields
                  };

                  setEditingOption({
                    ...editingOption,
                    items: updatedItems
                  });
                };

                const handleUpdateItem = async (optionId: number, item: OptionItem) => {
                  if (!item.id) return;

                  try {
                    setLoading(true);
                    setError(null);

                    // Si hay etiquetas, manejarlas por separado
                    const itemTags = item.tags || [];

                    // Crear copia sin etiquetas para compatibilidad con API actual
                    const itemWithoutTags = { ...item };
                    delete itemWithoutTags.tags;

                    await api.put(
                      `/api/product-options/${optionId}/items/${item.id}`,
                      itemWithoutTags
                    );

                    // Actualizar etiquetas si existen
                    if (itemTags.length > 0) {
                      const option = options.find(opt => opt.id === optionId);
                      const originalItem = option?.items.find(i => i.id === item.id);
                      const originalTagIds = (originalItem?.tags || []).map(tag => tag.id);
                      const newTagIds = itemTags.map(tag => tag.id);

                      await updateTagAssignments(item.id, originalTagIds, newTagIds, 'item');
                    }

                    await fetchOptions();

                    if (onUpdateComplete) {
                      onUpdateComplete();
                    }
                  } catch (err: any) {
                    console.error('Error al actualizar item:', err);
                    setError(err.response?.data?.error || 'Error al actualizar el item');
                  } finally {
                    setLoading(false);
                  }
                };

                // Función para subir imágenes de ítems
                const handleUploadItemImage = async (optionId: number, itemId: number, file: File) => {
                  try {
                    setUploadingImage(true);
                    setImageUploadItemId(itemId);
                    setError(null);

                    // Crear FormData para enviar el archivo
                    const formData = new FormData();
                    formData.append('image', file);

                    // Realizar la petición para subir la imagen
                    const response = await api.put(
                      `/api/product-options/${optionId}/items/${itemId}/update-image`,
                      formData,
                      {
                        headers: {
                          'Content-Type': 'multipart/form-data'
                        }
                      }
                    );

                    console.log('Imagen subida:', response.data);

                    // Refrescar las opciones para ver la imagen actualizada
                    await fetchOptions();

                    showSuccessMessage('Imagen actualizada correctamente');
                  } catch (err: any) {
                    console.error('Error al subir imagen:', err);
                    setError(err.response?.data?.error || 'Error al subir la imagen');
                  } finally {
                    setUploadingImage(false);
                    setImageUploadItemId(null);
                  }
                };

                // Función para activar el input de archivo
                const triggerFileInput = (optionId: number, itemId: number) => {
                  // Guardar el itemId para usar cuando se seleccione el archivo
                  setImageUploadItemId(itemId);

                  // Configurar un manejador de eventos para el input file
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('data-option-id', String(optionId));
                    fileInputRef.current.setAttribute('data-item-id', String(itemId));
                    fileInputRef.current.click();
                  }
                };

                // Manejador para cuando se selecciona un archivo
                const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  const file = files[0];
                  const optionId = Number(e.target.getAttribute('data-option-id'));
                  const itemId = Number(e.target.getAttribute('data-item-id'));

                  if (optionId && itemId) {
                    await handleUploadItemImage(optionId, itemId, file);
                  }

                  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                };

                // Función para manejar cambios en etiquetas de opciones
                const handleOptionTagsChange = async (option, newTags) => {
                  try {
                    // Si la opción no tiene ID (es nueva), solo actualiza el estado local
                    if (!option.id) {
                      setEditingOption({
                        ...editingOption,
                        tags: newTags
                      });
                      return;
                    }

                    setLoading(true);
                    setError(null);

                    // Extraer IDs de las etiquetas actuales y nuevas
                    const currentTagIds = (option.tags || []).map(tag => tag.id);
                    const newTagIds = newTags.map(tag => tag.id);

                    // Usar la función mejorada updateTagAssignments
                    await updateTagAssignments(option.id, currentTagIds, newTagIds, 'option');

                    // Actualizar el estado local
                    setEditingOption({
                      ...editingOption,
                      tags: newTags
                    });

                    // Mostrar mensaje de éxito
                    showSuccessMessage('Etiquetas de opción actualizadas correctamente');
                  } catch (err) {
                    console.error('Error al actualizar etiquetas de opción:', err);
                    setError('Error al actualizar etiquetas: ' + err.message);
                                                                                } finally {
                                                                                  setLoading(false);
                                                                                }
                                                                              };

                                                                              // Función para manejar cambios en etiquetas de ítems
                                                                              const handleItemTagsChange = async (item, newTags) => {
                                                                                // Encontrar el índice del ítem en el arreglo de items
                                                                                const itemIndex = editingOption.items.findIndex(i => i === item);
                                                                                if (itemIndex === -1) return;

                                                                                // Si el ítem no tiene ID (es nuevo), solo actualiza el estado local
                                                                                if (!item.id) {
                                                                                  updateItemInEditingOption(itemIndex, { tags: newTags });
                                                                                  return;
                                                                                }

                                                                                try {
                                                                                  setLoading(true);
                                                                                  setError(null);

                                                                                  // Extraer IDs de las etiquetas actuales y nuevas
                                                                                  const currentTagIds = (item.tags || []).map(tag => tag.id);
                                                                                  const newTagIds = newTags.map(tag => tag.id);

                                                                                  // Usar la función mejorada updateTagAssignments
                                                                                  await updateTagAssignments(item.id, currentTagIds, newTagIds, 'item');

                                                                                  // Actualizar el estado local
                                                                                  updateItemInEditingOption(itemIndex, { tags: newTags });

                                                                                  // Mostrar mensaje de éxito
                                                                                  showSuccessMessage('Etiquetas de ítem actualizadas correctamente');
                                                                                } catch (err) {
                                                                                  console.error('Error al actualizar etiquetas de ítem:', err);
                                                                                  setError('Error al actualizar etiquetas: ' + err.message);
                                                                                } finally {
                                                                                  setLoading(false);
                                                                                }
                                                                              };

                                                                              // Función para eliminar directamente una etiqueta
                                                                              const handleDirectTagRemoval = async (entityId, tagId, entityType) => {
                                                                                if (!entityId || !tagId) return;

                                                                                try {
                                                                                  setLoading(true);

                                                                                  // Determinar el endpoint basado en el tipo de entidad
                                                                                  let endpoint;
                                                                                  if (entityType === 'option') {
                                                                                    endpoint = `/api/tags/assign-option/${entityId}/${tagId}`;
                                                                                  } else { // 'item'
                                                                                    endpoint = `/api/tags/assign-item/${entityId}/${tagId}`;
                                                                                  }

                                                                                  // Realizar la solicitud DELETE
                                                                                  await api.delete(endpoint);

                                                                                  // Recargar la lista de opciones para reflejar los cambios
                                                                                  await fetchOptions();

                                                                                  // Mostrar mensaje de éxito
                                                                                  showSuccessMessage('Etiqueta eliminada correctamente');
                                                                                } catch (error) {
                                                                                  console.error('Error al eliminar etiqueta:', error);
                                                                                  setError('Error al eliminar etiqueta: ' + error.message);
                                                                                } finally {
                                                                                  setLoading(false);
                                                                                }
                                                                              };

                                                                              const showSuccessMessage = (message) => {
                                                                                const successMsg = document.createElement('div');
                                                                                successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg z-50 flex items-center';

                                                                                const checkIcon = document.createElement('span');
                                                                                checkIcon.className = 'mr-2';
                                                                                checkIcon.innerHTML = '✓';
                                                                                successMsg.appendChild(checkIcon);

                                                                                const textNode = document.createTextNode(message);
                                                                                successMsg.appendChild(textNode);

                                                                                document.body.appendChild(successMsg);

                                                                                setTimeout(() => {
                                                                                  successMsg.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                                                                                  setTimeout(() => document.body.removeChild(successMsg), 500);
                                                                                }, 2500);
                                                                              };

                                                                              if (loading && options.length === 0) {
                                                                                return (
                                                                                  <div className="text-center py-8">
                                                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                                                                                    <p className="text-gray-600">Cargando opciones...</p>
                                                                                  </div>
                                                                                );
                                                                              }

                                                                              return (
                                                                                <div className="space-y-6">
                                                                                  {/* Input de archivo oculto para subir imágenes */}
                                                                                  <input
                                                                                    type="file"
                                                                                    ref={fileInputRef}
                                                                                    className="hidden"
                                                                                    accept="image/*"
                                                                                    onChange={handleFileChange}
                                                                                  />

                                                                                  <div className="flex justify-between items-center">
                                                                                    <h3 className="text-xl font-bold text-gray-900">Opciones del Producto</h3>
                                                                                    <Button
                                                                                      onClick={() => setShowAddForm(!showAddForm)}
                                                                                      className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                                                                                    >
                                                                                      {showAddForm ? <X size={18} /> : <Plus size={18} />}
                                                                                      {showAddForm ? 'Cancelar' : 'Agregar Opción'}
                                                                                    </Button>
                                                                                  </div>

                                                                                  {error && (
                                                                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                                                                      {error}
                                                                                    </div>
                                                                                  )}

                                                                                  {/* Formulario para agregar nueva opción */}
                                                                                  <AnimatePresence>
                                                                                    {showAddForm && (
                                                                                      <motion.div
                                                                                        initial={{ opacity: 0, height: 0 }}
                                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                                        exit={{ opacity: 0, height: 0 }}
                                                                                        className="overflow-hidden"
                                                                                      >
                                                                                        <Card className="border-2 border-blue-200">
                                                                                          <CardContent className="pt-6">
                                                                                            <h4 className="font-medium mb-4 text-lg text-blue-600">Nueva Opción</h4>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                                              <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                  Nombre *
                                                                                                </label>
                                                                                                <input
                                                                                                  type="text"
                                                                                                  value={newOption.name}
                                                                                                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                                                                                                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                                  placeholder="Ej: Tamaño, Sabor, etc."
                                                                                                />
                                                                                              </div>
                                                                                              <div className="flex items-center space-x-4">
                                                                                                <label className="flex items-center">
                                                                                                  <input
                                                                                                    type="checkbox"
                                                                                                    checked={newOption.required}
                                                                                                    onChange={(e) => setNewOption({ ...newOption, required: e.target.checked })}
                                                                                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                                                                                                  />
                                                                                                  <span className="text-sm">Obligatorio</span>
                                                                                                </label>
                                                                                                <label className="flex items-center">
                                                                                                  <input
                                                                                                    type="checkbox"
                                                                                                    checked={newOption.multiple}
                                                                                                    onChange={(e) => setNewOption({ ...newOption, multiple: e.target.checked })}
                                                                                                    className="mr-2"
                                                                                                  />
                                                                                                  <span className="text-sm">Selección múltiple</span>
                                                                                                </label>
                                                                                              </div>
                                                                                            </div>

                                                                                            {newOption.multiple && (
                                                                                              <div className="mb-4">
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                  Máximo de selecciones
                                                                                                </label>
                                                                                                <input
                                                                                                  type="number"
                                                                                                  min="0"
                                                                                                  value={newOption.max_selections || ''}
                                                                                                  onChange={(e) => setNewOption({ ...newOption, max_selections: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                                                  className="w-32 p-2 border rounded"
                                                                                                  placeholder="Sin límite"
                                                                                                />
                                                                                                <span className="text-xs text-gray-500 ml-2">Deja en blanco para no limitar</span>
                                                                                              </div>
                                                                                            )}

                                                                                            {/* Selector de etiquetas para la opción */}
                                                                                            <div className="mt-4 mb-4">
                                                                                              <TagSelector
                                                                                                type="option"
                                                                                                selectedTags={newOption.tags || []}
                                                                                                onChange={(tags) => setNewOption({ ...newOption, tags })}
                                                                                              />
                                                                                            </div>

                                                                                            <h5 className="font-medium mt-6 mb-4">Agregar Items</h5>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                                              <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                  Nombre *
                                                                                                </label>
                                                                                                <input
                                                                                                  type="text"
                                                                                                  value={newItem.name}
                                                                                                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                                                                  className="w-full p-2 border rounded"
                                                                                                  placeholder="Ej: Grande, Pequeño, etc."
                                                                                                />
                                                                                              </div>
                                                                                              <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                  Precio adicional
                                                                                                </label>
                                                                                                <input
                                                                                                  type="number"
                                                                                                  min="0"
                                                                                                  step="0.01"
                                                                                                  value={newItem.price_addition || 0}
                                                                                                  onChange={(e) => setNewItem({ ...newItem, price_addition: parseFloat(e.target.value) || 0 })}
                                                                                                  className="w-full p-2 border rounded"
                                                                                                  placeholder="0.00"
                                                                                                />
                                                                                              </div>
                                                                                              <div className="flex items-end">
                                                                                                <Button
                                                                                                  onClick={addItemToNewOption}
                                                                                                  className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                                                                                                >
                                                                                                  <Plus size={18} className="mr-1" />
                                                                                                  Agregar Item
                                                                                                </Button>
                                                                                              </div>
                                                                                            </div>

                                                                                            {/* Selector de etiquetas para el ítem */}
                                                                                            <div className="mb-4">
                                                                                              <TagSelector
                                                                                                type="item"
                                                                                                selectedTags={newItem.tags || []}
                                                                                                onChange={(tags) => setNewItem({ ...newItem, tags })}
                                                                                              />
                                                                                            </div>

                                                                                            {/* Lista de items agregados */}
                                                                                            {newOption.items.length > 0 && (
                                                                                              <div className="mt-4 mb-6">
                                                                                                <h6 className="text-sm font-medium mb-2">Items agregados:</h6>
                                                                                                <div className="px-4 pb-4 border-b border-gray-200 rounded-lg bg-white shadow">
                                                                                                  <ul className="divide-y divide-gray-200">
                                                                                                    {newOption.items.map((item, index) => (
                                                                                                      <li key={index} className="py-3 flex justify-between items-center border-b border-gray-100">
                                                                                                        <div>
                                                                                                          <span className="font-medium">{item.name}</span>
                                                                                                          {item.price_addition > 0 && (
                                                                                                            <span className="ml-2 text-gray-600">
                                                                                                              (+${item.price_addition.toFixed(2)})
                                                                                                            </span>
                                                                                                          )}
                                                                                                          {/* Mostrar etiquetas del ítem */}
                                                                                                          {item.tags && item.tags.length > 0 && (
                                                                                                            <div className="flex mt-1 gap-1">
                                                                                                              {item.tags.map(tag => (
                                                                                                                <TagComponent
                                                                                                                  key={tag.id}
                                                                                                                  name={tag.name}
                                                                                                                  color={tag.color}
                                                                                                                  textColor={tag.textColor}
                                                                                                                  size="sm"
                                                                                                                />
                                                                                                              ))}
                                                                                                            </div>
                                                                                                          )}
                                                                                                        </div>
                                                                                                        <button
                                                                                                          onClick={() => removeItemFromNewOption(index)}
                                                                                                          className="text-red-500 hover:text-red-700"
                                                                                                        >
                                                                                                          <Trash2 size={18} />
                                                                                                        </button>
                                                                                                      </li>
                                                                                                    ))}
                                                                                                  </ul>
                                                                                                </div>
                                                                                              </div>
                                                                                            )}

                                                                                            <div className="flex justify-end space-x-2 mt-4">
                                                                                              <Button
                                                                                                onClick={() => setShowAddForm(false)}
                                                                                                variant="outline"
                                                                                              >
                                                                                                Cancelar
                                                                                              </Button>
                                                                                              <Button
                                                                                                onClick={handleAddOption}
                                                                                                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center"
                                                                                                disabled={loading || !newOption.name || newOption.items.length === 0}
                                                                                              >
                                                                                                {loading ? (
                                                                                                  <>
                                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                                                                    Guardando...
                                                                                                  </>
                                                                                                ) : (
                                                                                                  <>
                                                                                                    <Check size={18} className="mr-1" />
                                                                                                    Guardar Opción
                                                                                                  </>
                                                                                                )}
                                                                                              </Button>
                                                                                            </div>
                                                                                          </CardContent>
                                                                                        </Card>
                                                                                      </motion.div>
                                                                                    )}
                                                                                  </AnimatePresence>

                                                                                  {/* Formulario para editar opción */}
                                                                                  <AnimatePresence>
                                                                                    {editingOption && (
                                                                                      <motion.div
                                                                                        initial={{ opacity: 0, height: 0 }}
                                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                                        exit={{ opacity: 0, height: 0 }}
                                                                                        className="overflow-hidden"
                                                                                      >
                                                                                        <Card className="border-2 border-emerald-200">
                                                                                          <CardContent className="pt-6">
                                                                                            <h4 className="font-medium mb-4 text-lg text-emerald-600">Editar Opción</h4>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                                              <div>
                                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                  Nombre *
                                                                                                </label>
                                                                                                <input
                                                                                                  type="text"
                                                                                                  value={editingOption.name}
                                                                                                  onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                                                                                                  className="w-full p-2 border rounded"
                                                                                                  placeholder="Ej: Tamaño, Sabor, etc."
                                                                                                />
                                                                                              </div>
                                                                                              <div className="flex items-center space-x-4">
                                                                                                <label className="flex items-center">
                                                                                                  <input
                                                                                                    type="checkbox"
                                                                                                    checked={editingOption.required}
                                                                                                    onChange={(e) => setEditingOption({ ...editingOption, required: e.target.checked })}
                                                                                                    className="mr-2"
                                                                                                  />
                                                                                                  <span className="text-sm">Obligatorio</span>
                                                                                                </label>
                                                                                                <label className="flex items-center">
                                                                                                  <input
                                                                                                    type="checkbox"
                                                                                                    checked={editingOption.multiple}
                                                                                                    onChange={(e) => setEditingOption({ ...editingOption, multiple: e.target.checked })}
                                                                                                                                                                                                     className="mr-2"
                                                                                                                                                                                                   />
                                                                                                                                                                                                   <span className="text-sm">Selección múltiple</span>
                                                                                                                                                                                                 </label>
                                                                                                                                                                                               </div>
                                                                                                                                                                                             </div>

                                                                                                                                                                                             {editingOption.multiple && (
                                                                                                                                                                                               <div className="mb-4">
                                                                                                                                                                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                                   Máximo de selecciones
                                                                                                                                                                                                 </label>
                                                                                                                                                                                                 <input
                                                                                                                                                                                                   type="number"
                                                                                                                                                                                                   min="0"
                                                                                                                                                                                                   value={editingOption.max_selections || ''}
                                                                                                                                                                                                   onChange={(e) => setEditingOption({ ...editingOption, max_selections: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                                                                                                                                                   className="w-32 p-2 border rounded"
                                                                                                                                                                                                   placeholder="Sin límite"
                                                                                                                                                                                                 />
                                                                                                                                                                                                 <span className="text-xs text-gray-500 ml-2">Deja en blanco para no limitar</span>
                                                                                                                                                                                               </div>
                                                                                                                                                                                             )}

                                                                                                                                                                                             {/* Selector de etiquetas para la opción en edición */}
                                                                                                                                                                                             <div className="mb-4">
                                                                                                                                                                                               <TagSelector
                                                                                                                                                                                                 type="option"
                                                                                                                                                                                                 entityId={editingOption.id} // Pasar el ID de la opción para eliminar etiquetas
                                                                                                                                                                                                 selectedTags={editingOption.tags || []}
                                                                                                                                                                                                 onChange={(tags) => handleOptionTagsChange(editingOption, tags)}
                                                                                                                                                                                               />
                                                                                                                                                                                             </div>

                                                                                                                                                                                             <h5 className="font-medium mt-6 mb-4">Agregar Items</h5>
                                                                                                                                                                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                                                                                                                                                               <div>
                                                                                                                                                                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                                   Nombre *
                                                                                                                                                                                                 </label>
                                                                                                                                                                                                 <input
                                                                                                                                                                                                   type="text"
                                                                                                                                                                                                   value={newItem.name}
                                                                                                                                                                                                   onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                                                                                                                                                                   className="w-full p-2 border rounded"
                                                                                                                                                                                                   placeholder="Ej: Grande, Pequeño, etc."
                                                                                                                                                                                                 />
                                                                                                                                                                                               </div>
                                                                                                                                                                                               <div>
                                                                                                                                                                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                                                                                                                                   Precio adicional
                                                                                                                                                                                                 </label>
                                                                                                                                                                                                 <input
                                                                                                                                                                                                   type="number"
                                                                                                                                                                                                   min="0"
                                                                                                                                                                                                   step="0.01"
                                                                                                                                                                                                   value={newItem.price_addition || 0}
                                                                                                                                                                                                   onChange={(e) => setNewItem({ ...newItem, price_addition: parseFloat(e.target.value) || 0 })}
                                                                                                                                                                                                   className="w-full p-2 border rounded"
                                                                                                                                                                                                   placeholder="0.00"
                                                                                                                                                                                                 />
                                                                                                                                                                                               </div>
                                                                                                                                                                                               <div className="flex items-end">
                                                                                                                                                                                                 <Button
                                                                                                                                                                                                   onClick={addItemToEditingOption}
                                                                                                                                                                                                   className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                                                                                                                                                                                                 >
                                                                                                                                                                                                   <Plus size={18} className="mr-1" />
                                                                                                                                                                                                   Agregar Item
                                                                                                                                                                                                 </Button>
                                                                                                                                                                                               </div>
                                                                                                                                                                                             </div>

                                                                                                                                                                                             {/* Selector de etiquetas para nuevos ítems */}
                                                                                                                                                                                             <div className="mb-4">
                                                                                                                                                                                               <TagSelector
                                                                                                                                                                                                 type="item"
                                                                                                                                                                                                 selectedTags={newItem.tags || []}
                                                                                                                                                                                                 onChange={(tags) => setNewItem({ ...newItem, tags })}
                                                                                                                                                                                               />
                                                                                                                                                                                             </div>

                                                                                                                                                                                             {/* Lista de items de la opción que se está editando */}
                                                                                                                                                                                             {editingOption.items.length > 0 && (
                                                                                                                                                                                               <div className="mt-4 mb-6">
                                                                                                                                                                                                 <h6 className="text-sm font-medium mb-2">Items agregados:</h6>
                                                                                                                                                                                                 <div className="px-4 pb-4 border-b border-gray-200 rounded-lg bg-white shadow">
                                                                                                                                                                                                   <ul className="divide-y divide-gray-200">
                                                                                                                                                                                                     {editingOption.items.map((item, index) => (
                                                                                                                                                                                                       <li key={index} className="py-3 flex justify-between items-center border-b border-gray-100">
                                                                                                                                                                                                         <div className="flex items-center">
                                                                                                                                                                                                           {/* Miniatura de imagen */}
                                                                                                                                                                                                           {item.image_url ? (
                                                                                                                                                                                                             <div className="relative w-10 h-10 rounded overflow-hidden mr-3 border border-gray-200">
                                                                                                                                                                                                               <Image
                                                                                                                                                                                                                 src={item.image_url}
                                                                                                                                                                                                                 alt={item.name}
                                                                                                                                                                                                                 fill
                                                                                                                                                                                                                 style={{ objectFit: 'cover' }}
                                                                                                                                                                                                                 sizes="40px"
                                                                                                                                                                                                               />
                                                                                                                                                                                                             </div>
                                                                                                                                                                                                           ) : (
                                                                                                                                                                                                             <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex items-center justify-center border border-gray-200">
                                                                                                                                                                                                               <ImageIcon size={16} className="text-gray-400" />
                                                                                                                                                                                                             </div>
                                                                                                                                                                                                           )}

                                                                                                                                                                                                           <div>
                                                                                                                                                                                                             <span className="font-medium">{item.name}</span>
                                                                                                                                                                                                             {item.price_addition > 0 && (
                                                                                                                                                                                                               <span className="ml-2 text-gray-600">
                                                                                                                                                                                                                 (+${item.price_addition.toFixed(2)})
                                                                                                                                                                                                               </span>
                                                                                                                                                                                                             )}
                                                                                                                                                                                                             <button
                                                                                                                                                                                                               onClick={() => {
                                                                                                                                                                                                                 const newAvailability = !item.available;
                                                                                                                                                                                                                 updateItemInEditingOption(index, { available: newAvailability });
                                                                                                                                                                                                               }}
                                                                                                                                                                                                               className={`ml-3 px-2 py-1 text-xs rounded flex items-center ${item.available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                                                                                                                                                                                                             >
                                                                                                                                                                                                               {item.available ? (
                                                                                                                                                                                                                 <>
                                                                                                                                                                                                                   <Check size={14} className="mr-1" />
                                                                                                                                                                                                                   Disponible
                                                                                                                                                                                                                 </>
                                                                                                                                                                                                               ) : (
                                                                                                                                                                                                                 <>
                                                                                                                                                                                                                   <X size={14} className="mr-1" />
                                                                                                                                                                                                                   No disponible
                                                                                                                                                                                                                 </>
                                                                                                                                                                                                               )}
                                                                                                                                                                                                             </button>

                                                                                                                                                                                                             {/* Selector de etiquetas para el ítem */}
                                                                                                                                                                                                             <div className="mt-2">
                                                                                                                                                                                                               <TagSelector
                                                                                                                                                                                                                 type="item"
                                                                                                                                                                                                                 entityId={item.id} // Pasar el ID del ítem para eliminar etiquetas
                                                                                                                                                                                                                 selectedTags={item.tags || []}
                                                                                                                                                                                                                 onChange={(tags) => handleItemTagsChange(item, tags)}
                                                                                                                                                                                                               />
                                                                                                                                                                                                             </div>
                                                                                                                                                                                                           </div>
                                                                                                                                                                                                         </div>

                                                                                                                                                                                                         <div className="flex space-x-2">
                                                                                                                                                                                                           {/* Botón para subir imagen */}
                                                                                                                                                                                                           {item.id && (
                                                                                                                                                                                                             <button
                                                                                                                                                                                                               onClick={() => item.id && editingOption?.id && triggerFileInput(editingOption.id, item.id)}
                                                                                                                                                                                                               className={`text-blue-500 hover:text-blue-700 p-1 rounded-full ${
                                                                                                                                                                                                                 uploadingImage && imageUploadItemId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                                                                                                                                                               }`}
                                                                                                                                                                                                               disabled={uploadingImage && imageUploadItemId === item.id}
                                                                                                                                                                                                             >
                                                                                                                                                                                                               {uploadingImage && imageUploadItemId === item.id ? (
                                                                                                                                                                                                                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                                                                                                                                                                                               ) : (
                                                                                                                                                                                                                 <Upload size={18} />
                                                                                                                                                                                                               )}
                                                                                                                                                                                                             </button>
                                                                                                                                                                                                           )}

                                                                                                                                                                                                           {/* Botón para eliminar ítem */}
                                                                                                                                                                                                           <button
                                                                                                                                                                                                             onClick={() => removeItemFromEditingOption(index)}
                                                                                                                                                                                                             className="text-red-500 hover:text-red-700"
                                                                                                                                                                                                           >
                                                                                                                                                                                                             <Trash2 size={18} />
                                                                                                                                                                                                           </button>
                                                                                                                                                                                                         </div>
                                                                                                                                                                                                       </li>
                                                                                                                                                                                                     ))}
                                                                                                                                                                                                   </ul>
                                                                                                                                                                                                 </div>
                                                                                                                                                                                               </div>
                                                                                                                                                                                             )}

                                                                                                                                                                                             <div className="flex justify-end space-x-2 mt-4">
                                                                                                                                                                                               <Button
                                                                                                                                                                                                 onClick={() => setEditingOption(null)}
                                                                                                                                                                                                 variant="outline"
                                                                                                                                                                                               >
                                                                                                                                                                                                 Cancelar
                                                                                                                                                                                               </Button>
                                                                                                                                                                                               <Button
                                                                                                                                                                                                 onClick={handleUpdateOption}
                                                                                                                                                                                                 className="bg-blue-500 hover:bg-blue-600 text-white flex items-center"
                                                                                                                                                                                                 disabled={loading || !editingOption.name || editingOption.items.length === 0}
                                                                                                                                                                                               >
                                                                                                                                                                                                 {loading ? (
                                                                                                                                                                                                   <>
                                                                                                                                                                                                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                                                                                                                                                                     Guardando...
                                                                                                                                                                                                   </>
                                                                                                                                                                                                 ) : (
                                                                                                                                                                                                   <>
                                                                                                                                                                                                     <Check size={18} className="mr-1" />
                                                                                                                                                                                                     Actualizar Opción
                                                                                                                                                                                                   </>
                                                                                                                                                                                                 )}
                                                                                                                                                                                               </Button>
                                                                                                                                                                                             </div>
                                                                                                                                                                                           </CardContent>
                                                                                                                                                                                         </Card>
                                                                                                                                                                                       </motion.div>
                                                                                                                                                                                     )}
                                                                                                                                                                                   </AnimatePresence>

                                                                                                                                                                                   {/* Lista de opciones existentes */}
                                                                                                                                                                                   {options.length > 0 ? (
                                                                                                                                                                                     <div className="space-y-4">
                                                                                                                                                                                       {options.map((option) => (
                                                                                                                                                                                         <Card key={option.id} className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                                                                                                                                                           <div
                                                                                                                                                                                             className="p-4 cursor-pointer"
                                                                                                                                                                                             onClick={() => toggleExpandOption(option.id)}
                                                                                                                                                                                           >
                                                                                                                                                                                             <div className="flex justify-between items-center">
                                                                                                                                                                                               <div>
                                                                                                                                                                                                 <div className="flex items-center flex-wrap gap-2">
                                                                                                                                                                                                   <h5 className="font-medium text-lg">{option.name}</h5>
                                                                                                                                                                                                   {option.required && (
                                                                                                                                                                                                     <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                                                                                                                                                       Obligatorio
                                                                                                                                                                                                     </span>
                                                                                                                                                                                                   )}
                                                                                                                                                                                                   {option.multiple && (
                                                                                                                                                                                                     <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                                                                                                                                                                       Múltiple
                                                                                                                                                                                                     </span>
                                                                                                                                                                                                   )}
                                                                                                                                                                                                   {option.multiple && option.max_selections && (
                                                                                                                                                                                                     <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                                                                                                                                                                       Máx: {option.max_selections}
                                                                                                                                                                                                     </span>
                                                                                                                                                                                                   )}

                                                                                                                                                                                                   {/* Mostrar etiquetas de la opción */}
                                                                                                                                                                                                   {option.tags && option.tags.length > 0 && (
                                                                                                                                                                                                     <div className="flex gap-1">
                                                                                                                                                                                                       {option.tags.map(tag => (
                                                                                                                                                                                                         <TagComponent
                                                                                                                                                                                                           key={tag.id}
                                                                                                                                                                                                           name={tag.name}
                                                                                                                                                                                                           color={tag.color}
                                                                                                                                                                                                           textColor={tag.textColor}
                                                                                                                                                                                                           size="sm"
                                                                                                                                                                                                         />
                                                                                                                                                                                                       ))}
                                                                                                                                                                                                     </div>
                                                                                                                                                                                                   )}
                                                                                                                                                                                                 </div>
                                                                                                                                                                                                 <div className="text-sm text-gray-500 mt-1">
                                                                                                                                                                                                   {option.items?.length || 0} {option.items?.length === 1 ? 'ítem' : 'ítems'}
                                                                                                                                                                                                 </div>
                                                                                                                                                                                               </div>
                                                                                                                                                                                               <div className="flex items-center space-x-2">
                                                                                                                                                                                                 {expandedOptions[option.id] ?
                                                                                                                                                                                                   <ChevronUp size={24} className="text-gray-500" /> :
                                                                                                                                                                                                   <ChevronDown size={24} className="text-gray-500" />
                                                                                                                                                                                                 }
                                                                                                                                                                                               </div>
                                                                                                                                                                                             </div>
                                                                                                                                                                                           </div>

                                                                                                                                                                                           {/* Contenido expandible con los items */}
                                                                                                                                                                                           {expandedOptions[option.id] && (
                                                                                                                                                                                             <div className="border-t border-gray-200">
                                                                                                                                                                                               <div className="p-4">
                                                                                                                                                                                                 <div className="mb-4 flex justify-between">
                                                                                                                                                                                                   <h6 className="font-medium text-gray-700">Ítems disponibles:</h6>
                                                                                                                                                                                                   <div className="flex space-x-2">
                                                                                                                                                                                                     <Button
                                                                                                                                                                                                       onClick={(e) => {
                                                                                                                                                                                                         e.stopPropagation(); // Evitar que se propague al hacer clic
                                                                                                                                                                                                         setEditingOption(option);
                                                                                                                                                                                                       }}
                                                                                                                                                                                                       variant="outline"
                                                                                                                                                                                                       className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                                                                                                                                                                                       size="sm"
                                                                                                                                                                                                     >
                                                                                                                                                                                                       <Edit size={16} className="mr-1" />
                                                                                                                                                                                                       Editar
                                                                                                                                                                                                     </Button>
                                                                                                                                                                                                     <Button
                                                                                                                                                                                                       onClick={(e) => {
                                                                                                                                                                                                         e.stopPropagation(); // Evitar que se propague al hacer clic
                                                                                                                                                                                                         option.id && handleDeleteOption(option.id);
                                                                                                                                                                                                       }}
                                                                                                                                                                                                       variant="outline"
                                                                                                                                                                                                       className="text-red-500 border-red-500 hover:bg-red-50"
                                                                                                                                                                                                       size="sm"
                                                                                                                                                                                                     >
                                                                                                                                                                                                       <Trash2 size={16} className="mr-1" />
                                                                                                                                                                                                       Eliminar
                                                                                                                                                                                                     </Button>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                                 </div>

                                                                                                                                                                                                 {option.items && option.items.length > 0 ? (
                                                                                                                                                                                                   <div className="bg-gray-50 p-3 rounded-lg">
                                                                                                                                                                                                     <ul className="divide-y divide-gray-200">
                                                                                                                                                                                                       {option.items.map((item) => (
                                                                                                                                                                                                         <li key={item.id} className="py-2 flex justify-between items-center">
                                                                                                                                                                                                           <div className="flex items-center">
                                                                                                                                                                                                             {/* Miniatura de imagen */}
                                                                                                                                                                                                             {item.image_url ? (
                                                                                                                                                                                                               <div className="relative w-10 h-10 rounded overflow-hidden mr-3 border border-gray-200">
                                                                                                                                                                                                                 <Image
                                                                                                                                                                                                                   src={item.image_url}
                                                                                                                                                                                                                   alt={item.name}
                                                                                                                                                                                                                   fill
                                                                                                                                                                                                                   style={{ objectFit: 'cover' }}
                                                                                                                                                                                                                   sizes="40px"
                                                                                                                                                                                                                 />
                                                                                                                                                                                                               </div>
                                                                                                                                                                                                             ) : (
                                                                                                                                                                                                               <div className="w-10 h-10 bg-gray-100 rounded mr-3 flex items-center justify-center border border-gray-200">
                                                                                                                                                                                                                 <ImageIcon size={16} className="text-gray-400" />
                                                                                                                                                                                                               </div>
                                                                                                                                                                                                             )}

                                                                                                                                                                                                             <div>
                                                                                                                                                                                                               <span className="font-medium">{item.name}</span>
                                                                                                                                                                                                               {item.price_addition > 0 && (
                                                                                                                                                                                                                 <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                                                                                                                                                                                                   +${item.price_addition.toFixed(2)}
                                                                                                                                                                                                                 </span>
                                                                                                                                                                                                               )}

                                                                                                                                                                                                               {/* Mostrar etiquetas del ítem */}
                                                                                                                                                                                                               {item.tags && item.tags.length > 0 && (
                                                                                                                                                                                                                 <div className="flex mt-1 gap-1">
                                                                                                                                                                                                                   {item.tags.map(tag => (
                                                                                                                                                                                                                     <span
                                                                                                                                                                                                                       key={tag.id}
                                                                                                                                                                                                                       className="inline-flex items-center"
                                                                                                                                                                                                                     >
                                                                                                                                                                                                                       <TagComponent
                                                                                                                                                                                                                         name={tag.name}
                                                                                                                                                                                                                         color={tag.color}
                                                                                                                                                                                                                         textColor={tag.textColor}
                                                                                                                                                                                                                                                                                   size="sm"
                                                                                                                                                                                                                                                                                 />
                                                                                                                                                                                                                                                                                 {/* Añadir botón para eliminar etiqueta directamente */}
                                                                                                                                                                                                                                                                                 <button
                                                                                                                                                                                                                                                                                   onClick={(e) => {
                                                                                                                                                                                                                                                                                     e.preventDefault();
                                                                                                                                                                                                                                                                                     e.stopPropagation();
                                                                                                                                                                                                                                                                                     if (item.id) {
                                                                                                                                                                                                                                                                                       handleDirectTagRemoval(item.id, tag.id, 'item');
                                                                                                                                                                                                                                                                                     }
                                                                                                                                                                                                                                                                                   }}
                                                                                                                                                                                                                                                                                   className="bg-white rounded-full -ml-1 w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-50"
                                                                                                                                                                                                                                                                                   title="Quitar etiqueta"
                                                                                                                                                                                                                                                                                 >
                                                                                                                                                                                                                                                                                   <X size={10} className="text-red-500" />
                                                                                                                                                                                                                                                                                 </button>
                                                                                                                                                                                                                                                                               </span>
                                                                                                                                                                                                                                                                             ))}
                                                                                                                                                                                                                                                                           </div>
                                                                                                                                                                                                                                                                         )}
                                                                                                                                                                                                                                                                       </div>
                                                                                                                                                                                                                                                                     </div>

                                                                                                                                                                                                                                                                     <div className="flex items-center">
                                                                                                                                                                                                                                                                       <span className={`text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                                                                                                                                                                                                                                         {item.available ? 'Disponible' : 'No disponible'}
                                                                                                                                                                                                                                                                       </span>

                                                                                                                                                                                                                                                                       {/* Botón para subir imagen */}
                                                                                                                                                                                                                                                                       <button
                                                                                                                                                                                                                                                                         onClick={(e) => {
                                                                                                                                                                                                                                                                           e.stopPropagation();
                                                                                                                                                                                                                                                                           option.id && item.id && triggerFileInput(option.id, item.id);
                                                                                                                                                                                                                                                                         }}
                                                                                                                                                                                                                                                                         className={`text-blue-500 hover:text-blue-700 p-1 rounded-full mx-2 ${
                                                                                                                                                                                                                                                                           uploadingImage && imageUploadItemId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                                                                                                                                                                                                                                                                         }`}
                                                                                                                                                                                                                                                                         disabled={uploadingImage && imageUploadItemId === item.id}
                                                                                                                                                                                                                                                                       >
                                                                                                                                                                                                                                                                         {uploadingImage && imageUploadItemId === item.id ? (
                                                                                                                                                                                                                                                                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                                                                                                                                                                                                                                                         ) : (
                                                                                                                                                                                                                                                                           <Upload size={16} />
                                                                                                                                                                                                                                                                         )}
                                                                                                                                                                                                                                                                       </button>

                                                                                                                                                                                                                                                                       {/* Botón para eliminar ítem */}
                                                                                                                                                                                                                                                                       <button
                                                                                                                                                                                                                                                                         onClick={(e) => {
                                                                                                                                                                                                                                                                           e.stopPropagation();
                                                                                                                                                                                                                                                                           item.id && option.id && deleteItem(option.id, item.id);
                                                                                                                                                                                                                                                                         }}
                                                                                                                                                                                                                                                                         className="text-red-500 hover:text-red-700 ml-2"
                                                                                                                                                                                                                                                                       >
                                                                                                                                                                                                                                                                         <Trash2 size={16} />
                                                                                                                                                                                                                                                                       </button>
                                                                                                                                                                                                                                                                     </div>
                                                                                                                                                                                                                                                                   </li>
                                                                                                                                                                                                                                                                 ))}
                                                                                                                                                                                                                                                               </ul>
                                                                                                                                                                                                                                                             </div>
                                                                                                                                                                                                                                                           ) : (
                                                                                                                                                                                                                                                             <div className="text-center py-4 bg-gray-50 rounded-lg">
                                                                                                                                                                                                                                                               <p className="text-gray-500">No hay ítems en esta opción.</p>
                                                                                                                                                                                                                                                             </div>
                                                                                                                                                                                                                                                           )}
                                                                                                                                                                                                                                                         </div>
                                                                                                                                                                                                                                                       </div>
                                                                                                                                                                                                                                                     )}
                                                                                                                                                                                                                                                   </Card>
                                                                                                                                                                                                                                                 ))}
                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                             ) : (
                                                                                                                                                                                                                                               <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                                                                                                                                                                                                                 <p className="text-gray-500">No hay opciones configuradas para este producto.</p>
                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                             )}
                                                                                                                                                                                                                                           </div>
                                                                                                                                                                                                                                         );
                                                                                                                                                                                                                                       }