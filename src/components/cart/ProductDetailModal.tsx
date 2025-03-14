// src/components/cart/ProductDetailModal.tsx
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);

  // No renderizamos nada si no está abierto
  if (!isOpen) return null;

  // Formateamos el precio para que se vea como en la imagen de referencia
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Precio total basado en la cantidad
  const totalPrice = product.price * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera con X para cerrar */}
            <div className="relative">
              {/* Imagen del producto */}
              <div className="relative w-full h-64">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Botón para cerrar */}
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Detalles del producto */}
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(product.price)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
                {product.description && (
                  <p className="text-gray-600 mb-6">{product.description}</p>
                )}

                {/* Controles de cantidad */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-2xl border border-gray-300 rounded-l-full"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <div className="w-10 h-10 flex items-center justify-center border-t border-b border-gray-300">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-xl border border-gray-300 rounded-r-full"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <span>Agregar</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;