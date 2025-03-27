// src/components/cart/ProductDetailModal.tsx
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, ChevronDown, Plus, Minus, Trash2, Heart } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';

interface OptionItem {
  id: number;
  name: string;
  price_addition: number;
  available: boolean;
  image_url?: string;
  tags?: any[];
}

interface ProductOption {
  id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  max_selections?: number;
  items: OptionItem[];
  tags?: any[];
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
  option_id: number;
  option_name: string;
  selected_items: {
    item_id: number;
    item_name: string;
    price_addition: number;
  }[];
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedOptions: SelectedOption[]) => void;
}

// Función mejorada para bloquear el scroll en iOS, adaptada de CartModule
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

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: number]: string}>({});
  const [expandedOptions, setExpandedOptions] = useState<Record<number, boolean>>({});
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visualDragDistance, setVisualDragDistance] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const swipeHandleRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const dragDistance = useRef(0);

  // Activar el bloqueo de scroll mejorado
  useBodyScrollLock(isOpen, modalRef);

  // Resetear la cantidad y opciones cuando se abre con un nuevo producto
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setVisualDragDistance(0);
      dragDistance.current = 0;
      setScrollPosition(0);
      setIsHeaderCompact(false);
      setValidationErrors({});

      // Inicializar las opciones seleccionadas
      if (product.options && product.options.length > 0) {
        const initialOptions: SelectedOption[] = product.options.map(option => ({
          option_id: option.id,
          option_name: option.name,
          selected_items: []
        }));
        setSelectedOptions(initialOptions);

        // Inicializar todas las opciones como expandidas
        const expanded: Record<number, boolean> = {};
        product.options.forEach(option => {
          expanded[option.id] = true;
        });
        setExpandedOptions(expanded);
      } else {
        setSelectedOptions([]);
        setExpandedOptions({});
      }
    }
  }, [isOpen, product.id, product.options]);

  // Detectar el scroll para aplicar el header compacto
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleScroll = () => {
      if (modalRef.current) {
        const pos = modalRef.current.scrollTop;
        setScrollPosition(pos);
        setIsHeaderCompact(pos > 120);
      }
    };

    const el = modalRef.current;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

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

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
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

  // Verificar si un item está seleccionado
  const isItemSelected = (optionId: number, itemId: number): boolean => {
    const option = selectedOptions.find(opt => opt.option_id === optionId);
    if (!option) return false;

    return option.selected_items.some(item => item.item_id === itemId);
  };

  // Función para manejar la selección de opciones
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

  // Alternar la expansión de una opción
  const toggleOption = (optionId: number) => {
    setExpandedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Verificar si una opción tiene items seleccionados
  const isOptionCompleted = (optionId: number): boolean => {
    const option = selectedOptions.find(opt => opt.option_id === optionId);
    return !!option && option.selected_items.length > 0;
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
            errors[option.id] = `Por favor selecciona una opción de "${option.name}"`;
            isValid = false;
            // Expandir la opción con error
            setExpandedOptions(prev => ({ ...prev, [option.id]: true }));
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
      const productWithOptions = {
        ...product,
        selected_options: selectedOptions,
        quantity
      };

      onAddToCart(productWithOptions, quantity, selectedOptions);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-[1px]"
          style={{
            background: 'rgba(255,255,255,0.05)',
            touchAction: 'none'
          }}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 40, stiffness: 400 }}
            className="bg-white rounded-t-2xl w-full max-w-md h-[90vh] overflow-y-auto modal-content-scroll"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
              transform: visualDragDistance > 0 ? `translateY(${visualDragDistance}px)` : 'translateY(0)',
              transition: visualDragDistance === 0 ? 'transform 0.3s ease-out' : 'none',
              opacity: visualDragDistance > 0 ? Math.max(0.75, 1 - visualDragDistance / 500) : 1,
            }}
          >
            {/* Indicador visual de swipe mejorado */}
            <div className="pt-2 pb-1">
              <div
                ref={swipeHandleRef}
                className={`swipe-indicator ${dragDistance.current > 40 ? 'closing' : ''}`}
              ></div>
            </div>

            {/* Header flotante */}
            <motion.div
              className={`sticky top-0 z-10 flex items-center justify-between backdrop-blur-md transition-all duration-200 ${
                isHeaderCompact
                  ? 'py-3 px-4 border-b border-gray-200 bg-white/95'
                  : 'p-0 bg-transparent'
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHeaderCompact ? 1 : 0, height: isHeaderCompact ? 'auto' : 0 }}
              style={{ pointerEvents: isHeaderCompact ? 'auto' : 'none' }}
            >
              <h2 className="text-lg font-semibold truncate flex items-center">
                {product.name}
              </h2>
              <div className="text-lg font-bold">{formatPrice(product.price)}</div>
            </motion.div>

            {/* Botones superiores */}
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
                  onClick={() => {
                    // Implementación de función para compartir
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description || `Mira este producto: ${product.name}`,
                        url: window.location.href
                      }).catch(error => console.log('Error compartiendo', error));
                    } else {
                      // Fallback para navegadores que no soportan Web Share API
                      const url = window.location.href;
                      navigator.clipboard.writeText(url)
                        .then(() => alert('¡Enlace copiado al portapapeles!'))
                        .catch(err => console.error('Error al copiar: ', err));
                    }
                  }}
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

            {/* Imagen principal */}
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-40" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent h-24" />
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
              {product.options?.map(option => (
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
                    <div className="flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        {option.name}
                        {option.required && <span className="ml-1 text-red-500">*</span>}
                        {/* Etiquetas de opción justo a la derecha del título */}
                        {option.tags && option.tags.length > 0 && (
                          <span className="ml-2 flex gap-1">
                            {option.tags.map((tag: any) => (
                              <Tag
                                key={tag.id}
                                name={tag.name}
                                color={tag.color}
                                textColor={tag.textColor || '#FFFFFF'}
                                discount={tag.discount}
                                size="xs"
                              />
                            ))}
                          </span>
                        )}
                      </h2>
                      {!option.required && (
                        <p className="text-gray-500 text-sm">Opcional</p>
                      )}
                      {option.multiple && option.max_selections && (
                        <p className="text-gray-500 text-sm">
                          Selecciona máximo {option.max_selections} opciones
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {isOptionCompleted(option.id) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600 text-xs px-2 py-0.5 rounded-full mr-2 bg-green-50 border border-green-100 font-medium flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Listo
                        </motion.span>
                      )}
                      <motion.div
                        animate={{ rotate: expandedOptions[option.id] ? 180 : 0 }}
                        transition={{ duration: 0.2, type: 'tween' }}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                      >
                        <ChevronDown size={20} className="text-gray-700" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Mostrar mensaje de error si existe */}
                  {validationErrors[option.id] && expandedOptions[option.id] && (
                    <p className="text-sm text-red-500 px-5 mb-2">
                      {validationErrors[option.id]}
                    </p>
                  )}

                  <AnimatePresence>
                    {expandedOptions[option.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 overflow-hidden"
                      >
                        <div className="pb-4 space-y-1">
                          {option.items.map(item => {
                            // Verificar si el item tiene etiqueta que desactiva selección
                            const isDisabled = item.tags?.some(tag => tag.disableSelection);

                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center justify-between py-3 px-3 rounded-xl ${
                                  isItemSelected(option.id, item.id)
                                    ? 'bg-green-50 border border-green-100'
                                    : 'border border-gray-100 hover:border-gray-200'
                                } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={() => {
                                  if (!isDisabled) {
                                    handleOptionSelect(option, item);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-shrink-0">
                                    {/* Imagen del item */}
                                    {item.image_url ? (
                                      <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        width={56}
                                        height={56}
                                        style={{ objectFit: 'cover' }}
                                        className="rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">Sin imagen</span>
                                      </div>
                                    )}

                                    {/* Se quitan las etiquetas que aparecían sobre la imagen */}
                                  </div>
                                  <div className="flex flex-grow flex-col">
                                    <div className="flex items-center">
                                      <span className="text-lg font-medium text-gray-800">{item.name}</span>

                                      {/* Etiquetas a la derecha del nombre del ítem */}
                                      {item.tags && item.tags.length > 0 && (
                                        <div className="ml-2 flex flex-wrap gap-1">
                                          {item.tags.map(tag => (
                                            <Tag
                                              key={tag.id}
                                              name={tag.name}
                                              color={tag.color}
                                              textColor={tag.textColor || '#FFFFFF'}
                                              discount={tag.discount}
                                              size="xs"
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {item.price_addition > 0 && (
                                      <div className="flex items-center text-gray-500">
                                        <span>+{formatPrice(item.price_addition)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Indicador de selección */}
                                <motion.div
                                  whileTap={{ scale: 0.95 }}
                                  className={`${
                                    isDisabled ? 'opacity-50' : ''
                                  } ${
                                    option.multiple
                                      ? `w-6 h-6 border ${isItemSelected(option.id, item.id) ? 'bg-black border-black' : 'border-gray-300'} rounded-md flex items-center justify-center`
                                      : `w-6 h-6 border ${isItemSelected(option.id, item.id) ? 'border-2 border-black' : 'border-gray-300'} rounded-full flex items-center justify-center`
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      handleOptionSelect(option, item);
                                    }
                                  }}
                                >
                                  {option.multiple && isItemSelected(option.id, item.id) && (
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                        </svg>
                                                                      )}
                                                                      {!option.multiple && isItemSelected(option.id, item.id) && (
                                                                        <div className="w-3 h-3 bg-black rounded-full"></div>
                                                                      )}
                                                                    </motion.div>
                                                                  </motion.div>
                                                                );
                                                              })}
                                                            </div>
                                                          </motion.div>
                                                        )}
                                                      </AnimatePresence>
                                                    </motion.div>
                                                  ))}

                                                  {/* Sección de complementos (opcional) */}
                                                  <motion.div
                                                    className="bg-white"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: 0.1 }}
                                                  >
                                                    <div
                                                      className="flex justify-between items-center px-5 py-4 cursor-pointer"
                                                      onClick={() => toggleOption(9999)}
                                                    >
                                                      <div>
                                                        <h2 className="text-xl font-bold text-gray-900">Complementa tu pedido</h2>
                                                        <p className="text-gray-500 text-sm">Opcional</p>
                                                      </div>
                                                      <motion.div
                                                        animate={{ rotate: expandedOptions[9999] ? 180 : 0 }}
                                                        transition={{ duration: 0.2, type: 'tween' }}
                                                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                                                      >
                                                        <ChevronDown size={20} className="text-gray-700" />
                                                      </motion.div>
                                                    </div>
                                                    <AnimatePresence>
                                                      {expandedOptions[9999] && (
                                                        <motion.div
                                                          initial={{ height: 0, opacity: 0 }}
                                                          animate={{ height: 'auto', opacity: 1 }}
                                                          exit={{ height: 0, opacity: 0 }}
                                                          transition={{ duration: 0.2 }}
                                                          className="px-5 overflow-hidden"
                                                        >
                                                          <div className="pb-4 space-y-2">
                                                            <motion.div
                                                              initial={{ opacity: 0, y: 5 }}
                                                              animate={{ opacity: 1, y: 0 }}
                                                              className="flex items-center justify-between py-3 px-3 rounded-xl border border-gray-100 hover:border-gray-200"
                                                            >
                                                              <div className="flex items-center">
                                                                <div className="w-14 h-14 bg-gray-100 rounded-lg mr-3 overflow-hidden">
                                                                  <img
                                                                    src="/api/placeholder/60/60"
                                                                    alt="Complemento 1"
                                                                    className="w-full h-full object-cover"
                                                                  />
                                                                </div>
                                                                <div>
                                                                  <div className="flex items-center">
                                                                    <span className="text-lg font-medium text-gray-800">Complemento 1</span>
                                                                    <div className="ml-2 flex flex-wrap gap-1">
                                                                      <Tag
                                                                        key="popular-tag"
                                                                        name="Popular"
                                                                        color="#10b981"
                                                                        textColor="#FFFFFF"
                                                                        size="xs"
                                                                      />
                                                                    </div>
                                                                  </div>
                                                                  <div className="text-gray-500">
                                                                    +{formatPrice(10000)}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                              {/* Control de cantidad para complementos */}
                                                              <motion.div
                                                                whileTap={{ scale: 0.95 }}
                                                                className={`w-6 h-6 border ${isItemSelected(9999, 1001) ? 'bg-black border-black' : 'border-gray-300'} rounded-md flex items-center justify-center`}
                                                                onClick={() => {
                                                                  // Manejar la selección del complemento
                                                                  handleOptionSelect(
                                                                    { id: 9999, name: 'Complementos', required: false, multiple: true, items: [] },
                                                                    { id: 1001, name: 'Complemento 1', price_addition: 10000, available: true }
                                                                  );
                                                                }}
                                                              >
                                                                {isItemSelected(9999, 1001) && (
                                                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                  </svg>
                                                                )}
                                                              </motion.div>
                                                            </motion.div>
                                                          </div>
                                                        </motion.div>
                                                      )}
                                                    </AnimatePresence>
                                                  </motion.div>
                                                </div>

                                                {/* Mostrar errores de validación */}
                                                <AnimatePresence>
                                                  {Object.keys(validationErrors).length > 0 && (
                                                    <motion.div
                                                      initial={{ opacity: 0, y: 10 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      exit={{ opacity: 0, y: 10 }}
                                                      className="mx-5 my-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm shadow-sm"
                                                    >
                                                      <div className="flex items-center">
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          className="h-5 w-5 mr-2 flex-shrink-0"
                                                          viewBox="0 0 20 20"
                                                          fill="currentColor"
                                                        >
                                                          <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                          />
                                                        </svg>
                                                        {Object.values(validationErrors)[0]}
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>

                                                {/* Botones de control de cantidad y agregar al carrito */}
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
                                              </motion.div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      );
                                    };