// src/components/cart/ProductDetailModal.tsx
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Bookmark, ChevronDown, ChevronUp, Plus, Minus, Trash2, Heart } from 'lucide-react';

// Interfaces para opciones de producto
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [isClosing, setIsClosing] = useState(false);

  // AÑADIR ESTE NUEVO EFECTO
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo activar el swipe si estamos en la parte superior del contenido
      if (modal.scrollTop <= 10) {
        startY.current = e.touches[0].clientY;
        console.log("Touch start detected at y:", startY.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Si no estamos en la parte superior, permitir scroll normal
      if (modal.scrollTop > 10) return;

      // Obtener la posición actual del toque
      currentY.current = e.touches[0].clientY;

      // Calcular la distancia arrastrada
      const diff = currentY.current - startY.current;

      // Solo permitir arrastrar hacia abajo (diff > 0)
      if (diff > 0) {
        // Aplicar transformación visual en tiempo real
        modal.style.transform = `translateY(${diff}px)`;
        modal.style.transition = 'none';

        // Actualizar estado visual basado en la distancia
        if (diff > 100) {
          setIsClosing(true);
        } else {
          setIsClosing(false);
        }

        // Prevenir el scroll mientras se arrastra
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      // Calcular la distancia final del arrastre
      const diff = currentY.current - startY.current;

      console.log("Touch end with diff:", diff);

      // Si se arrastró suficiente hacia abajo, cerrar el modal
      if (diff > 100 && modal.scrollTop <= 10) {
        console.log("Closing modal based on swipe");
        onClose();
      } else {
        // Si no, volver a la posición original con animación
        modal.style.transform = 'translateY(0)';
        modal.style.transition = 'transform 0.3s ease';
      }

      // Resetear estados
      setIsClosing(false);
      startY.current = 0;
      currentY.current = 0;
    };

    // Registrar los eventos táctiles
    modal.addEventListener('touchstart', handleTouchStart, { passive: true });
    modal.addEventListener('touchmove', handleTouchMove, { passive: false });
    modal.addEventListener('touchend', handleTouchEnd);

    // Limpiar los eventos al desmontar
    return () => {
      modal.removeEventListener('touchstart', handleTouchStart);
      modal.removeEventListener('touchmove', handleTouchMove);
      modal.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

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
      setScrollPosition(0);
      setIsHeaderCompact(false);
      //setCanSwipeDown(true);
      //setIsDragging(false);

      // Resetear posición y
      //y.set(0);

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

      // Resetear scroll
      if (modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, product.id, product.options]);

  // Detectar scroll para cambiar header y estado de swipe
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleScroll = () => {
      if (modalRef.current) {
        const position = modalRef.current.scrollTop;
        setScrollPosition(position);
        setIsHeaderCompact(position > 120);

      }
    };

    const modalElement = modalRef.current;
    modalElement.addEventListener('scroll', handleScroll);
    return () => {
      modalElement.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // No renderizamos nada si no está abierto
  if (!isOpen) return null;

  // Formateamos el precio para que se vea como en la imagen de referencia
  const formatPrice = (price: number) => {
    // Asegurémonos de que el precio sea un número
    const numericPrice = typeof price === 'number' ? price : 0;

    try {
      // Usar formato con punto para miles y coma para decimales
      return '$' + numericPrice.toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace('.', ',');
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

    // Micro-animación de éxito antes de cerrar
    setTimeout(() => {
      onAddToCart({ ...product, quantity }, quantity, filledOptions);
      onClose();
    }, 300);
  };

  // Verificar si una opción ha sido completada
  const isOptionCompleted = (optionId: number): boolean => {
    const option = selectedOptions.find(opt => opt.optionId === optionId);
    return !!option && option.items.length > 0;
  };

  // Función para renderizar los controles de cantidad para complementos
  const renderItemQuantityControl = (itemId: number, optionId: number, itemName: string, price: number, multiple: boolean = false) => {
    // Encontrar la cantidad actual del ítem seleccionado (si existe)
    const option = selectedOptions.find(opt => opt.optionId === optionId);
    const items = option?.items.filter(item => item.id === itemId) || [];
    const count = items.length;

    // Si no hay ninguno seleccionado, mostrar solo el botón de añadir
    if (count === 0) {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOptionSelect(
              {id: optionId, name: '', required: false, multiple, items: []},
              {id: itemId, name: itemName, price_addition: price, available: true}
            );
          }}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Plus size={20} className="text-gray-700" />
        </motion.button>
      );
    }

    // Si está seleccionado pero no es múltiple, mostrar checkmark o trash
    if (!multiple || count === 1) {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOptionSelect(
              {id: optionId, name: '', required: false, multiple, items: []},
              {id: itemId, name: itemName, price_addition: price, available: true}
            );
          }}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Trash2 size={18} className="text-gray-700" />
        </motion.button>
      );
    }

    // Si hay varios seleccionados, mostrar controles + y -
    return (
      <div className="flex items-center h-10 rounded-full bg-white border border-gray-300 overflow-hidden shadow-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            // Eliminar uno
            handleOptionSelect(
              {id: optionId, name: '', required: false, multiple, items: []},
              {id: itemId, name: itemName, price_addition: price, available: true}
            );
          }}
          className="w-10 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Minus size={18} className="text-gray-700" />
        </motion.button>
        <span className="w-8 text-center font-medium">{count}</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            // Añadir uno más
            handleOptionSelect(
              {id: optionId, name: '', required: false, multiple, items: []},
              {id: itemId, name: itemName, price_addition: price, available: true}
            );
          }}
          className="w-10 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Plus size={18} className="text-gray-700" />
        </motion.button>
      </div>
    );
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
          //style={{ opacity }}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 40, stiffness: 400 }}
            className="bg-white rounded-t-2xl w-full max-w-md h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
              overscrollBehavior: 'contain',
              //y,
              //scale,
              //touchAction: 'pan-x' // Mejora el manejo táctil
            }}
            //drag="y" // Simplificamos usando siempre drag vertical
            //dragConstraints={{ top: 0, bottom: 0 }}
            //dragElastic={0.2}
            //onDragStart={() => {
              //console.log("Drag start");
              //setIsDragging(true);
            //}}
            //onDragEnd={handleDragEnd}
            //dragDirectionLock
            //dragMomentum={false}
          >
            {/* Indicador de swipe */}
            <div className="w-full flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header flotante cuando se hace scroll */}
            <motion.div
              className={`sticky top-0 z-10 flex items-center justify-between backdrop-blur-md transition-all duration-200 ${
                isHeaderCompact
                  ? 'py-3 px-4 border-b border-gray-200 bg-white/95'
                  : 'p-0 bg-transparent'
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isHeaderCompact ? 1 : 0,
                height: isHeaderCompact ? 'auto' : 0
              }}
              style={{
                pointerEvents: isHeaderCompact ? 'auto' : 'none'
              }}
            >
              <h2 className="text-lg font-semibold truncate">{product.name}</h2>
              <div className="text-lg font-bold">{formatPrice(product.price)}</div>
            </motion.div>

            {/* Header principal */}
            <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-20">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
              >
                <X size={20} />
              </motion.button>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
                >
                  <Share size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
                >
                  {isFavorite ? (
                    <Heart size={18} fill="#f43f5e" className="text-pink-500" />
                  ) : (
                    <Heart size={18} />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Imagen del producto con degradado */}
            <div className="w-full h-72 relative">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="z-0"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
              ) : (
                <img
                  src="/api/placeholder/500/500"
                  alt={product.name}
                  className="w-full h-full object-cover z-0"
                />
              )}

              {/* Degradado superior */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-40"
                style={{ zIndex: 1 }}
              />

              {/* Degradado inferior */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent h-24"
                style={{ zIndex: 1 }}
              />
            </div>

            {/* Información del producto */}
            <div className="px-5 pt-2 pb-4">
              <div className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</div>
              <h1 className="text-3xl font-bold mt-1 text-gray-900">{product.name}</h1>
              {product.description && (
                <p className="text-gray-600 mt-2">{product.description}</p>
              )}
            </div>

            {/* Opciones del producto */}
            <div className="space-y-px">
              {product.options && product.options.map((option) => (
                <motion.div
                  key={option.id}
                  className="bg-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="flex justify-between items-center px-5 py-4 cursor-pointer"
                    onClick={() => toggleOption(option.id)}
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        {option.name}
                        {option.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </h2>
                      {option.required ? null : (
                        <p className="text-gray-500 text-sm">Opcional</p>
                      )}
                      {option.multiple && option.max_selections && (
                        <p className="text-gray-500 text-sm">Selecciona máximo {option.max_selections} opciones</p>
                      )}
                    </div>

                    <div className="flex items-center">
                      {isOptionCompleted(option.id) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-green-500 text-white text-sm px-3 py-1 rounded-full mr-3 shadow-sm font-medium"
                        >
                          Listo
                        </motion.span>
                      )}
                      <motion.div
                        animate={{ rotate: expandedOptions[option.id] ? 180 : 0 }}
                        transition={{ duration: 0.2, type: "tween" }}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <ChevronDown size={20} className="text-gray-700" />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOptions[option.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 overflow-hidden"
                      >
                        <div className="pb-4 space-y-1">
                          {option.items.map(item => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-center justify-between py-3 px-3 rounded-xl ${
                                isItemSelected(option.id, item.id)
                                  ? 'bg-green-50 border border-green-100'
                                  : 'border border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-center">
                                {item.image_url ? (
                                  <div className="relative w-14 h-14 mr-3 rounded-lg overflow-hidden">
                                    <Image
                                      src={item.image_url}
                                      alt={item.name}
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      className="rounded-lg"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">Sin imagen</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-lg font-medium text-gray-800">{item.name}</span>
                                  {item.price_addition > 0 && (
                                    <div className="text-gray-500">+ {formatPrice(item.price_addition)}</div>
                                  )}
                                </div>
                              </div>

                              <motion.div
                                whileTap={{ scale: 0.95 }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isItemSelected(option.id, item.id)
                                    ? 'border-green-500 bg-white'
                                    : 'border-gray-300'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOptionSelect(option, item);
                                }}
                              >
                                {isItemSelected(option.id, item.id) && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3 h-3 rounded-full bg-green-500"
                                  />
                                )}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Sección de complementos */}
              <motion.div
                className="bg-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div
                  className="flex justify-between items-center px-5 py-4 cursor-pointer"
                  onClick={() => toggleOption(9999)} // ID ficticio para complementos
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Complementa tu pedido</h2>
                    <p className="text-gray-500 text-sm">Opcional</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedOptions[9999] ? 180 : 0 }}
                    transition={{ duration: 0.2, type: "tween" }}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <ChevronDown size={20} className="text-gray-700" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedOptions[9999] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 overflow-hidden"
                    >
                      <div className="pb-4 space-y-2">
                        {/* Complemento 1 */}
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between py-3 px-3 rounded-xl border border-gray-100 hover:border-gray-200"
                        >
                          <div className="flex items-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                              <img
                                src="/api/placeholder/60/60"
                                alt="Milanesa Napolitana"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-lg font-medium text-gray-800">Milanesa Napolitana</span>
                              <div className="text-gray-500">+ {formatPrice(15500)}</div>
                            </div>
                          </div>
                          {renderItemQuantityControl(1001, 1000, "Milanesa Napolitana", 15500, true)}
                        </motion.div>

                      {/* Complemento 2 */}
                                              <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 }}
                                                className="flex items-center justify-between py-3 px-3 rounded-xl border border-gray-100 hover:border-gray-200"
                                              >
                                                <div className="flex items-center">
                                                  <div className="w-14 h-14 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                                                    <img
                                                      src="/api/placeholder/60/60"
                                                      alt="Pizza Mediana de Muzzarella"
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                  <div>
                                                    <span className="text-lg font-medium text-gray-800">Pizza Mediana de Muzzarella</span>
                                                    <div className="text-gray-500">+ {formatPrice(15500)}</div>
                                                  </div>
                                                </div>
                                                {renderItemQuantityControl(1002, 1000, "Pizza Mediana de Muzzarella", 15500, true)}
                                              </motion.div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </motion.div>
                                  </div>

                                  {/* Mensaje de error de validación */}
                                  <AnimatePresence>
                                    {validationError && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mx-5 my-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm shadow-sm"
                                      >
                                        <div className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                          {validationError}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Controles de cantidad y botón de agregar */}
                                  <div className="px-5 py-4 flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.05)] z-30">
                                    <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex items-center h-12 rounded-full border border-gray-200 overflow-hidden shadow-sm bg-white"
                                    >
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                                      >
                                        <Minus size={20} className="text-gray-700" />
                                      </motion.button>
                                      <span className="w-10 text-center font-medium">{quantity}</span>
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        className="w-12 h-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                        onClick={() => setQuantity(quantity + 1)}
                                      >
                                        <Plus size={20} className="text-gray-700" />
                                      </motion.button>
                                    </motion.div>

                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleAddToCart}
                                      className="bg-gradient-to-r from-green-500 to-green-400 text-white px-6 py-3 rounded-full font-medium text-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                                    >
                                      <span>Agregar</span>
                                      <span className="font-bold">{formatPrice(totalPrice)}</span>
                                    </motion.button>
                                  </div>

                                  {/* Overlay de arrastre (muestra feedback visual durante el arrastre) */}
                                  {isClosing && (
                                    <div className="absolute inset-0 bg-black bg-opacity-5 pointer-events-none flex flex-col items-center justify-start pt-20">
                                      <ChevronDown size={40} className="text-white opacity-70" />
                                      <span className="text-white text-sm opacity-70 mt-2">Desliza para cerrar</span>
                                    </div>
                                  )}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        );
                      };