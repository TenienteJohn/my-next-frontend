// src/components/products/ProductOptionsEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await axios.get(`/api/product-options/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOptions(response.data || []);
    } catch (err: any) {
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
        `/api/products/${productId}/options`,
        newOption,
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
    } catch (err: any) {
      console.error('Error al agregar opción:', err);
      setError(err.response?.data?.error || 'Error al agregar la opción');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOption = async () => {
    if (!editingOption || !editingOption.id) return;

    try {
      setLoading(true);
      setError(null);

      // Validar que la opción tenga nombre
      if (!editingOption.name.trim()) {
        setError('El nombre de la opción es obligatorio');
        return;
      }

      // Validar que tenga al menos un item
      if (editingOption.items.length === 0) {
        setError('Debe agregar al menos un item a la opción');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      await axios.put(
        `/api/options/${editingOption.id}`,
        editingOption,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refrescar la lista de opciones
      await fetchOptions();

      // Reiniciar el formulario de edición
      setEditingOption(null);

      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (err: any) {
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

      await axios.delete(`/api/options/${optionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refrescar la lista de opciones
      await fetchOptions();

      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (err: any) {
      console.error('Error al eliminar opción:', err);
      setError(err.response?.data?.error || 'Error al eliminar la opción');
    } finally {
      setLoading(false);
    }
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

    // Agregar item a la opción que se está editando
    setEditingOption({
      ...editingOption,
      items: [...editingOption.items, { ...newItem }]
    });

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

  const removeItemFromEditingOption = (index: number) => {
    if (!editingOption) return;

    const updatedItems = [...editingOption.items];
    updatedItems.splice(index, 1);
    setEditingOption({ ...editingOption, items: updatedItems });
  };

  if (loading && options.length === 0) {
    return <div className="text-center py-4">Cargando opciones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Opciones del Producto</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
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
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Nueva Opción</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={newOption.name}
                      onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder="Ej: Tamaño, Sabor, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newOption.required}
                        onChange={(e) => setNewOption({ ...newOption, required: e.target.checked })}
                        className="mr-2"
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
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Agregar Item
                    </Button>
                  </div>
                </div>

                {/* Lista de items agregados */}
                {newOption.items.length > 0 && (
                  <div className="mt-4 mb-6">
                    <h6 className="text-sm font-medium mb-2">Items agregados:</h6>
                    <div className="bg-gray-50 p-2 rounded">
                      <ul className="divide-y divide-gray-200">
                        {newOption.items.map((item, index) => (
                          <li key={index} className="py-2 flex justify-between items-center">
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
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
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={loading || !newOption.name || newOption.items.length === 0}
                  >
                    {loading ? 'Guardando...' : 'Guardar Opción'}
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
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-4">Editar Opción</h4>
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
                    <div className="bg-gray-50 p-2 rounded">
                      <ul className="divide-y divide-gray-200">
                        {editingOption.items.map((item, index) => (
                          <li key={index} className="py-2 flex justify-between items-center">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.price_addition > 0 && (
                                <span className="ml-2 text-gray-600">
                                  (+${item.price_addition.toFixed(2)})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeItemFromEditingOption(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
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
            <Card key={option.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h5 className="font-medium">{option.name}</h5>
                    <div className="text-sm text-gray-500 mt-1">
                      {option.required && <span className="inline-block mr-3">Obligatorio</span>}
                      {option.multiple && <span className="inline-block mr-3">Selección múltiple</span>}
                      {option.multiple && option.max_selections &&
                        <span className="inline-block">Max: {option.max_selections}</span>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setEditingOption(option)}
                      variant="outline"
                      className="text-blue-500 border-blue-500"
                    >
                      Editar
                    </Button>
                    <Button
                      onClick={() => option.id && handleDeleteOption(option.id)}
                      variant="outline"
                      className="text-red-500 border-red-500"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                {/* Lista de items de la opción */}
                <div className="bg-gray-50 p-2 rounded">
                  <h6 className="text-sm font-medium mb-1">Items:</h6>
                  <ul className="divide-y divide-gray-200">
                    {option.items.map((item) => (
                      <li key={item.id} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.price_addition > 0 && (
                            <span className="ml-2 text-gray-600">
                              (+${item.price_addition.toFixed(2)})
                            </span>
                          )}
                        </div>
                        {!item.available && (
                          <span className="text-amber-600 text-sm">No disponible</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
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