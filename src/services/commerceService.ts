// src/services/commerceService.ts
import axios from 'axios';
import { CommerceData } from '@/types/commerce';

// Función para extraer el subdominio
export const getCurrentSubdomain = (): string | null => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Lógica similar al middleware
    if (hostname.includes('localhost')) {
      // Desarrollo: test.localhost:3000 -> test
      return parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost'
        ? parts[0]
        : null;
    } else {
      // Producción: burguer.cartaenlinea.com -> burguer
      return parts.length >= 3 && parts[0] !== 'www'
        ? parts[0]
        : null;
    }
  }
  return null;
};

// Función para obtener datos públicos de un comercio
export const getPublicCommerceData = async (subdomain: string): Promise<CommerceData> => {
  try {
    const response = await axios.get(`/api/public/${subdomain}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del comercio:', error);

    if (axios.isAxiosError(error)) {
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un error
        throw new Error(error.response.data.error || 'Error al cargar los datos del comercio');
      } else if (error.request) {
        // No se recibió respuesta
        throw new Error('No se pudo conectar con el servidor');
      }
    }

    throw new Error('Error desconocido al cargar los datos del comercio');
  }
};

// Verificar si un comercio existe
export const checkCommerceExists = async (subdomain: string): Promise<boolean> => {
  try {
    await getPublicCommerceData(subdomain);
    return true;
  } catch {
    return false;
  }
};