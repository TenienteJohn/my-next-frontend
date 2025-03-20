// src/components/products/ProductOptionsEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Plus, X, Trash2, Edit, Check } from 'lucide-react';

interface OptionItem {
  id?: number;
  name: string;
  price_addition: number;
  available: boolean;
  image_url?: string;
}

interface ProductOption {
  id?: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
}

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
    name: '',
    required: false,
    multiple: false,
    items: [],
  });
  const [newItem, setNewItem] = useState<OptionItem>({
    name: '',
    price_addition: 0,
    available: true,
  });

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
      initialExpandedState[option.id] = false;
    });
    setExpandedOptions(initialExpandedState);
  }, [options]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Añadir timestamp para evitar caché
      const timestamp = new Date().getTime();
      const response = await axios.get(`/api/product-options/${productId}?_=${timestamp}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.post(
        "/api/product-options",
        { ...newOption, product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refrescar la lista de opciones
      await fetchOptions();

      // Reiniciar el formulario
      setNewOption({
        name: '',
        required: false,
        multiple: false,
        items: [],
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

  // Añade esta función justo después de handleDeleteOption
  const addItemDirectly = async (optionId, itemData) => {
    try {
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Hacer la petición POST para agregar el ítem
      const response = await axios.post(
        `/api/product-options/${optionId}/items`,  // URL con el ID de la opción
        itemData,                                  // Datos del ítem (nombre, precio, etc.)
        { headers: { Authorization: `Bearer ${token}` } }  // Cabecera de autenticación
      );

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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Separar ítems existentes de ítems nuevos
      const existingItems = editingOption.items.filter(item => item.id);
      const newItems = editingOption.items.filter(item => !item.id);

      console.log('Ítems existentes:', existingItems);
      console.log('Ítems nuevos:', newItems);

      // 1. Primero actualizar la opción con los ítems existentes
      const optionData = {
        name: editingOption.name,
        required: editingOption.required,
        multiple: editingOption.multiple,
        max_selections: editingOption.max_selections,
        items: existingItems
      };

      console.log('1. Actualizando opción con ítems existentes:', optionData);

      const updateResponse = await axios.put(
        `/api/product-options/${editingOption.id}`,
        optionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Opción actualizada:', updateResponse.data);

      // 2. Luego agregar cada ítem nuevo individualmente
      if (newItems.length > 0) {
        console.log('2. Agregando ítems nuevos individualmente:', newItems);

        for (const newItem of newItems) {
          const itemData = {
            name: newItem.name,
            price_addition: Number(newItem.price_addition) || 0,
            available: newItem.available !== false,
            image_url: newItem.image_url || null
          };

          console.log(`Agregando ítem: ${newItem.name}`);
          await addItemDirectly(editingOption.id, itemData);
        }
      }

      // 3. Refrescar opciones
      console.log('3. Refrescando lista de opciones');
      await fetchOptions();

      // 4. Reiniciar el formulario de edición
      setEditingOption(null);

      if (onUpdateComplete) {
        onUpdateComplete();
      }

      // 5. Mostrar mensaje de éxito
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg z-50';
      successMsg.textContent = 'Opción actualizada correctamente';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.delete(`/api/product-options/${optionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.put(
        `/api/product-options/${optionId}/items/${itemId}`,
        updatedItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.delete(
        `/api/product-options/${optionId}/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refrescar opciones después de la eliminación
      await fetchOptions();

    } catch (err: any) {
      console.error('Error al eliminar item:', err);
      setError(err.response?.data?.error || 'Error al eliminar el item');
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
      name: '',
      price_addition: 0,
      available: true,
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
      name: newItem.name.trim(),
      price_addition: Number(newItem.price_addition) || 0,
      available: newItem.available !== false,
      image_url: newItem.image_url || null
    };

    // Actualizar el estado de editingOption
    setEditingOption({
      ...editingOption,
      items: [...editingOption.items, itemToAdd]
    });

    console.log(`Ítem "${newItem.name}" agregado a la opción "${editingOption.name}"`);

    // Reiniciar el formulario de item
    setNewItem({
      name: '',
      price_addition: 0,
      available: true,
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

                  const token = localStorage.getItem('token');
                  if (!token) {
                      throw new Error('No se encontró token de autenticación');
                  }

                  await axios.put(
                      `/api/product-options/${optionId}/items/${item.id}`,
                      item,
                      { headers: { Authorization: `Bearer ${token}` } }
                  );

                  await fetchOptions();
                  setEditingItem(null);
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

  if (loading && options.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">Cargando opciones...</p>
        </div>
      );
    }

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

  return (
    <div className="space-y-6">
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
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Agregar Item
                    </Button>
                  </div>
                </div>

                {/* Lista de items de la opción que se está editando */}
                {editingOption.items.length > 0 && (
                  <div className="mt-4 mb-6">
                    <h6 className="text-sm font-medium mb-2">Items agregados:</h6>
                    <div className="px-4 pb-4 border-b border-gray-200 rounded-lg bg-white shadow">
                      <ul className="divide-y divide-gray-200">
                        {editingOption.items.map((item, index) => (
                          <li key={index} className="py-3 flex justify-between items-center border-b border-gray-100">
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
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => removeItemFromEditingOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={loading || !editingOption.name || editingOption.items.length === 0}
                  >
                    {loading ? 'Guardando...' : 'Actualizar Opción'}
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
                        <div className="flex items-center">
                          <h5 className="font-medium text-lg">{option.name}</h5>
                          {option.required && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Obligatorio
                            </span>
                          )}
                          {option.multiple && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Múltiple
                            </span>
                          )}
                          {option.multiple && option.max_selections && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Máx: {option.max_selections}
                            </span>
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
                                    <span className="font-medium">{item.name}</span>
                                    {item.price_addition > 0 && (
                                      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                        +${item.price_addition.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                      {item.available ? 'Disponible' : 'No disponible'}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation(); // Evitar que se propague al hacer clic
                                        item.id && option.id && deleteItem(option.id, item.id);
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                      <Trash2 size={18} />
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
