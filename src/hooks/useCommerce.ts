// src/hooks/useCommerce.ts
import { useState, useEffect } from 'react';
import {
  getPublicCommerceData,
  getCurrentSubdomain
} from '@/services/commerceService';
import { CommerceData } from '@/types/commerce';

export const useCommerce = () => {
  const [commerceData, setCommerceData] = useState<CommerceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommerceData = async () => {
      try {
        const subdomain = getCurrentSubdomain();

        if (!subdomain) {
          setError('No se encontró subdominio');
          setLoading(false);
          return;
        }

        const data = await getPublicCommerceData(subdomain);
        setCommerceData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);

        // Asegurarse de que sea un error con mensaje
        const errorMessage = err instanceof Error
          ? err.message
          : 'Error desconocido al cargar los datos del comercio';

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCommerceData();
  }, []);

  return {
    commerceData,
    loading,
    error,
    subdomain: getCurrentSubdomain()
  };
};