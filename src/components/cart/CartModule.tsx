// src/components/cart/CartModule.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  quantity?: number;
}

interface CartModuleProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const CartModule: React.FC<CartModuleProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);

  // Resetear la cantidad cuando se abre con un nuevo producto
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product.id]);

  // Formatear el precio con separadores de miles (usando coma como en la imagen)
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Calcular el precio total
  const totalPrice = (product.price || 0) * (quantity || 1);

  // Incrementar y decrementar cantidad
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Manejar la adición al carrito
  const handleAddToCart = () => {
    onAddToCart({...product, quantity}, quantity);
    onClose();
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black bg-opacity-50"
        >
          {/* Contenedor principal del modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Botón de cerrar en la parte superior */}
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-100">
              <button
                onClick={onClose}
                className="p-2 rounded-full"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-1"></div>
              <button className="p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            {/* Contenido del producto */}
            <div className="p-6">
              {/* Imagen del producto */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Precio */}
              <div className="text-3xl font-bold mb-2">
                {formatPrice(product.price)}
              </div>

              {/* Nombre y descripción */}
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              {/* Línea separadora */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Botones de cantidad */}
              <div className="flex items-center justify-between my-6">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="w-12 h-12 flex items-center justify-center text-3xl font-semibold text-gray-500 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                {/* Botón de agregar */}
                <button
                  onClick={handleAddToCart}
                  className="bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition-colors"
                >
                  Agregar {formatPrice(Number(product.price || 0) * Number(quantity || 1))}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente para el botón de carrito y el contador de productos
export const CartButton: React.FC<{
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}> = ({ itemCount, totalAmount, onClick }) => {
  // No mostrar el botón si no hay items
  if (itemCount === 0) return null;

  // Formatear el precio total
  const formattedTotal = totalAmount.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace('CLP', '$').replace('.', ',');

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={onClick}
        className="w-full bg-green-500 text-white py-3 px-6 rounded-full shadow-lg flex justify-between items-center"
      >
        <div className="bg-white text-green-500 rounded-full w-7 h-7 flex items-center justify-center font-bold">
          {itemCount}
        </div>
        <span className="font-bold">Ver carrito</span>
        <span className="font-bold">{formattedTotal}</span>
      </motion.button>
    </div>
  );
};

// Componente de carrito completo
export const CartView: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: (Product & { quantity: number })[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}> = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular el total
  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Formatear el precio con separadores de miles (usando coma como en la imagen)
  const formatPrice = (price: number) => {
    // Asegurar que es un número
    const numericPrice = Number(price) || 0;

    // Convertir a entero (quitar decimales)
    const intPrice = Math.round(numericPrice);

    // Formatear manualmente
    const priceString = intPrice.toString();
    let formattedPrice = '';

    // Agregar separadores de miles (puntos para formato chileno)
    for (let i = 0; i < priceString.length; i++) {
      if (i > 0 && (priceString.length - i) % 3 === 0) {
        formattedPrice += '.';
      }
      formattedPrice += priceString[i];
    }

    // Reemplazar punto por coma según el formato chileno mostrado en la imagen
    formattedPrice = formattedPrice.replace(/\./g, ',');

    return '$' + formattedPrice;
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Encabezado */}
            <div className="sticky top-0 bg-white p-4 border-b">
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="font-bold text-xl">Tu pedido</h2>
                <div className="w-6"></div> {/* Espaciador para centrar el título */}
              </div>
            </div>

            {/* Lista de productos */}
            <div className="p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center border-b border-gray-100 pb-4">
                      {/* Imagen del producto */}
                      <div className="relative w-16 h-16 rounded overflow-hidden mr-3">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <span className="font-bold">{formatPrice(item.price * (item.quantity || 1))}</span>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                            <button
                              onClick={() => {
                                const newQuantity = (item.quantity || 1) - 1;
                                if (newQuantity <= 0) {
                                  onRemoveItem(item.id);
                                } else {
                                  onUpdateQuantity(item.id, newQuantity);
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center text-xl font-semibold text-gray-500"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-8 h-8 flex items-center justify-center text-xl font-semibold text-gray-500"
                            >
                              +
                            </button>
                          </div>

                          {/* Botón para eliminar */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Botón de checkout */}
            {items.length > 0 && (
              <div className="sticky bottom-0 w-full p-4 bg-white border-t">
                <button
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      onCheckout();
                      setIsSubmitting(false);
                    }, 1000);
                  }}
                  disabled={isSubmitting}
                  className={`w-full bg-green-500 text-white py-3 px-6 rounded-full font-bold text-lg flex justify-between items-center ${
                    isSubmitting ? 'opacity-75' : 'hover:bg-green-600'
                  }`}
                >
                  <span>{isSubmitting ? 'Procesando...' : 'Realizar pedido'}</span>
                  <span>{formatPrice(totalAmount)}</span>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};