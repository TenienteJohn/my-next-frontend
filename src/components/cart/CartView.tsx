// src/components/cart/CartView.tsx
'use client';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface OptionItem {
  id: number;
  name: string;
  price?: number;
}

interface ProductOption {
  id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  options?: ProductOption[];
  selectedOptions?: {[key: number]: number | number[]};
  quantity: number;
}

interface CartViewProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export function CartView({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartViewProps) {
  // Formato para el precio
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).replace('CLP', '$');
  };

  // Calcular el total del carrito
  const totalAmount = items.reduce((sum, item) => {
    let itemPrice = item.price;

    // Sumar precios de opciones seleccionadas
    if (item.selectedOptions && item.options) {
      Object.entries(item.selectedOptions).forEach(([optionId, selectedItemIds]) => {
        const option = item.options!.find(opt => opt.id === parseInt(optionId));
        if (!option) return;

        // Manejar selecciones múltiples (arrays) y únicas (números)
        const itemIdsArray = Array.isArray(selectedItemIds) ? selectedItemIds : [selectedItemIds];

        itemIdsArray.forEach(itemId => {
          const optionItem = option.items.find(opt => opt.id === itemId);
          if (optionItem && optionItem.price) {
            itemPrice += optionItem.price;
          }
        });
      });
    }

    return sum + (itemPrice * item.quantity);
  }, 0);

  // Función auxiliar para obtener los nombres de las opciones seleccionadas
  const getSelectedOptionText = (product: Product, optionId: string, selectedItems: number | number[]): string => {
    if (!product.options) return '';

    const option = product.options.find(opt => opt.id === parseInt(optionId));
    if (!option) return '';

    const itemIds = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    return itemIds.map(itemId => {
      const item = option.items.find(optItem => optItem.id === itemId);
      return item ? item.name : '';
    }).filter(Boolean).join(', ');
  };

  // Calcular precio de item con opciones
  const calculateItemPrice = (item: Product): number => {
    let itemPrice = item.price;

    // Sumar precios de opciones seleccionadas
    if (item.selectedOptions && item.options) {
      Object.entries(item.selectedOptions).forEach(([optionId, selectedItemIds]) => {
        const option = item.options!.find(opt => opt.id === parseInt(optionId));
        if (!option) return;

        // Manejar selecciones múltiples (arrays) y únicas (números)
        const itemIdsArray = Array.isArray(selectedItemIds) ? selectedItemIds : [selectedItemIds];

        itemIdsArray.forEach(itemId => {
          const optionItem = option.items.find(opt => opt.id === itemId);
          if (optionItem && optionItem.price) {
            itemPrice += optionItem.price;
          }
        });
      });
    }

    return itemPrice;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full justify-end">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white shadow-xl transition-all h-full flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    Carrito de compras
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-gray-200 p-1.5 text-gray-600 hover:bg-gray-300 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-grow p-6 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
                    <p className="text-center">Agrega productos para comenzar tu pedido</p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Seguir comprando
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-grow overflow-y-auto p-4">
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div
                            key={`${item.id}-${JSON.stringify(item.selectedOptions || {})}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex border-b border-gray-100 py-3"
                          >
                            {/* Imagen del producto */}
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Detalles del producto */}
                            <div className="ml-4 flex flex-1 flex-col">
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">{formatPrice(calculateItemPrice(item) * item.quantity)}</p>
                              </div>

                              {/* Mostrar opciones seleccionadas */}
                              {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  {Object.entries(item.selectedOptions).map(([optionId, selectedItems]) => (
                                    <div key={optionId}>
                                      {getSelectedOptionText(item, optionId, selectedItems)}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-sm mt-2">
                                {/* Control de cantidad */}
                                <div className="flex items-center border rounded-full overflow-hidden bg-gray-50">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="px-2 py-1 font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Botón de eliminar */}
                                <button
                                  onClick={() => onRemoveItem(item.id)}
                                  className="ml-4 text-red-500 hover:text-red-600"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Resumen del pedido y botón de checkout */}
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                        <p>Total</p>
                        <p>{formatPrice(totalAmount)}</p>
                      </div>
                      <button
                        onClick={onCheckout}
                        className="w-full rounded-full bg-green-500 py-3 px-4 text-center font-medium text-white shadow-sm hover:bg-green-600 transition"
                      >
                        Confirmar pedido
                      </button>
                      <div className="mt-3 flex justify-center text-center text-sm text-gray-500">
                        <button
                          type="button"
                          className="font-medium text-green-600 hover:text-green-500"
                          onClick={onClose}
                        >
                          Seguir comprando
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}