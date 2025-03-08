'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  commerce_id?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0, // Inicializado como 0 para evitar NaN
    category_id: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const router = useRouter();

  // Cargar productos y categorías al inicio
  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Usar el proxy local para obtener categorías
      const categoriesResponse = await axios.get(`/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Asegurarse que categories sea un array
      const categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : [];

      setCategories(categoriesData);
      console.log("Categorías cargadas:", categoriesData);

      // Si hay categorías, actualizar el valor por defecto del producto
      if (categoriesData.length > 0) {
        setCurrentProduct(prev => ({
          ...prev,
          category_id: categoriesData[0].id
        }));
      }

      // Obtener productos usando el proxy local
      try {
        const productsResponse = await axios.get(`/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Verificar la estructura de la respuesta e imprimir en consola
        console.log("Respuesta de productos:", productsResponse.data);

        // Asegurarse que sea un array
        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        // Convertir el precio a número para cada producto
        const processedProducts = productsData.map(product => ({
          ...product,
          price: typeof product.price === 'number' ? product.price : Number(product.price) || 0
        }));

        setProducts(processedProducts);
      } catch (productsError) {
        console.error("Error al obtener productos:", productsError);
        setProducts([]);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.error || 'Error al cargar datos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Crear vista previa
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Limpiar URL cuando el componente se desmonte
      return () => URL.revokeObjectURL(fileUrl);
    }
  };

  const resetForm = () => {
    setCurrentProduct({
      name: '',
      description: '',
      price: 0, // Siempre usar 0, no undefined
      category_id: categories.length > 0 ? categories[0].id : 0
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct.name || currentProduct.price === undefined || !currentProduct.category_id) {
      setError('Por favor completa los campos obligatorios (nombre, precio y categoría)');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Preparar datos asegurándose que price sea un número válido
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description || '',
        price: Number(currentProduct.price) || 0, // Convertir a número y usar 0 como fallback
        category_id: currentProduct.category_id
      };

      // Log de depuración
      console.log('Datos del producto a enviar:', productData);

      const response = await axios.post(
        `/api/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Respuesta de creación:', response.data);

      // Verificar si la respuesta tiene la estructura esperada
      const newProduct = response.data.product || response.data;

      // Asegurarse que el precio es un número
      newProduct.price = typeof newProduct.price === 'number'
        ? newProduct.price
        : Number(newProduct.price) || 0;

      // Si hay imagen, la subimos usando el proxy local
      if (selectedFile && newProduct.id) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        console.log('Subiendo imagen para el producto ID:', newProduct.id);

        try {
          const imageResponse = await axios.put(
            `/api/products/${newProduct.id}/update-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Respuesta de actualización de imagen:', imageResponse.data);

          // Actualizamos la URL de la imagen en el objeto del producto
          if (imageResponse.data && imageResponse.data.image_url) {
            newProduct.image_url = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.error('Error al subir la imagen:', imageError);
        }
      }

      // Agregamos el nuevo producto a la lista
      setProducts(prevProducts => [...prevProducts, newProduct]);

      // Reseteamos el formulario
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      // Mostrar más detalles del error
      if (err.response) {
        console.error('Respuesta del servidor:', err.response.data);
        setError(err.response.data?.error || `Error ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        console.error('No se recibió respuesta del servidor');
        setError('No se recibió respuesta del servidor. Verifica tu conexión.');
      } else {
        setError(`Error al crear el producto: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct.id || !currentProduct.name || currentProduct.price === undefined || !currentProduct.category_id) {
      setError('Por favor completa los campos obligatorios (nombre, precio y categoría)');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Asegurar que price sea un número
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description || '',
        price: Number(currentProduct.price) || 0,
        category_id: currentProduct.category_id
      };

      console.log('Actualizando producto con datos:', productData);

      const response = await axios.put(
        `/api/products/${currentProduct.id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta de actualización:', response.data);

      let updatedProduct = response.data.product || response.data;

      // Asegurarse que el precio es un número
      updatedProduct.price = typeof updatedProduct.price === 'number'
        ? updatedProduct.price
        : Number(updatedProduct.price) || 0;

      // Si hay nueva imagen, la subimos usando el proxy local
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
          const imageResponse = await axios.put(
            `/api/products/${currentProduct.id}/update-image`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Respuesta de actualización de imagen:', imageResponse.data);

          // Actualizamos la URL de la imagen
          if (imageResponse.data && imageResponse.data.image_url) {
            updatedProduct.image_url = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.error('Error al actualizar la imagen:', imageError);
        }
      } else {
        // Conservamos la URL de la imagen existente
        updatedProduct.image_url = currentProduct.image_url;
      }

      // Actualizar la lista de productos
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );

      // Resetear el formulario
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      if (err.response) {
        setError(err.response.data?.error || `Error ${err.response.status}: ${err.response.statusText}`);
      } else {
        setError(err.message || 'Error al actualizar el producto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      // Usar el proxy local para eliminar
      const response = await axios.delete(`/api/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Respuesta de eliminación:', response.data);

      // Eliminar el producto de la lista
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== productToDelete.id)
      );
      setProductToDelete(null);
      setShowDeleteModal(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      if (err.response) {
        setError(err.response.data?.error || `Error ${err.response.status}: ${err.response.statusText}`);
      } else {
        setError(err.message || 'Error al eliminar el producto');
      }
      setShowDeleteModal(false);
    }
  };

  if (loading && (!Array.isArray(products) || products.length === 0)) {
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
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
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

        {!Array.isArray(categories) || categories.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
            <p className="font-medium">¡Necesitas crear categorías primero!</p>
            <p className="mt-2">Antes de agregar productos, debes crear al menos una categoría.</p>
            <Button
              onClick={() => router.push('/config/categories')}
              className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Ir a gestión de categorías
            </Button>
          </div>
        ) : (
          <>
            {!showForm ? (
              <Button
                onClick={() => {
                  resetForm();
                  setFormMode('create');
                  setShowForm(true);
                }}
                className="mb-6 bg-green-500 hover:bg-green-600 text-white"
              >
                Crear Nuevo Producto
              </Button>
            ) : (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    {formMode === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
                  </h2>

                  <form onSubmit={formMode === 'create' ? handleCreateProduct : handleUpdateProduct}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.name || ''}
                          onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          value={currentProduct.category_id || ''}
                          onChange={(e) => setCurrentProduct({...currentProduct, category_id: parseInt(e.target.value)})}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Seleccione una categoría</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentProduct.price !== undefined ? currentProduct.price : 0}
                          onChange={(e) => {
                            const newPrice = e.target.value !== '' ? parseFloat(e.target.value) : 0;
                            setCurrentProduct({...currentProduct, price: newPrice});
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Imagen
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={currentProduct.description || ''}
                        onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Vista previa de la imagen */}
                    {(previewUrl || currentProduct.image_url) && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Vista previa</p>
                        <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                          <Image
                            src={previewUrl || currentProduct.image_url || ''}
                            alt="Vista previa"
                            fill
                            sizes="128px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setShowForm(false);
                        }}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </>
                        ) : (
                          formMode === 'create' ? 'Crear Producto' : 'Actualizar Producto'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Lista de productos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-lg font-semibold">Tus Productos</h2>
              </div>

              {!Array.isArray(products) || products.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No tienes productos creados. Crea un nuevo producto para comenzar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <AnimatePresence>
                        {products.map((product) => (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              {product.image_url ? (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    sizes="64px"
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-md">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${typeof product.price === 'number'
                                  ? product.price.toFixed(2)
                                  : (Number(product.price) || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => {
                                    // Convertir el precio a número
                                    const productToEdit = {
                                      ...product,
                                      price: typeof product.price === 'number'
                                        ? product.price
                                        : Number(product.price) || 0
                                    };
                                    setCurrentProduct(productToEdit);
                                    setPreviewUrl(product.image_url);
                                    setFormMode('edit');
                                    setShowForm(true);
                                  }}
                                  variant="outline"
                                  className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                >
                                  Editar
                                </Button>
                                <Button
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setShowDeleteModal(true);
                                  }}
                                  variant="outline"
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que deseas eliminar el producto <strong>"{productToDelete.name}"</strong>?
            </p>
            <p className="text-red-600 text-sm mb-4">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteProduct}
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