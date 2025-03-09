// src/app/tenant/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  products: Product[];
}

interface Commerce {
  id: number;
  business_name: string;
  business_category?: string;
  logo_url?: string;
  subdomain: string;
}

export default function TenantLandingPage() {
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoading(true);

        // Obtener el subdominio actual
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        console.log('Hostname detectado:', hostname);
        console.log('Subdominio extraído:', subdomain);

        if (subdomain === 'localhost' || subdomain === 'www') {
          setError('Este es el sitio principal. Por favor accede a través de un subdominio.');
          setLoading(false);
          return;
        }

        console.log('Realizando solicitud al proxy local para el subdominio:', subdomain);

        // Usar el proxy local en lugar de llamar directamente al backend
        const response = await axios.get(`/api/public/${subdomain}`);

        console.log('Respuesta del proxy recibida:', response.status);

        setCommerce(response.data.commerce);
        setCategories(response.data.categories);

        // Seleccionar la primera categoría por defecto si existe
        if (response.data.categories.length > 0) {
          setSelectedCategory(response.data.categories[0].id);
        }

      } catch (err: any) {
        console.error('Error cargando datos del tenant:', err);
        // Información más detallada sobre el error
        if (err.response) {
          console.error('Respuesta del servidor:', err.response.data);
          console.error('Estado HTTP:', err.response.status);
          setError(err.response.data?.error || `Error ${err.response.status}: Problema al cargar el menú`);
        } else if (err.request) {
          console.error('No se recibió respuesta del servidor');
          setError('No se recibió respuesta del servidor. Verifica tu conexión.');
        } else {
          console.error('Mensaje de error:', err.message);
          setError(err.message || 'No pudimos cargar el menú. Por favor intenta más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  // Obtener productos de la categoría seleccionada
  const currentCategoryProducts = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.products || []
    : [];

  // Formato para el precio
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).replace('CLP', '$');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600">Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.href = 'https://cartaenlinea.com'}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Ir a la página principal
          </button>
        </div>
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
        <div className="max-w-md w-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Comercio no encontrado</h2>
          <p className="text-yellow-600">No pudimos encontrar este comercio. Verifica que el subdominio sea correcto.</p>
          <button
            onClick={() => window.location.href = 'https://cartaenlinea.com'}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Ir a la página principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Banner de imagen principal */}
      <div className="relative w-full h-64 md:h-80">
        <Image
          src={commerce.logo_url || '/images/default-food-banner.jpg'}
          alt={commerce.business_name}
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="brightness-75"
        />

        {/* Botones de acción */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <Link href="/">
            <button className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </Link>
          <div className="flex space-x-2">
            <button className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="bg-white p-4 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Información del comercio */}
      <div className="bg-white shadow-md rounded-lg -mt-10 mx-4 relative z-10 p-6 mb-4">
        <div className="flex items-center mb-4">
          {commerce.logo_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 border border-gray-200">
              <Image
                src={commerce.logo_url}
                alt={commerce.business_name}
                width={64}
                height={64}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{commerce.business_name}</h1>
            {commerce.business_category && (
              <p className="text-gray-600">{commerce.business_category}</p>
            )}
          </div>
        </div>

        {/* Información de entrega y calificación */}
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          <div className="text-center px-2">
            <p className="text-gray-500 text-sm">Entrega</p>
            <p className="font-bold">20-30 min</p>
          </div>
          <div className="text-center px-2">
            <p className="text-gray-500 text-sm">Envío</p>
            <p className="font-bold">{formatPrice(990)}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-gray-500 text-sm">Calificación</p>
            <p className="font-bold flex items-center justify-center">
              4.8
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </p>
          </div>
        </div>

        {/* Botón de contacto o pedido */}
        <div className="mt-4">
          <Link href="/config">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition">
              Entrar a mi cuenta
            </button>
          </Link>
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="px-4 overflow-x-auto scrollbar-hidden">
          <div className="flex space-x-1 py-4 whitespace-nowrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Título de la sección */}
      {selectedCategory && (
        <div className="px-4 py-6">
          <h2 className="text-2xl font-bold">
            {categories.find(cat => cat.id === selectedCategory)?.name || 'Productos'}
          </h2>
        </div>
      )}

      {/* Productos */}
      <div className="px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {currentCategoryProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg overflow-hidden shadow-md relative"
              >
                {/* Imagen del producto */}
                <div className="relative w-full h-44 bg-gray-200">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Botón de agregar */}
                  <button className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {formatPrice(product.price)}
                  </div>
                  <h3 className="text-gray-700 font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {currentCategoryProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg">No hay productos en esta categoría</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 px-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} {commerce.business_name}</p>
        <p className="mt-1">
          Desarrollado con <span className="text-red-500">♥</span> por <a href="https://cartaenlinea.com" className="text-blue-500 hover:underline">CartaEnLinea</a>
        </p>
      </footer>
    </div>
  );
}