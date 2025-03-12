'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [_loading, setLoading] = useState(true);
  const [_subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    // Detectar el subdominio actual
    const hostname = window.location.hostname;

    // En desarrollo: test.localhost:3000 -> test
    // En producción: burguer.cartaenlinea.com -> burguer
    let detectedSubdomain: string | null = null;

    if (hostname.includes('localhost')) {
      const parts = hostname.split('.');
      if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        detectedSubdomain = parts[0];
      }
    } else {
      const domainParts = hostname.split('.');
      if (domainParts.length >= 3 && domainParts[0] !== 'www') {
        detectedSubdomain = domainParts[0];
      }
    }

    setSubdomain(detectedSubdomain);
    setLoading(false);
  }, []);

  // No usamos estado de carga en el layout principal para no bloquear la renderización
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}