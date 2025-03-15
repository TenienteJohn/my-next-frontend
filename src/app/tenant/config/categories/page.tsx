'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
  commerce_id: number;
  position?: number; // Añadimos position para mantener el orden
  created_at?: string;
  updated_at?: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const router = useRouter();

  // Cargar las categorías al inicio
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Usar el proxy local en lugar del endpoint directo
      console.log('Obteniendo categorías...');
      const response = await axios.get(`/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Categorías recibidas:', response.data);

      // Ordenar categorías por la propiedad position si existe, o mantener el orden actual
      const sortedCategories = [...response.data].sort((a, b) => {
        // Si ambos tienen position, ordenar por position
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }
        // Si solo uno tiene position, poner primero el que tiene position
        if (a.position !== undefined) return -1;
        if (b.position !== undefined) return 1;
        // Si ninguno tiene position, mantener el orden original
        return 0;
      });

      setCategories(sortedCategories);
      setError(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Error desconocido';
      console.error('Error:', errorMessage);
      setError('Error al cargar las categorías. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Calcular la siguiente posición (al final de la lista)
      const nextPosition = categories.length;

      // Usar el proxy local en lugar del endpoint directo
      console.log('Enviando solicitud de creación de categoría...');
      const response = await axios.post(`/api/categories`,
        {
          name: newCategoryName,
          position: nextPosition // Añadir position al crear
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta de creación:', response.data);

      // Agregar la nueva categoría a la lista
      const newCategory = response.data.category || response.data;
      setCategories([...categories, {
        ...newCategory,
        position: nextPosition
      }]);

      setNewCategoryName('');
      setError(null);
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      setError(err.response?.data?.error || 'Error al crear la categoría');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Usar el proxy local en lugar del endpoint directo
      console.log('Actualizando categoría...');
      const response = await axios.put(
        `/api/categories/${editingCategory.id}`,
        {
          name: editingCategory.name,
          position: editingCategory.position // Mantener la posición al actualizar
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta de actualización:', response.data);

      // Actualizar la lista de categorías
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? {...cat, name: editingCategory.name} : cat
      ));

      setEditingCategory(null);
      setError(null);
    } catch (err: any) {
      console.error('Error al actualizar categoría:', err);
      setError(err.response?.data?.error || 'Error al actualizar la categoría');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Usar el proxy local en lugar del endpoint directo
      console.log('Eliminando categoría...');
      const response = await axios.delete(`/api/categories/${categoryToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Respuesta de eliminación:', response.data);

      // Eliminar la categoría de la lista
      setCategories(prevCategories => {
        const newCategories = prevCategories.filter(cat => cat.id !== categoryToDelete.id);

        // Reordenar las posiciones de todas las categorías restantes
        return newCategories.map((cat, index) => ({
          ...cat,
          position: index
        }));
      });

      setCategoryToDelete(null);
      setShowDeleteModal(false);
      setError(null);

      // Guardar el nuevo orden después de eliminar
      saveNewOrder([...categories].filter(cat => cat.id !== categoryToDelete.id));

    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      setError(err.response?.data?.error || 'Error al eliminar la categoría. Podría contener productos asociados.');
      setShowDeleteModal(false);
    }
  };

  // Nueva función para guardar el orden de las categorías
  const saveNewOrder = async (orderedCategories: Category[] = categories) => {
    try {
      setIsSavingOrder(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Crear array con el nuevo orden para enviar al backend
      const orderData = orderedCategories.map((cat, index) => ({
        id: cat.id,
        position: index
      }));

      // Enviar el nuevo orden al backend
      await axios.post(
        `/api/categories/reorder`,
        { categories: orderData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado local con el nuevo orden
      setCategories(orderedCategories.map((cat, index) => ({
        ...cat,
        position: index
      })));

      setOrderChanged(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al guardar el orden:', err);
      setError(err.response?.data?.error || 'Error al guardar el orden de las categorías');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleReorder = (reorderedList: Category[]) => {
    // Actualizar la lista con el nuevo orden
    setCategories(reorderedList.map((item, index) => ({
      ...item,
      position: index // Actualizar la posición basada en el nuevo índice
    })));

    setOrderChanged(true); // Indicar que el orden ha cambiado y no se ha guardado
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <Button
            onClick={() => router.push('/config')}
            variant="outline"
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al panel
          </Button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          >
            {error}
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-red-500">×</span>
            </button>
          </motion.div>
        )}

        {/* Formulario para crear nueva categoría */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Crear Nueva Categoría</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  'Crear Categoría'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de categorías con reordenamiento */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tus Categorías</h2>

            {/* Botón para guardar cambios en el orden */}
            {orderChanged && (
              <Button
                onClick={() => saveNewOrder()}
                disabled={isSavingOrder}
                className="bg-green-500 hover:bg-green-600 text-white text-sm"
              >
                {isSavingOrder ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Orden'
                )}
              </Button>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tienes categorías creadas. Crea una nueva categoría para comenzar.
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <Reorder.Group
                axis="y"
                values={categories}
                onReorder={handleReorder}
                className="divide-y divide-gray-200"
              >
                <AnimatePresence>
                  {categories.map((category) => (
                    <Reorder.Item
                      key={category.id}
                      value={category}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="p-4 flex items-center justify-between bg-white cursor-move"
                    >
                      {editingCategory && editingCategory.id === category.id ? (
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <Button
                            onClick={handleUpdateCategory}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-2"
                            disabled={!editingCategory.name.trim()}
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => setEditingCategory(null)}
                            variant="outline"
                            className="py-1 px-2"
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center flex-1">
                            {/* Icono de arrastrar */}
                            <div className="mr-3 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                            <span className="text-gray-800">{category.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setEditingCategory(category)}
                              variant="outline"
                              className="text-blue-500 border-blue-500 hover:bg-blue-50"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => {
                                setCategoryToDelete(category);
                                setShowDeleteModal(true);
                              }}
                              variant="outline"
                              className="text-red-500 border-red-500 hover:bg-red-50"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </div>
          )}
        </div>

        {/* Instrucciones sobre ordenamiento */}
        {categories.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md text-blue-800 text-sm">
            <p className="font-medium">Instrucciones de uso:</p>
            <p>Arrastra y suelta las categorías para cambiar su orden. Haz clic en "Guardar Orden" después de reorganizar.</p>
            <p>Este orden se reflejará en cómo se muestran las categorías en el menú de tu negocio.</p>
          </div>
        )}
      </motion.div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete.name}"</strong>?
            </p>
            <p className="text-red-600 text-sm mb-4">
              Esta acción no se puede deshacer. Si la categoría tiene productos, estos quedarán sin categoría.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteCategory}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Eliminar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}