'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function OwnerConfigPanel() {
  const [commerce, setCommerce] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Verificar que el usuario sea OWNER
    const role = localStorage.getItem('role');
    if (role !== 'OWNER') {
      setError('No tienes permisos para acceder a esta página');
      return;
    }

    // Cargar los datos del comercio y categorías
    const fetchData = async () => {
      try {
        setLoading(true);

        // Usar el proxy local en lugar del endpoint directo
        // Obtener datos del comercio
        const commerceResponse = await fetch(`/api/commerces/my-commerce`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!commerceResponse.ok) {
          throw new Error('No se pudo cargar la información del comercio');
        }

        const commerceData = await commerceResponse.json();
        console.log('Datos del comercio recibidos:', commerceData);
        setCommerce(commerceData);

        // Obtener categorías del comercio
        const categoriesResponse = await fetch(`/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!categoriesResponse.ok) {
          throw new Error('No se pudo cargar la información de categorías');
        }

        const categoriesData = await categoriesResponse.json();
        console.log('Datos de categorías recibidos:', categoriesData);
        setCategories(categoriesData);

        setError(null);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

          {commerce && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">{commerce.business_name}</h2>
              <p className="text-gray-600">
                Subdominio: <span className="font-medium">{commerce.subdomain}</span>
              </p>
              {commerce.business_category && (
                <p className="text-gray-600">
                  Categoría: <span className="font-medium">{commerce.business_category}</span>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Tarjeta para Categorías */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle>Categorías</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Administra las categorías de productos de tu menú.
                </p>
                <Link href="/config/categories" passHref>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition cursor-pointer"
                  >
                    Gestionar Categorías
                  </motion.div>
                </Link>
              </CardContent>
            </Card>

            {/* Tarjeta para Productos */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Administra los productos disponibles en tu menú.
                </p>
                <Link href="/config/products" passHref>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-green-500 text-white text-center rounded-md hover:bg-green-600 transition cursor-pointer"
                  >
                    Gestionar Productos
                  </motion.div>
                </Link>
              </CardContent>
            </Card>

            {/* Tarjeta para Configuración */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle>Configuración</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Personaliza la apariencia de tu carta en línea.
                </p>
                <Link href="/config/settings" passHref>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-purple-500 text-white text-center rounded-md hover:bg-purple-600 transition cursor-pointer"
                  >
                    Personalizar
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-600">Total de Categorías</p>
                <p className="text-2xl font-bold">{Array.isArray(categories) ? categories.length : 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-sm text-green-600">Total de Productos</p>
                <p className="text-2xl font-bold">--</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-md">
                <p className="text-sm text-orange-600">Visibilidad</p>
                <p className="text-2xl font-bold">Activa</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}