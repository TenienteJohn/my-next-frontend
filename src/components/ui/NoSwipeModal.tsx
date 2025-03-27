// src/components/ui/NoSwipeModal.tsx
'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoSwipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Una versión del modal que deshabilita específicamente el comportamiento de swipe
 * Útil para modales que contienen elementos con scroll donde el swipe para cerrar
 * interfiere con la experiencia del usuario.
 */
export const NoSwipeModal: React.FC<NoSwipeModalProps> = ({
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Bloqueo de scroll sin comportamiento de swipe
  useEffect(() => {
    if (!isOpen) return;

    // Almacenar la posición de scroll actual
    const scrollY = window.scrollY;

    // Fijar el cuerpo para evitar scroll en el fondo
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      // Restaurar el scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Detener propagación de clics para evitar cierre accidental
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[1px]"
          ref={modalRef}
          onClick={onClose}
        >
          <motion.div
            ref={contentRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              duration: 0.3
            }}
            className={`bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ${className}`}
            onClick={handleContentClick}
            // Estilos específicos para prevenir el swipe
            style={{
              boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
              touchAction: 'pan-y', // Solo permitir scroll vertical
              WebkitOverflowScrolling: 'touch', // Mejorar el scroll en iOS
              overscrollBehavior: 'none', // Prevenir el pull-to-refresh
              willChange: 'transform', // Optimizar rendimiento
            }}
          >
            {/* Barra superior con una línea decorativa */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
            </div>

            {/* Header con título opcional */}
            {(title || showCloseButton) && (
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Contenido con scroll - sin comportamiento de swipe */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoSwipeModal;