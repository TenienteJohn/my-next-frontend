// src/components/cart/ProductDetailModal.tsx
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, ChevronDown, Plus, Minus, Trash2, Heart } from 'lucide-react';
import { Tag } from '@/components/ui/Tag'; // Importación con exportación con nombre

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

const useBodyScrollLock = (isOpen: boolean, modalRef: React.RefObject<HTMLDivElement>) => {
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;
  const scrollY = useRef(0);

  useEffect(() => {
    if (!document.getElementById('ios-modal-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ios-modal-styles';
      styleEl.innerHTML = `
        .body-scroll-lock {
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          touch-action: none;
          -webkit-overflow-scrolling: none;
        }
        .modal-ios-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          overflow-y: auto;
          overflow-x: hidden;
          height: 100%;
          max-height: 90vh;
          touch-action: pan-y;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    console.log('⭐⭐⭐ ProductDetailModal renderizado ⭐⭐⭐');
    if (isOpen) alert('Modal abierto - versión depuración');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    scrollY.current = window.scrollY;
    document.body.style.top = `-${scrollY.current}px`;
    document.body.classList.add('body-scroll-lock');
    if (isIOS && modalRef.current) {
      modalRef.current.classList.add('modal-ios-scroll');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
      document.body.style.top = '';
      window.scrollTo(0, scrollY.current);
      if (isIOS && modalRef.current) {
        modalRef.current.classList.remove('modal-ios-scroll');
      }
    };
  }, [isOpen, isIOS, modalRef]);

  useEffect(() => {
    if (!isOpen || !isIOS) return;
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as Node;
      const modalContent = modalRef.current;
      if (modalContent && modalContent.contains(target)) {
        const scrollableElement = findScrollableParent(target as HTMLElement);
        if (scrollableElement && scrollableElement !== document.body) {
          const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
          if (
            (scrollTop <= 0 && e.touches[0].clientY > 0) ||
            (scrollTop + clientHeight >= scrollHeight - 1 && e.touches[0].clientY < 0)
          ) {
            e.preventDefault();
          }
          return;
        }
      }
      e.preventDefault();
    };

    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;
      const style = window.getComputedStyle(element);
      const overflowY = style.getPropertyValue('overflow-y');
      const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
      if (isScrollable && element.scrollHeight > element.clientHeight) return element;
      return element.parentElement ? findScrollableParent(element.parentElement) : null;
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', preventTouchMove);
    };
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Record<number, boolean>>({});
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const swipeHandleRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  useBodyScrollLock(isOpen, modalRef);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const modalEl = modalRef.current;
    modalEl.style.overflowY = 'auto';
    modalEl.style.webkitOverflowScrolling = 'touch';
    modalEl.style.overscrollBehavior = 'contain';
    modalEl.scrollTop = 0;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedOptions([]);
      setValidationError(null);
      setScrollPosition(0);
      setIsHeaderCompact(false);
      setDragDistance(0);
      if (product.options) {
        const initial = product.options.map(option => ({
          optionId: option.id,
          optionName: option.name,
          items: [] as { id: number; name: string; price_addition: number }[],
        }));
        setSelectedOptions(initial);
      }
    }
  }, [isOpen, product.id, product.options]);

  useEffect(() => {
    console.log("DEBUG: Product options en el modal:", product.options);
  }, [product.options]);

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

  useEffect(() => {
    if (!isOpen || !swipeHandleRef.current) return;
    const swipeHandle = swipeHandleRef.current;
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;
      if (diff > 0) {
        const resistance = 0.6;
        const transformY = Math.pow(diff, resistance);
        setDragDistance(transformY);
        setIsClosing(diff > 80);
      }
    };
    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      const diff = currentY.current - startY.current;
      if (diff > 65) {
        setDragDistance(window.innerHeight);
        setTimeout(() => { onClose(); }, 300);
      } else {
        setDragDistance(0);
        setIsClosing(false);
      }
      isDragging.current = false;
    };
    const handleTouchCancel = () => {
      setDragDistance(0);
      setIsClosing(false);
      isDragging.current = false;
    };
    swipeHandle.addEventListener('touchstart', handleTouchStart, { passive: false });
    swipeHandle.addEventListener('touchmove', handleTouchMove, { passive: false });
    swipeHandle.addEventListener('touchend', handleTouchEnd, { passive: true });
    swipeHandle.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    return () => {
      swipeHandle.removeEventListener('touchstart', handleTouchStart);
      swipeHandle.removeEventListener('touchmove', handleTouchMove);
      swipeHandle.removeEventListener('touchend', handleTouchEnd);
      swipeHandle.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    const num = typeof price === 'number' ? price : 0;
    try {
      return '$' + num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('.', ',');
    } catch {
      return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  };

  const calculateAdditionalPrice = () => {
    if (!product.options) return 0;
    let add = 0;
    selectedOptions.forEach(selOpt => {
      selOpt.items.forEach(item => {
        add += Number(item.price_addition) || 0;
      });
    });
    return add;
  };

  const additionalPrice = calculateAdditionalPrice();
  const totalPrice = (product.price || 0) * quantity + additionalPrice * quantity;

  const isItemSelected = (optionId: number, itemId: number): boolean => {
    const selOpt = selectedOptions.find(o => o.optionId === optionId);
    if (!selOpt) return false;
    return selOpt.items.some(it => it.id === itemId);
  };

  const handleOptionSelect = (option: ProductOption, item: OptionItem) => {
    setSelectedOptions(prev => {
      const index = prev.findIndex(o => o.optionId === option.id);
      if (index < 0) {
        return [
          ...prev,
          { optionId: option.id, optionName: option.name, items: [{ id: item.id, name: item.name, price_addition: item.price_addition }] },
        ];
      }
      const updated = [...prev];
      const existing = updated[index];
      const itemIndex = existing.items.findIndex(i => i.id === item.id);
      if (option.multiple) {
        if (itemIndex >= 0) {
          existing.items = existing.items.filter(i => i.id !== item.id);
        } else {
          if (!option.max_selections || existing.items.length < option.max_selections) {
            existing.items = [...existing.items, { id: item.id, name: item.name, price_addition: item.price_addition }];
          }
        }
      } else {
        if (itemIndex >= 0) {
          existing.items = [];
        } else {
          existing.items = [{ id: item.id, name: item.name, price_addition: item.price_addition }];
        }
      }
      updated[index] = existing;
      return updated;
    });
    setValidationError(null);
  };

  const toggleOption = (optionId: number) => {
    setExpandedOptions(prev => ({ ...prev, [optionId]: !prev[optionId] }));
  };

  const validateRequiredOptions = (): boolean => {
    if (!product.options) return true;
    const required = product.options.filter(opt => opt.required);
    for (const opt of required) {
      const found = selectedOptions.find(o => o.optionId === opt.id);
      if (!found || found.items.length === 0) {
        setValidationError(`Por favor selecciona una opción de "${opt.name}"`);
        setExpandedOptions(prev => ({ ...prev, [opt.id]: true }));
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateRequiredOptions()) return;
    const filled = selectedOptions.filter(o => o.items.length > 0);
    setTimeout(() => {
      onAddToCart({ ...product, quantity }, quantity, filled);
      onClose();
    }, 200);
  };

  const isOptionCompleted = (optionId: number): boolean => {
    const selOpt = selectedOptions.find(o => o.optionId === optionId);
    return !!selOpt && selOpt.items.length > 0;
  };

  const renderItemQuantityControl = (
    itemId: number,
    optionId: number,
    itemName: string,
    price: number,
    multiple: boolean
  ) => {
    const selOpt = selectedOptions.find(o => o.optionId === optionId);
    const count = selOpt ? selOpt.items.filter(i => i.id === itemId).length : 0;
    if (count === 0) {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation();
            handleOptionSelect(
              { id: optionId, name: '', required: false, multiple, items: [] },
              { id: itemId, name: itemName, price_addition: price, available: true }
            );
          }}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Plus size={20} className="text-gray-700" />
        </motion.button>
      );
    }
    if (!multiple || count === 1) {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation();
            handleOptionSelect(
              { id: optionId, name: '', required: false, multiple, items: [] },
              { id: itemId, name: itemName, price_addition: price, available: true }
            );
          }}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Trash2 size={18} className="text-gray-700" />
        </motion.button>
      );
    }
    return (
      <div className="flex items-center h-10 rounded-full bg-white border border-gray-300 overflow-hidden shadow-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation();
            handleOptionSelect(
              { id: optionId, name: '', required: false, multiple, items: [] },
              { id: itemId, name: itemName, price_addition: price, available: true }
            );
          }}
          className="w-10 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Minus size={18} className="text-gray-700" />
        </motion.button>
        <span className="w-8 text-center font-medium">{count}</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={e => {
            e.stopPropagation();
            handleOptionSelect(
              { id: optionId, name: '', required: false, multiple, items: [] },
              { id: itemId, name: itemName, price_addition: price, available: true }
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
          className="fixed inset-0 z-50 flex items-end justify-center backdrop-blur-[1px]"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 40, stiffness: 400 }}
            className="bg-white rounded-t-2xl w-full max-w-md h-[90vh] overflow-y-auto scrollbar-hide modal-ios-scroll"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)',
              overscrollBehavior: 'contain',
              transform: dragDistance > 0 ? `translateY(${dragDistance}px)` : 'translateY(0)',
              transition: dragDistance === 0 ? 'transform 0.3s ease-out' : 'none'
            }}
          >
            {/* Área de swipe */}
            <div
              ref={swipeHandleRef}
              className="absolute top-0 left-0 w-full h-24 z-60 pointer-events-auto"
              style={{ cursor: 'grab', touchAction: 'none' }}
            >
              <div className="w-full flex justify-center pt-2 pb-1">
                <div className="w-16 h-1.5 bg-gray-400 rounded-full" />
              </div>
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
                          className="bg-green-500 text-white text-sm px-3 py-1 rounded-full mr-3 shadow-sm font-medium"
                        >
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
                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
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
                                </div>
                                <div className="flex flex-grow flex-col">
                                  <span className="text-lg font-medium text-gray-800">{item.name}</span>
                                  {item.price_addition > 0 && (
                                    <span className="text-gray-500">{formatPrice(item.price_addition)}</span>
                                  )}
                                </div>
                                {/* Contenedor de etiquetas a la derecha */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {item.tags.map((tag: any) => (
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
                              <motion.div
                                whileTap={{ scale: 0.95 }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isItemSelected(option.id, item.id)
                                    ? 'border-green-500 bg-white'
                                    : 'border-gray-300'
                                }`}
                                onClick={e => {
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
                                alt="Milanesa Napolitana"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-lg font-medium text-gray-800">Milanesa Napolitana</span>
                              <div className="text-gray-500">+ {formatPrice(15500)}</div>
                            </div>
                          </div>
                          {renderItemQuantityControl(1001, 1000, 'Milanesa Napolitana', 15500, true)}
                        </motion.div>
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
                          {renderItemQuantityControl(1002, 1000, 'Pizza Mediana de Muzzarella', 15500, true)}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <AnimatePresence>
              {validationError && (
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
                    {validationError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {isClosing && (
              <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none flex flex-col items-center justify-start pt-16 z-50">
                <ChevronDown size={48} className="text-white drop-shadow-lg" />
                <span className="text-white text-base font-medium mt-2 drop-shadow-lg">
                  Suelta para cerrar
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
