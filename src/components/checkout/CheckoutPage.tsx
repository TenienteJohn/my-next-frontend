// src/components/checkout/CheckoutPage.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CreditCard, MapPin, Store, Calendar, Clock, User, Phone, Home, MapPinned, Truck, Check, AlertCircle, DollarSign, Banknote, ShieldCheck, ChevronDown } from 'lucide-react';

// Interfaces para las opciones de producto (reutilizadas del carrito)
interface OptionItem {
  id: number;
  option_id: number;
  name: string;
  price_addition: number;
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
  selected_options?: SelectedOption[];
  quantity?: number;
}

interface DeliveryAddress {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  reference?: string;
  neighborhood?: string;
}

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  openHours: string;
  image_url?: string;
}

interface CheckoutPageProps {
  items: Product[];
  deliveryMethod: 'delivery' | 'pickup';
  onGoBack: () => void;
  onCompletePurchase: (orderData: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  deliveryMethod,
  onGoBack,
  onCompletePurchase,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mercado_pago');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    apartment: '',
    city: '',
    reference: '',
    neighborhood: '',
  });
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Datos de ejemplo para tiendas (en una app real vendrían de la base de datos)
  const storeLocations: StoreLocation[] = [
    {
      id: 1,
      name: 'Tienda Central',
      address: 'Av. Principal 123',
      city: 'Santiago',
      openHours: 'Lun-Sáb: 9:00 - 19:00, Dom: 10:00 - 16:00',
      image_url: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Tienda Norte',
      address: 'Calle Comercial 456',
      city: 'Santiago',
      openHours: 'Lun-Sáb: 10:00 - 20:00, Dom: 11:00 - 17:00',
      image_url: '/api/placeholder/100/100'
    }
  ];

  // Inicializar la primera tienda como seleccionada
  useEffect(() => {
    if (deliveryMethod === 'pickup' && storeLocations.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storeLocations[0].id);
    }
  }, [deliveryMethod, selectedStoreId]);

  // Detectar si es móvil y ajustar el estado del resumen en consecuencia
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setShowSummary(!mobile); // En desktop siempre mostrar, en móvil ocultar por defecto
    };

    // Ejecutar inmediatamente y luego añadir el evento de resize
    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Generar fechas disponibles (próximos 7 días)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
    };
  });

  // Generar horas disponibles (cada 30 minutos desde 9:00 hasta 21:00)
  const availableTimes = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return {
      value: time,
      label: time
    };
  });

  // Calcular el total
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      let itemPrice = item.price * (item.quantity || 1);

      if (item.selected_options) {
        item.selected_options.forEach(option => {
          option.selected_items.forEach(selectedItem => {
            itemPrice += selectedItem.price_addition * (item.quantity || 1);
          });
        });
      }

      return total + itemPrice;
    }, 0);
  };

  // Calcular costos de envío (en una app real, esto dependería de la dirección y otros factores)
  const calculateShippingCost = () => {
    return deliveryMethod === 'delivery' ? 3500 : 0;
  };

  // Calcular impuestos (IVA 19% en Chile)
  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.19);
  };

  // Total final con impuestos y envío
  const finalTotal = calculateTotal() + calculateShippingCost();

  // Formato para precios
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Manejar cambios en los campos del formulario
  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  // Validar el formulario
  const validateForm = () => {
    // Validación básica para todos los tipos de checkout
    if (!customerInfo.name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre');
      return false;
    }

    if (!customerInfo.phone.trim()) {
      setErrorMessage('Por favor ingresa tu número de teléfono');
      return false;
    }

    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) {
      setErrorMessage('Por favor ingresa un email válido');
      return false;
    }

    // Validaciones específicas para delivery
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress.street.trim() || !deliveryAddress.number.trim() || !deliveryAddress.city.trim()) {
        setErrorMessage('Por favor completa los campos obligatorios de la dirección');
        return false;
      }
    }

    // Validaciones para pickup
    if (deliveryMethod === 'pickup') {
      if (!selectedStoreId) {
        setErrorMessage('Por favor selecciona una tienda');
        return false;
      }

      if (!selectedDate) {
        setErrorMessage('Por favor selecciona una fecha para recoger tu pedido');
        return false;
      }

      if (!selectedTime) {
        setErrorMessage('Por favor selecciona una hora para recoger tu pedido');
        return false;
      }
    }

    // Si todo está bien
    setErrorMessage('');
    return true;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll al mensaje de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      // Construir el objeto de datos de la orden
      const orderData = {
        items,
        customer: customerInfo,
        deliveryMethod,
        paymentMethod: selectedPaymentMethod,
        total: finalTotal,
        tax: calculateTax(),
        shipping: calculateShippingCost(),
        ...(deliveryMethod === 'delivery' && { deliveryAddress }),
        ...(deliveryMethod === 'pickup' && {
          pickup: {
            storeId: selectedStoreId,
            store: storeLocations.find(store => store.id === selectedStoreId),
            date: selectedDate,
            time: selectedTime
          }
        })
      };

      // Simular procesamiento de pago (esperar 1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Aquí iría la lógica real para procesar el pago según el método seleccionado
      if (selectedPaymentMethod === 'mercado_pago') {
        // Simular redirección a MercadoPago
        setSuccessMessage('Redirigiendo a MercadoPago...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Finalizar el checkout y enviar los datos
        onCompletePurchase(orderData);
      } else if (selectedPaymentMethod === 'cash') {
        // Procesar pago en efectivo
        setSuccessMessage('¡Pedido confirmado! Pagarás en efectivo al recibir tu pedido.');

        // Finalizar el checkout
        onCompletePurchase(orderData);
      } else {
        // Otros métodos de pago
        setSuccessMessage('¡Pedido confirmado! Procesando tu pago...');

        // Finalizar el checkout
        onCompletePurchase(orderData);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setErrorMessage('Ocurrió un error al procesar tu pago. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener la tienda seleccionada
  const selectedStore = storeLocations.find(store => store.id === selectedStoreId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno con efecto de glass */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onGoBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100"
                disabled={isLoading}
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </motion.button>
              <h1 className="text-xl font-bold">Finalizar compra</h1>
            </div>

            {/* Contador de pasos */}
            <div className="hidden sm:flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="h-2 w-10 rounded-full bg-green-500"></span>
              <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            </div>
          </div>

          {/* Indicador de tipo de entrega */}
          <div className="flex items-center space-x-2 py-2 text-sm">
            {deliveryMethod === 'delivery' ? (
              <>
                <Truck size={16} className="text-green-500" />
                <span className="font-medium">Entrega a domicilio</span>
              </>
            ) : (
              <>
                <Store size={16} className="text-green-500" />
                <span className="font-medium">Retiro en tienda</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mensajes de error o éxito */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white mx-4 mt-4 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-red-500 h-1"></div>
            <div className="p-4 flex items-start">
              <AlertCircle size={20} className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white mx-4 mt-4 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-green-500 h-1"></div>
            <div className="p-4 flex items-start">
              <Check size={20} className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-gray-700">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón para mostrar/ocultar resumen en mobile */}
      {isMobile && (
        <div className="sticky top-[100px] z-40 px-4 mb-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSummary(!showSummary)}
            className="w-full bg-white shadow-md rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="font-medium">Resumen del pedido</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg mr-2">{formatPrice(finalTotal)}</span>
              <ChevronDown
                size={18}
                className={`transition-transform transform ${showSummary ? 'rotate-180' : ''}`}
              />
            </div>
          </motion.button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna izquierda - Formulario */}
          <div className="md:col-span-7 space-y-6">
            {/* Sección: Información personal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <User size={20} className="mr-2 text-green-500" />
                Información personal
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej. Juan Pérez"
                      required
                    />
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono de contacto *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej. +56 9 1234 5678"
                      required
                    />
                    <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej. juanperez@email.com"
                      required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Si es entrega a domicilio, mostrar formulario de dirección */}
            {deliveryMethod === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MapPin size={20} className="mr-2 text-green-500" />
                  Dirección de entrega
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Calle *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="street"
                          name="street"
                          value={deliveryAddress.street}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ej. Av. Principal"
                          required
                        />
                        <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        id="number"
                        name="number"
                        value={deliveryAddress.number}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej. 123"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                        Depto/Oficina
                      </label>
                      <input
                        type="text"
                        id="apartment"
                        name="apartment"
                        value={deliveryAddress.apartment}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej. Depto 402"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={deliveryAddress.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ej. Santiago"
                          required
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                      Barrio/Sector
                    </label>
                    <input
                      type="text"
                      id="neighborhood"
                      name="neighborhood"
                      value={deliveryAddress.neighborhood}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej. Las Condes"
                    />
                  </div>
                  <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                      Referencias para la entrega
                    </label>
                    <textarea
                      id="reference"
                      name="reference"
                      value={deliveryAddress.reference}
                      onChange={handleAddressChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej. Casa azul, portón negro, cerca de la farmacia"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Si es retiro en tienda, mostrar selección de tienda */}
            {deliveryMethod === 'pickup' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Store size={20} className="mr-2 text-green-500" />
                  Tienda para retiro
                </h2>

                {/* Selector de tienda con dropdown moderno */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona una tienda *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {selectedStore ? (
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                            {selectedStore.image_url ? (
                              <Image
                                src={selectedStore.image_url}
                                alt={selectedStore.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Store size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{selectedStore.name}</div>
                            <div className="text-xs text-gray-500">{selectedStore.address}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Selecciona una tienda</span>
                      )}
                      <ChevronDown size={18} className={`transition-transform ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isStoreDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg"
                        >
                          {storeLocations.map(store => (
                            <div
                              key={store.id}
                              onClick={() => {
                                setSelectedStoreId(store.id);
                                setIsStoreDropdownOpen(false);
                              }}
                              className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 ${
                                store.id === selectedStoreId ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                {store.image_url ? (
                                  <Image
                                    src={store.image_url}
                                    alt={store.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Store size={20} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{store.name}</div>
                                <div className="text-xs text-gray-500">{store.address}, {store.city}</div>
                              </div>
                              {store.id === selectedStoreId && (
                                <Check size={16} className="ml-auto text-green-500" />
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Mostrar detalles de la tienda seleccionada */}
                {selectedStore && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">Detalles de la tienda</h3>
                    <p className="text-gray-600 flex items-center text-sm mb-1">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {selectedStore.address}, {selectedStore.city}
                    </p>
                    <p className="text-gray-600 flex items-center text-sm">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {selectedStore.openHours}
                    </p>
                  </div>
                )}

                {/* Selección de fecha y hora para retiro */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Calendar size={18} className="mr-2 text-green-500" />
                    Selecciona día y hora para retirar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                      </label>
                      <div className="relative">
                        <select
                          id="pickup-date"
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          required
                        >
                          <option value="">Selecciona una fecha</option>
                          {availableDates.map(date => (
                            <option key={date.value} value={date.value}>
                              {date.label}
                            </option>
                          ))}
                        </select>
                        <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pickup-time" className="block text-sm font-medium text-gray-700 mb-1">
                        Hora *
                      </label>
                      <div className="relative">
                        <select
                          id="pickup-time"
                          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          required
                        >
                          <option value="">Selecciona una hora</option>
                          {availableTimes.map(time => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                        <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Métodos de pago */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-green-500" />
                Método de pago
              </h2>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === 'mercado_pago'
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod('mercado_pago')}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                      {/* Logo de MercadoPago */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.8534 5.2644H4.14658C2.96818 5.2644 2 6.21963 2 7.38225V16.618C2 17.7806 2.96818 18.7359 4.14658 18.7359H19.8534C21.0318 18.7359 22 17.7806 22 16.618V7.38225C22 6.21963 21.0318 5.2644 19.8534 5.2644Z" fill="#2D3277"/>
                        <path d="M14.6962 11.9998C14.6962 13.9661 13.0193 15.5628 10.9522 15.5628C8.88643 15.5628 7.20825 13.9661 7.20825 11.9998C7.20825 10.0336 8.88643 8.43689 10.9522 8.43689C13.0193 8.43689 14.6962 10.0336 14.6962 11.9998Z" fill="#449EE8"/>
                        <path d="M16.792 8.43689C16.792 9.78356 15.6699 10.8747 14.3233 10.8747C12.9754 10.8747 11.8533 9.78356 11.8533 8.43689C11.8533 7.09022 12.9754 5.99911 14.3233 5.99911C15.6699 5.99911 16.792 7.09022 16.792 8.43689Z" fill="#40D38D"/>
                        <path d="M19.8534 11.9998C19.8534 13.3452 18.7313 14.4376 17.3833 14.4376C16.037 14.4376 14.9149 13.3452 14.9149 11.9998C14.9149 10.6545 16.037 9.56165 17.3833 9.56165C18.7313 9.56165 19.8534 10.6545 19.8534 11.9998Z" fill="#FFDB5E"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">MercadoPago</h3>
                      <p className="text-sm text-gray-500">Tarjetas, transferencia y más</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedPaymentMethod === 'mercado_pago'
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'mercado_pago' && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPaymentMethod === 'cash'
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod('cash')}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mr-4">
                      <Banknote size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Pago en efectivo</h3>
                      <p className="text-sm text-gray-500">
                        {deliveryMethod === 'delivery'
                          ? 'Paga al repartidor en la entrega'
                          : 'Paga en la tienda al retirar'
                        }
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedPaymentMethod === 'cash'
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'cash' && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bloque de métodos de pago adicionales */}
                <motion.div
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                  className="mt-4 py-3 px-4 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 cursor-not-allowed"
                >
                  <DollarSign size={16} className="mr-1 text-gray-400" />
                  <span className="text-sm">Más métodos de pago próximamente</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Info de seguridad */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center px-4 py-3 bg-blue-50 rounded-lg text-blue-800 text-sm"
            >
              <ShieldCheck size={20} className="text-blue-500 mr-2 flex-shrink-0" />
              <p>Tu información está segura y tus pagos protegidos con la máxima seguridad.</p>
            </motion.div>
          </div>

          {/* Columna derecha - Resumen del pedido */}
          <div className="md:col-span-5">
            <AnimatePresence>
              {showSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white p-6 rounded-xl shadow-sm md:sticky md:top-24"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Resumen del pedido
                  </h2>

                  {/* Modo de entrega */}
                  <div className="flex items-center py-3 border-b border-gray-100">
                    {deliveryMethod === 'delivery' ? (
                      <>
                        <Truck size={20} className="text-green-500 mr-2" />
                        <span className="font-medium">Envío a domicilio</span>
                      </>
                    ) : (
                      <>
                        <Store size={20} className="text-green-500 mr-2" />
                        <span className="font-medium">Retiro en tienda</span>
                      </>
                    )}
                  </div>

                  {/* Lista de productos */}
                  <div className="py-4 max-h-60 overflow-y-auto hide-scrollbar">
                    {items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex py-2 first:pt-0 last:pb-0"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={48}
                              height={48}
                              style={{ objectFit: 'cover' }}
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium text-sm text-gray-800">{item.name}</span>
                              <span className="ml-1 text-sm bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">x{item.quantity}</span>
                            </div>
                            <span className="font-medium text-sm">{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                          </div>

                          {/* Opciones seleccionadas */}
                          {item.selected_options && item.selected_options.length > 0 && (
                            <div className="mt-1">
                              {item.selected_options.map((option, optIdx) =>
                                option.selected_items.length > 0 && (
                                  <div key={optIdx} className="text-xs text-gray-500 flex items-center">
                                    <span className="w-1 h-1 bg-gray-300 rounded-full mr-1"></span>
                                    {option.option_name}: {option.selected_items.map(i => i.item_name).join(', ')}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Costos con animación */}
                  <motion.div
                    className="space-y-2 py-4 border-t border-b border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(calculateTotal())}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impuestos (19%)</span>
                      <span>{formatPrice(calculateTax())}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {deliveryMethod === 'delivery' ? 'Costo de envío' : 'Retiro en tienda'}
                      </span>
                      <span className={deliveryMethod === 'pickup' ? 'text-green-500 font-medium' : ''}>
                        {deliveryMethod === 'delivery'
                          ? formatPrice(calculateShippingCost())
                          : 'Gratis'
                        }
                      </span>
                    </div>
                  </motion.div>

                  {/* Total */}
                  <motion.div
                    className="flex justify-between pt-4 pb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-green-600">{formatPrice(finalTotal)}</span>
                  </motion.div>

                  {/* Acuerdo de términos */}
                  <div className="mt-4 mb-6 text-xs text-gray-500">
                    Al realizar esta compra, aceptas nuestros <a href="#" className="text-green-600 underline">Términos y Condiciones</a> y <a href="#" className="text-green-600 underline">Política de Privacidad</a>.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>

      {/* Footer flotante con el botón de checkout */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 mb-0.5">Total a pagar</span>
            <span className="font-bold text-xl text-green-600">{formatPrice(finalTotal)}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            onClick={handleSubmit}
            className={`px-8 py-3.5 rounded-xl font-bold text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Finalizar compra'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;