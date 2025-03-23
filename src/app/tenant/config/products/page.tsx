'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductOptionsEditor from '@/components/products/ProductOptionsEditor';
import ProductTagSelector from '@/components/products/ProductTagSelector';
import { updateTagAssignments } from '@/utils/tagUtils';
import { Tag as TagComponent } from '@/components/ui/Tag';
import { Tag as TagType } from '@/types/tags'; // Renombramos para evitar conflicto

// Interfaces para tipos de producto y opciones
interface OptionItem {
  id?: number;
  option_id?: number;
  name: string;
  price_addition: number;
  available?: boolean;
}

interface ProductOption {
  id?: number;
  product_id?: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
}

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
  options?: ProductOption[];
  tags?: TagType[]; // Uso del tipo renombrado para etiquetas
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
    price: 0,
    category_id: 0,
    tags: [] // Inicialización de etiquetas
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Estado para gestionar la edición de opciones
  const [showOptionsEditor, setShowOptionsEditor] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState<number | null>(null);

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

      // Cargar categorías
      const categoriesResponse = await axios.get(`/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : [];

      setCategories(categoriesData);

      // Establecer categoría por defecto si hay categorías
      if (categoriesData.length > 0) {
        setCurrentProduct(prev => ({
          ...prev,
          category_id: categoriesData[0].id
        }));
      }

      // Cargar productos
      const productsResponse = await axios.get(`/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const productsData = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : [];

      // Procesar productos
      const processedProducts = productsData.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : Number(product.price) || 0,
        // Asegurar que las etiquetas estén disponibles
        tags: product.tags || []
      }));

      setProducts(processedProducts);
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
      price: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
      tags: [] // Resetear también las etiquetas
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones previas
    if (!currentProduct.name?.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }
    if (!currentProduct.category_id) {
      setError('Debe seleccionar una categoría');
      return;
    }
    if (currentProduct.price === undefined || currentProduct.price < 0) {
      setError('El precio debe ser mayor o igual a 0');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const productData = {
        name: currentProduct.name.trim(),
        description: (currentProduct.description || '').trim(),
        price: Number(currentProduct.price) || 0,
        category_id: currentProduct.category_id
      };

      const response = await axios.post(`/api/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const newProduct = response.data.product || response.data;

      // Lógica de subida de imagen
      if (selectedFile && newProduct.id) {
        const formData = new FormData();
        formData.append('image', selectedFile);

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

          if (imageResponse.data?.image_url) {
            newProduct.image_url = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.error('Error en subida de imagen:', imageError);
        }
      }

      // Actualización de lista de productos
      setProducts(prevProducts => {
        const productIndex = prevProducts.findIndex(p => p.id === newProduct.id);

        if (productIndex !== -1) {
          // Actualizar producto existente
          const updatedProducts = [...prevProducts];
          updatedProducts[productIndex] = {
            ...newProduct,
            price: typeof newProduct.price === 'number'
              ? newProduct.price
              : Number(newProduct.price) || 0
          };
          return updatedProducts;
        } else {
          // Añadir nuevo producto
          const nuevoProducto = {
            ...newProduct,
            price: typeof newProduct.price === 'number'
              ? newProduct.price
              : Number(newProduct.price) || 0
          };
          return [...prevProducts, nuevoProducto];
        }
      });

      // Asignar etiquetas al producto
      if (newProduct.id && currentProduct.tags && currentProduct.tags.length > 0) {
        try {
          // Obtener los IDs de las etiquetas seleccionadas
          const tagIds = currentProduct.tags.map(tag => tag.id || 0).filter(id => id !== 0);

          // Utilizar la función de utilidad para actualizar asignaciones de etiquetas
          await updateTagAssignments(newProduct.id, [], tagIds, 'product');
        } catch (tagError) {
          console.error('Error al asignar etiquetas al producto:', tagError);
          // No interrumpimos el proceso principal si falla la asignación de etiquetas
        }
      }

      // Resetear formulario
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al crear producto:', err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error al crear el producto'
        );
      } else {
        setError('Error inesperado al crear el producto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduct.id || !currentProduct.name || currentProduct.price === undefined || !currentProduct.category_id) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Preparar datos del producto
      const productData = {
        name: currentProduct.name,
        description: currentProduct.description || '',
        price: Number(currentProduct.price) || 0,
        category_id: currentProduct.category_id
      };

      // Actualizar producto
      const response = await axios.put(
        `/api/products/${currentProduct.id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedProduct = response.data.product || response.data;

      // Subir imagen si existe
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

          if (imageResponse.data && imageResponse.data.image_url) {
            updatedProduct.image_url = imageResponse.data.image_url;
          }
        } catch (imageError) {
          console.error('Error al actualizar la imagen:', imageError);
        }
      } else {
        // Conservar la URL de imagen existente
        updatedProduct.image_url = currentProduct.image_url;
      }

      // Actualizar la lista de productos
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === updatedProduct.id
          ? {
              ...updatedProduct,
              price: typeof updatedProduct.price === 'number'
                ? updatedProduct.price
                : Number(updatedProduct.price) || 0
            }
          : p)
      );

      // Actualizar etiquetas del producto
      if (currentProduct.id && currentProduct.tags) {
        try {
          // Buscar el producto original para obtener sus etiquetas actuales
          const originalProduct = products.find(p => p.id === currentProduct.id);
          const originalTagIds = (originalProduct?.tags || []).map(tag => tag.id || 0).filter(id => id !== 0);

          // Obtener los IDs de las nuevas etiquetas seleccionadas
          const newTagIds = currentProduct.tags.map(tag => tag.id || 0).filter(id => id !== 0);

          // Utilizar la función de utilidad para actualizar asignaciones de etiquetas
          await updateTagAssignments(currentProduct.id, originalTagIds, newTagIds, 'product');
        } catch (tagError) {
          console.error('Error al actualizar etiquetas del producto:', tagError);
          // No interrumpimos el proceso principal si falla la actualización de etiquetas
        }
      }

      // Resetear formulario
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      setError(err.response?.data?.error || 'Error al actualizar el producto');
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

      await axios.delete(`/api/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Eliminar el producto de la lista
      setProducts(prevProducts =>
        prevProducts.filter(p => p.id !== productToDelete.id)
      );
      setProductToDelete(null);
      setShowDeleteModal(false);
      setError(null);
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      setError(err.response?.data?.error || 'Error al eliminar el producto');
      setShowDeleteModal(false);
    }
  };

  // Abrir editor de opciones para un producto
  const openOptionsEditor = (productId: number) => {
    setSelectedProductForOptions(productId);
    setShowOptionsEditor(true);
  };

  // Cerrar editor de opciones
  const closeOptionsEditor = () => {
    setSelectedProductForOptions(null);
    setShowOptionsEditor(false);
    // Recargar productos para reflejar cambios en opciones
    fetchProductsAndCategories();
  };

  // Función para formatear precios
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).replace('CLP', '$');
  };

  // Método de renderizado de carga
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
            {/* Formulario de producto */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.name}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          value={currentProduct.category_id || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, category_id: Number(e.target.value) })}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={currentProduct.description || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentProduct.price || ''}
                            onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value ? Number(e.target.value) : 0 })}
                            className="w-full p-2 pl-7 border rounded-md"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Imagen
                        </label>
                        <div className="flex items-center">
                          {(previewUrl || currentProduct.image_url) && (
                            <div className="relative h-20 w-20 mr-4 border rounded-md overflow-hidden">
                              <Image
                                src={previewUrl || currentProduct.image_url || ''}
                                alt="Vista previa"
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selector de etiquetas para productos */}
                    <div className="mb-4">
                      <ProductTagSelector
                        selectedTags={currentProduct.tags || []}
                        onChange={(tags) => setCurrentProduct({ ...currentProduct, tags })}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {formMode === 'create' ? 'Creando...' : 'Actualizando...'}
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

            {/* Modal de opciones de producto */}
            {showOptionsEditor && selectedProductForOptions && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <ProductOptionsEditor
                    productId={selectedProductForOptions}
                    onUpdateComplete={closeOptionsEditor}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      onClick={closeOptionsEditor}
                      variant="outline"
                    >
                      Cerrar Editor de Opciones
                    </Button>
                  </div>
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
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                                {product.image_url ? (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500">{product.description.substring(0, 50)}{product.description.length > 50 ? '...' : ''}</div>
                              )}
                              {/* Mostrar etiquetas del producto */}
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex mt-1 gap-1">
                                  {product.tags.map(tag => (
                                    <TagComponent
                                      key={tag.id}
                                      name={tag.name}
                                      color={tag.color}
                                      textColor={tag.textColor || '#FFFFFF'}
                                      discount={tag.discount}
                                      size="sm"
                                    />
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {categories.find(c => c.id === product.category_id)?.name || 'Sin categoría'}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => openOptionsEditor(product.id)}
                                  variant="outline"
                                  className="text-purple-600 border-purple-600 hover:bg-purple-50 px-2 py-1 text-xs"
                                >
                                  Opciones
                                </Button>
                                <Button
                                  onClick={() => {
                                    setCurrentProduct(product);
                                    setPreviewUrl(product.image_url || null);
                                    setFormMode('edit');
                                    setShowForm(true);
                                    setSelectedFile(null);
                                  }}
                                  variant="outline"
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
                                                                  >
                                                                    Editar
                                                                  </Button>
                                                                  <Button
                                                                    onClick={() => {
                                                                      setProductToDelete(product);
                                                                      setShowDeleteModal(true);
                                                                    }}
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-600 hover:bg-red-50 px-2 py-1 text-xs"
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
