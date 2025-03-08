'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Logout from '@/components/Logout';

interface Commerce {
  id: number;
  business_name: string;
  subdomain: string;
  logo_url?: string;
  business_category?: string;
}

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

    // Cargar los datos del comercio
    const fetchCommerce = async () => {
      try {
        setLoading(true);

        // Obtener token del localStorage
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);

        if (!token) {
          router.push('/login');
          return;
        }

        // Usar el proxy local en lugar del endpoint directo
        console.log('Iniciando solicitud de datos del comercio');
        const response = await fetch(`/api/commerces/my-commerce`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Respuesta recibida:', {
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en respuesta:', errorText);
          throw new Error('No se pudo cargar la información del comercio');
        }

        const data = await response.json();
        console.log('Datos del comercio recibidos:', data);
        setCommerce(data);
        setError(null);
      } catch (err: any) {
        console.error('Error cargando datos del comercio:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchCommerce();
  }, [router]);

  // Navegar a la landing page del comercio
  const goToLandingPage = () => {
    if (commerce) {
      // En desarrollo usamos el mismo dominio con subdominios
      if (window.location.hostname.includes('localhost')) {
        window.location.href = `http://${commerce.subdomain}.localhost:3000`;
      } else {
        // En producción (Vercel)
        window.location.href = `https://${commerce.subdomain}.cartaenlinea.com`;
      }
    }
  };

  // Lista de enlaces para la navegación
  const navLinks = [
    { name: 'Panel Principal', href: '/config', icon: 'home' },
    { name: 'Categorías', href: '/config/categories', icon: 'category' },
    { name: 'Productos', href: '/config/products', icon: 'product' },
    { name: 'Configuración', href: '/config/settings', icon: 'settings' },
  ];

  // Función para renderizar el icono correspondiente
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        );
      case 'category':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'product':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        );
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-800 text-white">
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            {commerce?.logo_url && (
              <div className="relative w-10 h-10 bg-white rounded-full overflow-hidden">
                <Image
                  src={commerce.logo_url}
                  alt={commerce.business_name}
                  fill
                  sizes="40px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">
                {commerce?.business_name || 'Mi Comercio'}
              </h2>
              <p className="text-xs text-blue-300 truncate">
                {commerce?.subdomain}.cartaenlinea.com
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/config' && pathname?.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 p-3 rounded-md transition ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700/50'
                }`}
              >
                {renderIcon(link.icon)}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            onClick={goToLandingPage}
            className="flex items-center space-x-2 text-blue-200 hover:text-white p-3 w-full rounded-md hover:bg-blue-700/50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Ver mi sitio</span>
          </button>

          <div className="mt-3">
            <Logout />
          </div>
        </div>
      </aside>

      {/* Header móvil */}
      <div className="md:hidden bg-blue-800 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {commerce?.logo_url && (
              <div className="relative w-8 h-8 bg-white rounded-full overflow-hidden">
                <Image
                  src={commerce.logo_url}
                  alt={commerce.business_name}
                  fill
                  sizes="32px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <h2 className="text-lg font-bold truncate">
              {commerce?.business_name || 'Mi Comercio'}
            </h2>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-blue-700"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/config' && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 p-3 rounded-md transition ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {renderIcon(link.icon)}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                goToLandingPage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-blue-200 hover:text-white p-3 w-full rounded-md hover:bg-blue-700/50 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>Ver mi sitio</span>
            </button>

            <div className="pt-2 border-t border-blue-700">
              <Logout />
            </div>
          </motion.nav>
        )}
      </div>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}