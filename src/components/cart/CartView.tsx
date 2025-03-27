// src/components/cart/CartView.tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { NoSwipeModal } from '@/components/ui/NoSwipeModal'; // Importar el nuevo componente

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  selected_options?: any[];
  quantity: number;
}

interface CartViewProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [showCheckoutAnimation, setShowCheckoutAnimation] = useState(false);

  // Calcular el total
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      let itemPrice = (item.price || 0) * (item.quantity || 1);

      if (item.selected_options && item.selected_options.length > 0) {
        item.selected_options.forEach((option) => {
          option.selected_items.forEach((selectedItem: any) => {
            itemPrice += (selectedItem.price_addition || 0) * (item.quantity || 1);
          });
        });
      }

      return sum + itemPrice;
    }, 0);
  };

  const total = calculateTotal();

  // Formatear precio
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Manejar el checkout con animación
  const handleCheckout = () => {
    setShowCheckoutAnimation(true);
    setTimeout(() => {
      setShowCheckoutAnimation(false);
      onCheckout();
    }, 500);
  };

  // Usamos el nuevo NoSwipeModal en lugar del componente modal con swipe
  return (
    <NoSwipeModal
      isOpen={isOpen}
      onClose={onClose}
      className="h-[90vh]"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <ShoppingCart size={24} className="text-green-500 mr-2" />
          <h2 className="text-xl font-bold">Tu carrito</h2>
          <div className="ml-2 bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-0.5">
            {items.reduce((count, item) => count + item.quantity, 0)}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Lista de items */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">¡Agrega productos para comenzar tu pedido!</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={`${item.id}_${JSON.stringify(item.selected_options)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start py-3 border-b border-gray-100 last:border-0"
              >
                {/* Imagen del producto */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      width={64}
                      height={64}
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 ml-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <div className="text-gray-600 font-medium">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Opciones seleccionadas */}
                  {item.selected_options && item.selected_options.length > 0 && (
                    <div className="mt-1 text-sm">
                      {item.selected_options.map((option, index) => (
                        option.selected_items.length > 0 && (
                          <div key={index} className="text-gray-500">
                            {option.option_name}:{' '}
                            {option.selected_items
                              .map((item: any) => item.item_name)
                              .join(', ')}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Control de cantidad */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center h-8 rounded-full border border-gray-200 overflow-hidden">
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} className="text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} className="text-gray-700" />
                      </button>
                    </div>
                    <div className="font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con total y checkout */}
      {items.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={showCheckoutAnimation}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-medium text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center"
          >
            {showCheckoutAnimation ? (
              <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Ir a pagar <ChevronRight size={20} className="ml-1" />
              </>
            )}
          </motion.button>
        </div>
      )}
    </NoSwipeModal>
  );
};

export default CartView;