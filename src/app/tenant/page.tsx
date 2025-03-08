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

        if (subdomain === 'localhost' || subdomain === 'www') {
          setError('Este es el sitio principal. Por favor accede a través de un subdominio.');
          setLoading(false);
          return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

        // Obtener datos del comercio con su carta
        const response = await axios.get(`${apiBaseUrl}/api/public/${subdomain}`);

        setCommerce(response.data.commerce);
        setCategories(response.data.categories);

        // Seleccionar la primera categoría por defecto si existe
        if (response.data.categories.length > 0) {
          setSelectedCategory(response.data.categories[0].id);
        }

      } catch (err: any) {
        console.error('Error cargando datos del tenant:', err);
        setError(err.response?.data?.error || 'No pudimos cargar el menú. Por favor intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  // Filtrar productos por categoría seleccionada
  const filteredProducts = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.products || []
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Cabecera con información del comercio */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center">
          {commerce.logo_url && (
            <div className="relative w-24 h-24 mr-6 mb-4 md:mb-0 bg-white rounded-full overflow-hidden border-4 border-white">
              <Image
                src={commerce.logo_url}
                alt={commerce.business_name}
                fill
                sizes="96px"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          )}

          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold"
            >
              {commerce.business_name}
            </motion.h1>
            {commerce.business_category && (
              <p className="text-blue-100">{commerce.business_category}</p>
            )}
          </div>

          <div className="ml-auto mt-4 md:mt-0">
            <Link href="/config" className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition">
              Entrar a mi cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Menú de categorías */}
        <div className="mb-8 overflow-x-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-2 pb-2"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                {product.image_url && (
                  <div className="relative w-full h-48">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-md">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  {product.description && (
                    <p className="mt-2 text-gray-600">{product.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProducts.length === 0 && selectedCategory && (
            <div className="col-span-full text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4 text-gray-600">No hay productos en esta categoría</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© {new Date().getFullYear()} {commerce.business_name}</p>
          <p className="text-gray-400 text-sm">
            Desarrollado con <span className="text-red-500">♥</span> por <a href="https://cartaenlinea.com" className="underline hover:text-blue-300">CartaEnLinea</a>
          </p>
        </div>
      </footer>
    </div>
  );
}