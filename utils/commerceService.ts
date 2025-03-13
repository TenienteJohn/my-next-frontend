// services/commerceService.ts
import axios from 'axios';

// URL base del backend - asegúrate de que coincida con tu configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cartaenlinea-67dbc62791d3.herokuapp.com';

// Interfaz para tipos (opcional, pero recomendado si usas TypeScript)
interface CommerceData {
  commerce: {
    id: number;
    business_name: string;
    subdomain: string;
    logo_url?: string;
    banner_url?: string;
    // Añade más campos según tu estructura
  };
  categories: Array<{
    id: number;
    name: string;
    products: Array<{
      id: number;
      name: string;
      price: number;
      description?: string;
      image_url?: string;
    }>;
  }>;
}

/**
 * Obtiene los datos públicos de un comercio por su subdominio
 * @param subdomain - El subdominio del comercio
 * @returns Datos del comercio y sus categorías/productos
 */
export const getPublicCommerceData = async (subdomain: string): Promise<CommerceData> => {
  try {
    // Usa la ruta de API pública para obtener datos del comercio
    const response = await axios.get(`${API_BASE_URL}/api/public/${subdomain}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commerce data:', error);

    // Manejo de errores más detallado
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        throw new Error(`Error ${error.response.status}: ${error.response.data.message || 'No se pudo cargar el comercio'}`);
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        throw new Error('No se pudo conectar con el servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        throw new Error('Error al procesar la solicitud');
      }
    }

    throw error;
  }
};

/**
 * Extrae el subdominio actual de la URL
 * @returns El subdominio o null si no se encuentra
 */
export const getCurrentSubdomain = (): string | null => {
  // Solo se ejecuta en el navegador
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const parts = host.split('.');

    // Lógica para extraer subdominio
    if (parts.length > 2) {
      // Para dominios como burguer.my-next-frontend.vercel.app
      const subdomain = parts[0];

      // Excluir 'www' o nombres genéricos
      return subdomain !== 'www' && subdomain !== 'my-next-frontend' ? subdomain : null;
    }
  }

  return null;
};

/**
 * Verifica si el comercio existe para un subdominio dado
 * @param subdomain - El subdominio a verificar
 * @returns Booleano indicando si el comercio existe
 */
export const checkCommerceExists = async (subdomain: string): Promise<boolean> => {
  try {
    await getPublicCommerceData(subdomain);
    return true;
  } catch (error) {
    return false;
  }
};