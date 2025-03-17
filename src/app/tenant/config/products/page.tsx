'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProductOptionsEditor from '@/components/products/ProductOptionsEditor';

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
    category_id: 0
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
          price: typeof product.price === 'number' ? product.price : Number(product.price) || 0
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
        category_id: categories.length > 0 ? categories[0].id : 0
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    };

const handleCreateProduct = async (e: React.FormEvent) => {
  e.preventDefault();

  console.group('Creación de Producto');
  console.log('Datos de entrada:', {
    producto: currentProduct,
    categorias: categories,
    archivo: selectedFile ? {
      nombre: selectedFile.name,
      tipo: selectedFile.type,
      tamaño: selectedFile.size
    } : null
  });

  // Validaciones previas
  const errores = [];
  if (!currentProduct.name?.trim()) errores.push('Nombre requerido');
  if (!currentProduct.category_id) errores.push('Categoría requerida');
  if (currentProduct.price === undefined || currentProduct.price < 0) errores.push('Precio inválido');

  if (errores.length > 0) {
    console.error('Errores de validación:', errores);
    setError(errores.join(', '));
    console.groupEnd();
    return;
  }

  try {
    const token = localStorage.getItem('token');
    console.log('Token disponible:', !!token);

    const productData = {
      name: currentProduct.name.trim(),
      description: (currentProduct.description || '').trim(),
      price: Number(currentProduct.price) || 0,
      category_id: currentProduct.category_id
    };

    console.log('Datos del producto a enviar:', productData);

    const response = await axios.post(`/api/products`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta de creación:', {
      status: response.status,
      data: response.data
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

        console.log('Respuesta de subida de imagen:', {
          status: imageResponse.status,
          data: imageResponse.data
        });

        if (imageResponse.data?.image_url) {
          newProduct.image_url = imageResponse.data.image_url;
        }
      } catch (imageError) {
        console.error('Error en subida de imagen:', imageError);
      }
    }

    // Actualización de lista de productos
    setProducts(prevProducts => {
      console.log('Productos previos:', prevProducts);

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
        console.log('Producto actualizado:', updatedProducts[productIndex]);
        return updatedProducts;
      } else {
        // Añadir nuevo producto
        const nuevoProducto = {
          ...newProduct,
          price: typeof newProduct.price === 'number'
            ? newProduct.price
            : Number(newProduct.price) || 0
        };
        console.log('Nuevo producto añadido:', nuevoProducto);
        return [...prevProducts, nuevoProducto];
      }
    });

    // Resetear formulario
    resetForm();
    setShowForm(false);
    setError(null);

    console.log('Producto creado exitosamente');
  } catch (err) {
    console.error('Error completo:', err);

    // Manejo detallado de errores
    if (axios.isAxiosError(err)) {
      console.error('Detalles del error de Axios:', {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al crear el producto'
      );
    } else {
      setError('Error inesperado al crear el producto');
    }
  } finally {
    console.groupEnd();
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
                    {/* Contenido del formulario (campos de entrada, etc.) */}
                    {/* ... (código de formulario que ya implementamos anteriormente) ... */}
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
                            {/* Contenido de la fila de producto (imagen, nombre, etc.) */}
                            {/* ... (código de fila de producto que ya implementamos anteriormente) ... */}
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



