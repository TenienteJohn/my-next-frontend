// src/app/tenant/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
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
  banner_url?: string;
  subdomain: string;
  is_open?: boolean;
  delivery_time?: string;
  delivery_fee?: number;
  min_order_value?: number;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
}

export default function TenantLandingPage() {
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  const fetchTenantData = useCallback(async () => {
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

      // Añadir un parámetro de timestamp para evitar el caché
      const timestamp = new Date().getTime();

      // Usar el proxy local en lugar de llamar directamente al backend
      const response = await axios.get(`/api/public/${subdomain}?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      console.log('Respuesta del proxy recibida:', response.status);
      console.log('Datos del comercio:', response.data.commerce);

      setCommerce(response.data.commerce);
      setCategories(response.data.categories);

      // Seleccionar la primera categoría por defecto si existe
      if (response.data.categories.length > 0) {
        setSelectedCategory(response.data.categories[0].id);
      }

    } catch (error: unknown) {
      console.error('Error cargando datos del tenant:', error);

      // Tipado seguro para los errores de Axios
      if (error && typeof error === 'object') {
        const err = error as {
          response?: {
            data?: { error?: string };
            status?: number;
          };
          request?: unknown;
          message?: string;
        };

        if (err.response) {
          console.error('Respuesta del servidor:', err.response.data);
          console.error('Estado HTTP:', err.response.status);
          setError(err.response.data?.error || `Error ${err.response.status}: Problema al cargar el menú`);
        } else if (err.request) {
          console.error('No se recibió respuesta del servidor');
          setError('No se recibió respuesta del servidor. Verifica tu conexión.');
        } else if (err.message) {
          console.error('Mensaje de error:', err.message);
          setError(err.message || 'No pudimos cargar el menú. Por favor intenta más tarde.');
        }
      } else {
        setError('Error desconocido al cargar el menú');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenantData();
  }, [fetchTenantData]);

  // Obtener productos de la categoría seleccionada
  const currentCategoryProducts = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.products || []
    : [];

  // Formato para el precio con validación de nulos
  const formatPrice = (price: number | null | undefined) => {
    // Si el precio es null o undefined, devolvemos un valor predeterminado
    if (price === null || price === undefined) {
      return '$0';
    }

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
      <div className="min-h-screen bg-white">
        {/* Banner con imagen de fondo - aproximadamente 30% menos alto que el original */}
        <div className="relative w-full h-28 mx-auto">
          <Image
            src={commerce.banner_url || '/images/default-food-banner.jpg'}
            alt={commerce.business_name}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />

          {/* Botones de acción minimalistas - MANTENIDOS A LA IZQUIERDA */}
          <div className="absolute top-4 left-4 flex justify-start items-center">
            <div className="flex space-x-1">
              <button
                onClick={() => fetchTenantData()}
                className="bg-white/70 hover:bg-white/90 p-2 rounded-full shadow-sm transition"
                title="Recargar datos"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                onClick={() => {
                  // Crear URL para compartir
                  const shareUrl = window.location.href;
                  const shareTitle = `Menú de ${commerce.business_name}`;

                  // Verificar si el navegador soporta la API de compartir
                  if (navigator.share) {
                    navigator.share({
                      title: shareTitle,
                      url: shareUrl
                    })
                    .catch(err => console.error('Error al compartir:', err));
                  } else {
                    // Fallback para navegadores que no soportan la API Share
                    try {
                      navigator.clipboard.writeText(shareUrl);
                      alert('¡Enlace copiado al portapapeles!');
                    } catch (err) {
                      console.error('Error al copiar enlace:', err);
                      prompt('Copia este enlace para compartir:', shareUrl);
                    }
                  }
                }}
                className="bg-white/70 hover:bg-white/90 p-2 rounded-full shadow-sm transition"
                title="Compartir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Etiqueta de Abierto/Cerrado */}
          {commerce.is_open !== undefined && (
            <div className="absolute top-4 right-4z-10">
            {commerce.is_open ? (
                          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            ABIERTO
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                            CERRADO
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Información del comercio estilo Rappi */}
                  <div className="px-4">
                    <div className="flex items-center mt-3 mb-3">
                      {commerce.logo_url && (
                        <div className="mr-2">
                          <Image
                            src={commerce.logo_url}
                            alt={commerce.business_name}
                            width={32}
                            height={32}
                            className="rounded-md"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <h1 className="text-2xl font-bold">{commerce.business_name}</h1>
                    </div>

                    {/* Tarjeta de información redondeada con iconos alineados - 30% más pequeña */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mx-0">
                      <div className="grid grid-cols-3 py-1">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center text-gray-400 mb-0.5">
                            <span className="text-xs mr-1">Entrega</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="font-bold text-base">{commerce.delivery_time || "16 min"}</p>
                        </div>

                        <div className="flex flex-col items-center border-l border-r border-gray-100">
                          <div className="flex items-center text-gray-400 mb-0.5">
                            <span className="text-xs mr-1">Envío</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <p className="font-bold text-base">
                            {commerce.delivery_fee !== undefined ? formatPrice(commerce.delivery_fee) : formatPrice(890)}
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center text-gray-400 mb-0.5">
                            <span className="text-xs mr-1">Calificación</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <p className="font-bold text-base">4.4 <span className="text-xs text-gray-400">(617)</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Opciones de entrega o recogida - botones pills - 30% más pequeños */}
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-0 bg-gray-100 p-0.5 rounded-full">
                        <button
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`py-1 px-3 rounded-full text-center font-medium text-xs transition ${
                            deliveryMethod === 'delivery'
                              ? 'bg-white shadow-md text-black'
                              : 'text-gray-500'
                          }`}
                        >
                          Domicilio
                        </button>
                        <button
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`py-1 px-3 rounded-full text-center font-medium text-xs transition ${
                            deliveryMethod === 'pickup'
                              ? 'bg-white shadow-md text-black'
                              : 'text-gray-500'
                          }`}
                        >
                          Recoger en tienda
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Categorías estilo Rappi - tabs con underline */}
                  <div className="mt-4 border-b">
                    <div className="relative">
                      <div
                        className="flex overflow-x-auto scrollbar-hide py-3 px-4"
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}
                      >
                        <button
                          className="flex-shrink-0 px-4 whitespace-nowrap font-bold transition mr-6 text-black border-b-2 border-black pb-1"
                        >
                          Populares
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex-shrink-0 px-4 whitespace-nowrap font-medium transition mr-6 ${
                              selectedCategory === category.id
                                ? 'text-black border-b-2 border-black pb-1'
                                : 'text-gray-400'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Productos estilo Rappi con diseño cuadrado */}
                        <div className="px-4 pt-6 pb-20">
                          <h2 className="text-3xl font-bold mb-4">
                            {categories.find(cat => cat.id === selectedCategory)?.name || 'Populares'}
                          </h2>

                          <div className="grid grid-cols-2 gap-4">
                            <AnimatePresence>
                              {currentCategoryProducts.map((product) => (
                                <motion.div
                                  key={product.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="pb-6 relative"
                                >
                                  {/* Contenedor principal del producto */}
                                  <div className="rounded-lg overflow-hidden relative">
                                    {/* Imagen del producto */}
                                    <div className="relative w-full h-44 bg-gray-100">
                                      {product.image_url ? (
                                        <Image
                                          src={product.image_url}
                                          alt={product.name}
                                          fill
                                          style={{ objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}

                                      {/* Botón de agregar (en la esquina superior derecha) */}
                                      <div className="absolute top-2 right-2">
                                        <button className="bg-green-500 text-white p-2 rounded-full shadow-lg w-10 h-10 flex items-center justify-center
                                          border-2 border-white/30
                                          hover:bg-green-600
                                          transition-all duration-200"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Información del producto (debajo de la imagen) */}
                                    <div className="mt-2">
                                      <div className="text-xl font-bold text-gray-900">
                                        {formatPrice(product.price)}
                                      </div>
                                      <h3 className="text-gray-800 font-medium line-clamp-2">{product.name}</h3>
                                      {product.description && (
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>

                          {currentCategoryProducts.length === 0 && categories.length > 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <p className="text-lg">No hay productos en esta categoría</p>
                            </div>
                          )}
                        </div>

                        {/* Footer simplificado */}
                        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 text-center text-gray-500 text-xs">
                          <p>© {new Date().getFullYear()} {commerce.business_name}</p>
                          <p className="mt-1">
                            Desarrollado por <a href="https://cartaenlinea.com" className="text-blue-500">CartaEnLinea</a>
                          </p>
                        </footer>
                      </div>
                    );
                  }
