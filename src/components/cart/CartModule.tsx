// src/components/cart/CartModule.tsx
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Interfaces para opciones de producto
interface OptionItem {
  id: number;
  option_id: number;
  name: string;
  price_addition: number;
}

interface ProductOption {
  id: number;
  product_id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
}

interface SelectedOption {
  option_id: number;
  option_name: string;
  selected_items: {
    item_id: number;
    item_name: string;
    price_addition: number;
  }[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  options?: ProductOption[];
  selected_options?: SelectedOption[];
  quantity?: number;
}

interface CartModuleProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

// Función para bloquear el scroll en iOS - VERSIÓN OPTIMIZADA
const useBodyScrollLock = (isOpen: boolean, modalRef: React.RefObject<HTMLDivElement>) => {
  // Detectamos iOS
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const scrollY = useRef(0);

  useEffect(() => {
    // Inyectar estilos globales para iOS si no existen
    if (!document.getElementById('ios-modal-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ios-modal-styles';
      styleEl.innerHTML = `
        .body-scroll-lock {
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .modal-content-scroll {
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain;
          overflow-y: auto !important;
          overflow-x: hidden;
          height: auto;
          max-height: 90vh;
          touch-action: pan-y !important;
        }

        /* Evitar que los innerScrollables tengan problemas */
        .inner-scrollable {
          -webkit-overflow-scrolling: touch !important;
          overflow-y: auto !important;
          touch-action: pan-y !important;
          overscroll-behavior: contain;
        }

        .swipe-indicator {
          width: 40px;
          height: 5px;
          background-color: rgba(0,0,0,0.2);
          border-radius: 99px;
          margin: 8px auto;
          transition: all 0.3s;
        }

        .swipe-indicator.closing {
          width: 50px;
          background-color: rgba(0,0,0,0.4);
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Al abrir, guardar la posición actual del scroll
    scrollY.current = window.scrollY;

    // Aplicar el bloqueo de scroll
    document.body.style.top = `-${scrollY.current}px`;
    document.body.classList.add('body-scroll-lock');

    // Aplicar estilos específicos al modal para iOS
    if (modalRef.current) {
      modalRef.current.classList.add('modal-content-scroll');
    }

    return () => {
      // Al cerrar, restaurar todo
      document.body.classList.remove('body-scroll-lock');
      document.body.style.top = '';

      // Restaurar la posición del scroll
      window.scrollTo(0, scrollY.current);

      // Limpiar clases
      if (modalRef.current) {
        modalRef.current.classList.remove('modal-content-scroll');
      }
    };
  }, [isOpen, modalRef]);

  // Método mejorado para gestionar touchmove
  useEffect(() => {
    if (!isOpen) return;

    // Función para manejar touchmove - VERSIÓN CORREGIDA
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as Node;
      const modalContent = modalRef.current;

      // Si el target está dentro del modal, permitimos el scroll normal
      if (modalContent && modalContent.contains(target)) {
        return; // Permitir scroll dentro del modal
      }

      // Solo prevenir los eventos fuera del modal
      e.preventDefault();
    };

    // Solo añadir el listener si es iOS
    if (isIOS) {
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      return () => {
        document.removeEventListener('touchmove', preventTouchMove);
      };
    }
  }, [isOpen, isIOS, modalRef]);
};

export const CartModule: React.FC<CartModuleProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart
}) => {
  // Log para depuración
  useEffect(() => {
    console.log("CartModule renderizado. isOpen:", isOpen);
    console.log("Product:", product);
  }, [isOpen, product]);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string}>({});
  const [expandedOptions, setExpandedOptions] = useState<{[key: number]: boolean}>({});

  // Referencia al modal para controlar el scroll
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const dragDistance = useRef(0);
  const [visualDragDistance, setVisualDragDistance] = useState(0);

  // Activar el bloqueo de scroll
  useBodyScrollLock(isOpen, modalRef);

  // MEJORADO: Manejar swipe para cerrar desde cualquier parte del modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (modal.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      // Solo permitir arrastrar hacia abajo cuando estamos en la parte superior
      if (diff > 0 && modal.scrollTop <= 0) {
        // Aplica resistencia para un efecto más natural
        const resistance = 0.6;
        dragDistance.current = Math.pow(diff, resistance);
        setVisualDragDistance(dragDistance.current);

        // Prevenir scroll del documento
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;

      const diff = currentY.current - startY.current;
      const velocity = Math.abs(diff) / 300; // Velocidad aproximada del gesto

      // Si se ha arrastrado lo suficiente O el gesto fue rápido
      if (diff > 80 || (diff > 30 && velocity > 0.5)) {
        // Animar hacia abajo con la misma transición que la apertura
        setVisualDragDistance(window.innerHeight);

        // Cerrar después de la animación
        setTimeout(() => {
          onClose();
        }, 350); // Tiempo similar a la animación de apertura
      } else {
        // Volver a la posición original
        setVisualDragDistance(0);
        dragDistance.current = 0;
      }

      isDragging.current = false;
    };

    modal.addEventListener('touchstart', handleTouchStart, { passive: true });
    modal.addEventListener('touchmove', handleTouchMove, { passive: false });
    modal.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchmove', handleTouchMove);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  // Resetear la cantidad y opciones cuando se abre con un nuevo producto
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setVisualDragDistance(0);
      dragDistance.current = 0;

      // Inicializar las opciones seleccionadas
      if (product.options && product.options.length > 0) {
        const initialOptions: SelectedOption[] = product.options.map(option => ({
          option_id: option.id,
          option_name: option.name,
          selected_items: []
        }));
        setSelectedOptions(initialOptions);

        // Inicializar todas las opciones como expandidas
        const expanded: {[key: number]: boolean} = {};
        product.options.forEach(option => {
          expanded[option.id] = true;
        });
        setExpandedOptions(expanded);
      } else {
        setSelectedOptions([]);
        setExpandedOptions({});
      }

      setValidationErrors({});
    }
  }, [isOpen, product.id, product.options]);

  // Formatear el precio con separadores de miles
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Función para manejar la selección de opciones
  // Modificación en CartModule.tsx - Función handleOptionSelect
  // Añadir verificación de etiquetas que desactivan la selección

  const handleOptionSelect = (option: ProductOption, item: OptionItem) => {
    // Verificar si el ítem tiene una etiqueta que desactiva la selección (ej. "Agotado")
    const hasDisableTag = item.tags?.some(tag => tag.disableSelection);

    if (hasDisableTag) {
      // No permitir selección y posiblemente mostrar un mensaje
      return;
    }

    setSelectedOptions(prevSelected => {
      const updatedOptions = [...prevSelected];
      const optionIndex = updatedOptions.findIndex(opt => opt.option_id === option.id);

      if (optionIndex >= 0) {
        const currentOption = updatedOptions[optionIndex];

        // Si no es múltiple, reemplazar la selección
        if (!option.multiple) {
          updatedOptions[optionIndex] = {
            ...currentOption,
            selected_items: [{
              item_id: item.id,
              item_name: item.name,
              price_addition: item.price_addition
            }]
          };
        } else {
          // Si es múltiple, verificar si ya está seleccionado
          const itemIndex = currentOption.selected_items.findIndex(
            i => i.item_id === item.id
          );

          // Si ya está seleccionado, quitarlo
          if (itemIndex >= 0) {
            const updatedItems = [...currentOption.selected_items];
            updatedItems.splice(itemIndex, 1);
            updatedOptions[optionIndex] = {
              ...currentOption,
              selected_items: updatedItems
            };
          } else {
            // Si no está seleccionado, agregarlo si no supera el máximo
            if (!option.max_selections ||
                currentOption.selected_items.length < option.max_selections) {
              updatedOptions[optionIndex] = {
                ...currentOption,
                selected_items: [
                  ...currentOption.selected_items,
                  {
                    item_id: item.id,
                    item_name: item.name,
                    price_addition: item.price_addition
                  }
                ]
              };
            } else {
              // Si excede el máximo, mostrar error
              setValidationErrors(prev => ({
                ...prev,
                [option.id]: `Máximo ${option.max_selections} seleccion${option.max_selections === 1 ? '' : 'es'}`
              }));
              return prevSelected;
            }
          }
        }

        // Limpiar error si existe
        if (validationErrors[option.id]) {
          setValidationErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[option.id];
            return newErrors;
          });
        }
      }

      return updatedOptions;
    });
  };

  // Calcular el precio adicional por opciones seleccionadas
  const calculateOptionsPrice = () => {
    let additionalPrice = 0;

    selectedOptions.forEach(option => {
      option.selected_items.forEach(item => {
        additionalPrice += item.price_addition;
      });
    });

    return additionalPrice;
  };

  // Calcular el precio total
  const totalPrice = (product.price || 0) * quantity + calculateOptionsPrice() * quantity;

  // Incrementar y decrementar cantidad
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Validar que todas las opciones requeridas estén seleccionadas
  const validateOptions = () => {
    const errors: {[key: number]: string} = {};
    let isValid = true;

    if (product.options) {
      product.options.forEach(option => {
        if (option.required) {
          const selectedOption = selectedOptions.find(o => o.option_id === option.id);
          if (!selectedOption || selectedOption.selected_items.length === 0) {
            errors[option.id] = 'Esta opción es obligatoria';
            isValid = false;
          }
        }
      });
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Manejar la adición al carrito
  const handleAddToCart = () => {
    if (validateOptions()) {
      const productWithOptions: Product = {
        ...product,
        selected_options: selectedOptions,
        quantity
      };

      onAddToCart(productWithOptions, quantity);
      onClose();
    }
  };

  // Alternar la expansión de una opción
  const toggleOptionExpansion = (optionId: number) => {
    setExpandedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col justify-end backdrop-blur-[0.5px]"
          style={{
            background: 'rgba(0,0,0,0.08)'  // Fondo apenas perceptible
          }}
          onClick={onClose}
        >
          {/* Contenedor principal del modal */}
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 1.0
              }
            }}
            exit={{
              y: "100%",
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                mass: 1.0
              }
            }}
            className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto modal-content-scroll"
            onClick={e => e.stopPropagation()}
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              boxShadow: '0px -8px 40px rgba(0, 0, 0, 0.12)',
              transform: visualDragDistance > 0 ? `translateY(${visualDragDistance}px)` : 'translateY(0)',
              transition: visualDragDistance === 0 ? 'transform 0.35s ease-out' : 'none',
              opacity: visualDragDistance > 0 ? Math.max(0.75, 1 - visualDragDistance / 500) : 1,
              zIndex: 10000
            }}
          >
            {/* Indicador visual de swipe mejorado */}
            <div className="pt-2 pb-1">
              <div className={`swipe-indicator ${dragDistance.current > 40 ? 'closing' : ''}`}></div>
            </div>

            {/* Botón de cerrar en la parte superior */}
            <div className="sticky top-0 bg-white p-4 flex justify-between items-center border-b border-gray-100 z-10">
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
              <button className="p-2 rounded-full invisible">
                {/* Botón invisible para mantener el centrado */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Sección de opciones */}
              {product.options && product.options.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">Personaliza tu pedido</h3>

                  {product.options.map((option) => (
                    <div
                      key={option.id}
                      className="mb-8 overflow-hidden"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <h4 className="font-bold text-xl">
                            {option.name}
                            {option.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h4>

                          {/* Verificar si hay algún ítem seleccionado en esta opción */}
                          {selectedOptions.some(opt =>
                            opt.option_id === option.id && opt.selected_items.length > 0
                          ) && (
                            <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              Listo
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleOptionExpansion(option.id)}
                          className="p-2 rounded-full bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform ${expandedOptions[option.id] ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {expandedOptions[option.id] && (
                        <div>
                          {validationErrors[option.id] && (
                            <p className="text-sm text-red-500 mb-3">
                              {validationErrors[option.id]}
                            </p>
                          )}

                          <div className="space-y-2">
                            {option.items.map((item) => {
                              // Verificar si este item está seleccionado
                              const isSelected = selectedOptions.some(opt =>
                                opt.option_id === option.id &&
                                opt.selected_items.some(i => i.item_id === item.id)
                              );

                              // En la sección donde se renderizan los ítems de opciones en CartModule.tsx
                              return (
                                <div
                                  key={item.id}
                                  className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer ${
                                    isSelected ? 'border-black bg-gray-50' : 'border-gray-200'
                                  } ${item.tags?.some(tag => tag.disableSelection) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                  onClick={() => handleOptionSelect(option, item)}
                                >
                                  <div className="flex items-center">
                                    {/* Miniatura de imagen */}
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden mr-3">
                                      {item.image_url ? (
                                        <Image
                                          src={item.image_url}
                                          alt={item.name}
                                          fill
                                          style={{ objectFit: 'cover' }}
                                          sizes="48px"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
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

                                      {/* Etiquetas sobre la imagen */}
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="absolute top-0 right-0">
                                          {item.tags
                                            .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                                            .slice(0, 2) // Mostrar máximo 2 etiquetas
                                            .map(tag => (
                                              <Tag
                                                key={tag.id}
                                                name={tag.name}
                                                color={tag.color}
                                                textColor={tag.textColor}
                                                discount={tag.discount}
                                                size="sm"
                                                className="m-1"
                                              />
                                            ))}
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <span className="font-medium">{item.name}</span>

                                      {/* Etiqueta de "Sugerido" si corresponde */}
                                      {item.tags?.some(tag => tag.isRecommended) && (
                                        <span className="ml-2 inline-block px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                          Sugerido
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center">
                                    {item.price_addition > 0 && (
                                      <span className="text-gray-700 mr-3">
                                        +{formatPrice(item.price_addition)}
                                      </span>
                                    )}

                                    {/* Botón de radio personalizado */}
                                    {option.multiple ? (
                                      <div className={`w-6 h-6 border ${isSelected ? 'bg-black border-black' : 'border-gray-300'} rounded-md flex items-center justify-center ${item.tags?.some(tag => tag.disableSelection) ? 'opacity-50' : ''}`}>
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                          </svg>
                                        )}
                                      </div>
                                    ) : (
                                      <div className={`w-6 h-6 border ${isSelected ? 'border-2 border-black' : 'border-gray-300'} rounded-full flex items-center justify-center ${item.tags?.some(tag => tag.disableSelection) ? 'opacity-50' : ''}`}>
                                        {isSelected && (
                                          <div className="w-3 h-3 bg-black rounded-full"></div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-colors"
                >
                  Agregar {formatPrice(totalPrice)}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
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
  const [expandedItems, setExpandedItems] = useState<{[key: number]: boolean}>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const [visualDragDistance, setVisualDragDistance] = useState(0);

  // Log para depuración
  useEffect(() => {
    console.log("CartView renderizado. isOpen:", isOpen);
  }, [isOpen]);

  // Aplicar bloqueo de scroll
  useBodyScrollLock(isOpen, modalRef);

  // NUEVO: Añadir swipe para cerrar el CartView también (versión mejorada)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (modal.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // Si estamos en la parte superior del modal
      if (deltaY > 0 && modal.scrollTop <= 0) {
        const resistance = 0.5;
        const transformY = Math.pow(deltaY, resistance);
        setVisualDragDistance(transformY);
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      const deltaY = currentY - startY;
      const velocity = Math.abs(deltaY) / 300; // Velocidad aproximada del gesto

      // Si se ha arrastrado lo suficiente o el gesto fue rápido
      if (deltaY > 100 || (deltaY > 30 && velocity > 0.5)) {
        // Animar hacia abajo con la misma transición que la apertura
        setVisualDragDistance(window.innerHeight);

        // Cerrar después de la animación
        setTimeout(() => {
          onClose();
        }, 350); // Tiempo similar a la animación de apertura
      } else {
              // Volver a la posición original
              setVisualDragDistance(0);
            }

            isDragging = false;
          };

          modal.addEventListener('touchstart', handleTouchStart, { passive: true });
          modal.addEventListener('touchmove', handleTouchMove, { passive: false });
          modal.addEventListener('touchend', handleTouchEnd, { passive: true });

          return () => {
            modal.removeEventListener('touchstart', handleTouchStart);
            modal.removeEventListener('touchmove', handleTouchMove);
            modal.removeEventListener('touchend', handleTouchEnd);
          };
        }, [isOpen, onClose]);

        // Calcular el total
        const totalAmount = items.reduce((sum, item) => {
          let itemTotal = item.price * (item.quantity || 1);

          // Agregar precio adicional por opciones seleccionadas
          if (item.selected_options) {
            item.selected_options.forEach(option => {
              option.selected_items.forEach(selectedItem => {
                itemTotal += selectedItem.price_addition * (item.quantity || 1);
              });
            });
          }

          return sum + itemTotal;
        }, 0);

        // Formatear el precio
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

        // Calcular precio total de un item con sus opciones
        const calculateItemTotalPrice = (item: Product & { quantity: number }) => {
          let basePrice = item.price;

          // Suma del precio de las opciones seleccionadas
          if (item.selected_options) {
            item.selected_options.forEach(option => {
              option.selected_items.forEach(selectedItem => {
                basePrice += selectedItem.price_addition;
              });
            });
          }

          return basePrice * (item.quantity || 1);
        };

        // Alternar la expansión de un elemento del carrito
        const toggleItemExpansion = (itemId: number) => {
          setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
          }));
        };

        // Si el modal no está abierto, no renderizar nada
        if (!isOpen) return null;

        return (
          <>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex flex-col justify-end backdrop-blur-[0.5px]"
                style={{
                  background: 'rgba(0,0,0,0.08)'  // Fondo apenas perceptible
                }}
                onClick={onClose}
              >
                <motion.div
                  ref={modalRef}
                  initial={{ y: "100%" }}
                  animate={{
                    y: 0,
                    transition: {
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      mass: 1.0
                    }
                  }}
                  exit={{
                    y: "100%",
                    transition: {
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                      mass: 1.0
                    }
                  }}
                  className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto modal-content-scroll"
                  onClick={e => e.stopPropagation()}
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    boxShadow: '0px -8px 40px rgba(0, 0, 0, 0.12)',
                    transform: visualDragDistance > 0 ? `translateY(${visualDragDistance}px)` : 'translateY(0)',
                    transition: visualDragDistance === 0 ? 'transform 0.35s ease-out' : 'none',
                    opacity: visualDragDistance > 0 ? Math.max(0.75, 1 - visualDragDistance / 500) : 1,
                    zIndex: 10000
                  }}
                >
                  {/* Indicador de swipe */}
                  <div className="pt-2 pb-1">
                    <div className="swipe-indicator"></div>
                  </div>

                  {/* Encabezado */}
                  <div className="sticky top-0 bg-white p-4 border-b z-10">
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
                  <div className="p-4 inner-scrollable">
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
                          <li key={item.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                            {/* Cabecera del producto */}
                            <div className="p-4 bg-white">
                              <div className="flex items-start">
                                {/* Imagen del producto */}
                                <div className="relative w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
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
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-medium text-gray-900">{item.name}</h3>

                                      {/* Mostrar resumen de opciones solo si hay */}
                                      {item.selected_options && item.selected_options.some(opt => opt.selected_items.length > 0) && (
                                        <div
                                          className="text-sm text-gray-500 mt-1 cursor-pointer flex items-center"
                                          onClick={() => toggleItemExpansion(item.id)}
                                        >
                                          <span>Ver personalización</span>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-4 w-4 ml-1 transition-transform ${expandedItems[item.id] ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-bold text-gray-800">{formatPrice(calculateItemTotalPrice(item))}</span>
                                  </div>

                                  {/* Controles de cantidad */}
                                  <div className="flex justify-between items-center mt-3">
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
                            </div>
                          </div>

                          {/* Detalle de opciones seleccionadas (expandible) */}
                          {expandedItems[item.id] && item.selected_options && (
                            <div className="bg-gray-50 p-4 border-t border-gray-100">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Personalización:</h4>
                              <ul className="space-y-1">
                                {item.selected_options
                                  .filter(option => option.selected_items.length > 0)
                                  .map(option => (
                                    <li key={option.option_id} className="text-sm">
                                      <span className="text-gray-600">{option.option_name}:</span>
                                      <span className="ml-1">
                                        {option.selected_items.map((item, idx) => (
                                          <span key={item.item_id}>
                                            {item.item_name}
                                            {item.price_addition > 0 && ` (+${formatPrice(item.price_addition)})`}
                                            {idx < option.selected_items.length - 1 ? ', ' : ''}
                                          </span>
                                        ))}
                                      </span>
                                    </li>
                                ))}
                              </ul>
                            </div>
                          )}
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
          </>
        );
      };