// src/components/cart/ProductDetailModal.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces para opciones de producto (iguales a las de CartModule.tsx)
interface OptionItem {
  id: number;
  name: string;
  price_addition: number;
  available: boolean;
  image_url?: string;
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
}

interface SelectedOption {
  optionId: number;
  optionName: string;
  items: {
    id: number;
    name: string;
    price_addition: number;
  }[];
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedOptions: SelectedOption[]) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Record<number, boolean>>({});

  // Inicializar las opciones expandidas al abrir el modal
  useEffect(() => {
    if (isOpen && product.options) {
      const initialExpandedState: Record<number, boolean> = {};
      product.options.forEach(option => {
        initialExpandedState[option.id] = true; // Por defecto todas expandidas
      });
      setExpandedOptions(initialExpandedState);
    }
  }, [isOpen, product.options]);

  // Restablecer estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions([]);
      setValidationError(null);

      // Inicializar opciones
      if (product.options) {
        const initialOptions: SelectedOption[] = [];
        product.options.forEach(option => {
          initialOptions.push({
            optionId: option.id,
            optionName: option.name,
            items: []
          });
        });
        setSelectedOptions(initialOptions);
      }
    }
  }, [isOpen, product.id]);

  // No renderizamos nada si no está abierto
  if (!isOpen) return null;

  // Formateamos el precio para que se vea como en la imagen de referencia
  const formatPrice = (price: number) => {
    // Asegurémonos de que el precio sea un número
    const numericPrice = typeof price === 'number' ? price : 0;

    try {
      // Primero convertimos a string con el formato deseado
      return numericPrice.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace('CLP', '$').replace('.', ',');
    } catch (error) {
      // Si algo falla, usamos una versión más simple
      return '$' + numericPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  };

  // Calcular precio adicional basado en las opciones seleccionadas
  const calculateAdditionalPrice = () => {
    if (!product.options) return 0;

    let additionalPrice = 0;

    selectedOptions.forEach(selectedOption => {
      selectedOption.items.forEach(item => {
        additionalPrice += Number(item.price_addition) || 0;
      });
    });

    return additionalPrice;
  };

  // Precio adicional por opciones
  const additionalPrice = calculateAdditionalPrice();

  // Precio total basado en la cantidad
  const totalPrice = (product.price || 0) * quantity + additionalPrice * quantity;

  // Verificar si un ítem está seleccionado
  const isItemSelected = (optionId: number, itemId: number): boolean => {
    const option = selectedOptions.find(opt => opt.optionId === optionId);
    if (!option) return false;
    return option.items.some(item => item.id === itemId);
  };

  // Manejar selección de opción
  const handleOptionSelect = (option: ProductOption, item: OptionItem) => {
    setSelectedOptions(prev => {
      // Buscar la opción en el array de opciones seleccionadas
      const optionIndex = prev.findIndex(opt => opt.optionId === option.id);

      // Si la opción ya está seleccionada
      if (optionIndex >= 0) {
        const updatedOptions = [...prev];
        const itemIndex = updatedOptions[optionIndex].items.findIndex(it => it.id === item.id);

        // Si permite múltiples selecciones
        if (option.multiple) {
          // Si ya está seleccionado, quitar
          if (itemIndex >= 0) {
            updatedOptions[optionIndex].items = updatedOptions[optionIndex].items.filter(it => it.id !== item.id);
          }
          // Si no está seleccionado y no excede el máximo, añadir
          else if (!option.max_selections || updatedOptions[optionIndex].items.length < option.max_selections) {
            updatedOptions[optionIndex].items = [
              ...updatedOptions[optionIndex].items,
              { id: item.id, name: item.name, price_addition: item.price_addition }
            ];
          }
        }
        // Si solo permite una selección
        else {
          // Si ya está seleccionado, deseleccionar
          if (itemIndex >= 0) {
            updatedOptions[optionIndex].items = [];
          }
          // Si no está seleccionado, seleccionar solo este
          else {
            updatedOptions[optionIndex].items = [
              { id: item.id, name: item.name, price_addition: item.price_addition }
            ];
          }
        }

        return updatedOptions;
      }
      // Si la opción no está en el array, añadirla
      else {
        return [
          ...prev,
          {
            optionId: option.id,
            optionName: option.name,
            items: [{ id: item.id, name: item.name, price_addition: item.price_addition }]
          }
        ];
      }
    });

    // Limpiar error de validación cuando el usuario selecciona algo
    setValidationError(null);
  };

  // Alternar la expansión/colapso de una opción
  const toggleOption = (optionId: number) => {
    setExpandedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Verificar si todas las opciones requeridas tienen selecciones
  const validateRequiredOptions = (): boolean => {
    if (!product.options) return true;

    const requiredOptions = product.options.filter(option => option.required);

    for (const option of requiredOptions) {
      const selectedOption = selectedOptions.find(opt => opt.optionId === option.id);
      if (!selectedOption || selectedOption.items.length === 0) {
        setValidationError(`Por favor selecciona una opción de "${option.name}"`);

        // Auto-expandir la opción con error
        setExpandedOptions(prev => ({
          ...prev,
          [option.id]: true
        }));

        return false;
      }
    }

    return true;
  };

  // Manejar la adición al carrito
  const handleAddToCart = () => {
    // Validar opciones requeridas
    if (!validateRequiredOptions()) return;

    // Filtrar opciones que tienen al menos un ítem seleccionado
    const filledOptions = selectedOptions.filter(option => option.items.length > 0);

    onAddToCart({ ...product, quantity }, quantity, filledOptions);
    onClose();
  };

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
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

                          {/* Opciones del producto */}
                          {product.options && product.options.length > 0 && (
                            <div className="mb-6">
                              {product.options.map((option) => (
                                <div key={option.id} className="mb-4 border rounded-lg overflow-hidden">
                                  {/* Cabecera de la opción (siempre visible) */}
                                  <div
                                    className={`flex justify-between items-center p-4 cursor-pointer ${option.required ? 'bg-gray-50' : ''}`}
                                    onClick={() => toggleOption(option.id)}
                                  >
                                    <div className="flex items-center">
                                      <h3 className="font-bold text-lg">{option.name}</h3>
                                      {option.required && (
                                        <span className="ml-2 text-red-500 text-sm">*</span>
                                      )}
                                    </div>
                                    <div className="flex items-center">
                                      {/* Mostrar selecciones actuales en forma resumida */}
                                      {selectedOptions.find(opt => opt.optionId === option.id)?.items.length > 0 && (
                                        <span className="text-sm text-gray-500 mr-3">
                                          {selectedOptions
                                            .find(opt => opt.optionId === option.id)?.items
                                            .map(item => item.name)
                                            .join(', ')}
                                        </span>
                                      )}
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-5 w-5 transition-transform ${expandedOptions[option.id] ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Contenido de la opción (solo visible si está expandida) */}
                                  {expandedOptions[option.id] && (
                                    <div className="p-4 border-t">
                                      <div className="grid grid-cols-1 gap-2">
                                        {option.items && option.items.map((item) => (
                                          <button
                                            key={item.id}
                                            onClick={() => handleOptionSelect(option, item)}
                                            className={`flex justify-between items-center p-3 rounded-lg border ${
                                              isItemSelected(option.id, item.id)
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200'
                                            }`}
                                            disabled={!item.available}
                                          >
                                            <div className="flex items-center">
                                              <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center
                                                ${isItemSelected(option.id, item.id)
                                                  ? 'bg-green-500 border-green-500'
                                                  : 'border-gray-300'
                                                }`}
                                              >
                                                {isItemSelected(option.id, item.id) && (
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </div>
                                              <span className={`${!item.available ? 'text-gray-400' : ''}`}>
                                                {item.name}
                                              </span>
                                            </div>

                                            {item.price_addition > 0 && (
                                              <span className="font-medium">
                                                +{formatPrice(item.price_addition)}
                                              </span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Mensaje de error de validación */}
                              {validationError && (
                                <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {validationError}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Controles de cantidad */}
                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center text-2xl border-r border-gray-300"
                              >
                                −
                              </button>
                              <div className="w-10 h-10 flex items-center justify-center">
                                {quantity}
                              </div>
                              <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center text-xl border-l border-gray-300"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={handleAddToCart}
                              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                            >
                              <span>Agregar</span>
                              <span>{formatPrice(totalPrice)}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              );
            };

            export default ProductDetailModal;