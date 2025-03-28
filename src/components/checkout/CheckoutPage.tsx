// src/components/checkout/CheckoutPage.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CreditCard, MapPin, Store, Calendar, Clock, User, Phone, Home, MapPinned, Truck, Check, AlertCircle, DollarSign, Banknote, ShieldCheck, ChevronDown, Send } from 'lucide-react';
import { NoSwipeModal } from '@/components/ui/NoSwipeModal';
import api from '@/utils/api';

// Importamos el servicio de WhatsApp
import whatsappService from '@/services/whatsappService';
import { Product, DeliveryAddress, CommerceData } from '@/types';

interface CheckoutPageProps {
  items: Product[];
  deliveryMethod: 'delivery' | 'pickup';
  onGoBack: () => void;
  onCompletePurchase: (orderData: any) => void;
  commerceData?: CommerceData; // Datos del comercio que pueden ser pasados como prop
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  openHours: string;
  deliveryTime: string;
  image_url?: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  deliveryMethod,
  onGoBack,
  onCompletePurchase,
  commerceData: initialCommerceData,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mercado_pago');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
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
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([]);

  // Estado para seguimiento de operación completada
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState('');

  // Estado para los datos del comercio
  const [commerceData, setCommerceData] = useState<CommerceData | null>(null);
  const [isCommerceFetching, setIsCommerceFetching] = useState(true);
  const [isCommerceOpen, setIsCommerceOpen] = useState(true);
  const [businessHours, setBusinessHours] = useState('');

  // Usar los datos iniciales del comercio si se proporcionan
  useEffect(() => {
    if (initialCommerceData) {
      setCommerceData(initialCommerceData);
      setIsCommerceOpen(initialCommerceData.is_open);
      setIsCommerceFetching(false);
      setBusinessHours(initialCommerceData.working_hours || '');

      // Crear las ubicaciones de tienda basadas en los datos del comercio
      if (initialCommerceData.address) {
        setStoreLocations([
          {
            id: 1,
            name: initialCommerceData.business_name,
            address: initialCommerceData.address,
            city: 'CABA', // Este valor podría venir del backend
            openHours: initialCommerceData.working_hours || 'Horario no especificado',
            deliveryTime: initialCommerceData.delivery_time || 'Tiempo no especificado',
            image_url: initialCommerceData.logo_url
          }
        ]);
      }
    } else {
      // Si no se proporcionan, intentar obtenerlos de la API
      fetchCommerceData();
    }
  }, [initialCommerceData]);

  // Función para cargar datos del comercio desde la API
  const fetchCommerceData = async () => {
    setIsCommerceFetching(true);
    try {
      // Intentar cargar desde la API
      // Intentar obtener el subdomain del comercio actual
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      // Intentar obtener con subdomain
      const response = await api.get(`/api/public/${subdomain}`);
      setCommerceData(response.data.commerce);
      setIsCommerceOpen(response.data.commerce.is_open);
      setBusinessHours(response.data.commerce.working_hours || '');

      // Crear ubicaciones de tienda si hay dirección
      if (response.data.commerce.address) {
        setStoreLocations([
          {
            id: 1,
            name: response.data.commerce.business_name,
            address: response.data.commerce.address,
            city: 'CABA', // Este valor podría venir del backend
            openHours: response.data.commerce.working_hours || 'Horario no especificado',
            deliveryTime: response.data.commerce.delivery_time || 'Tiempo no especificado',
            image_url: response.data.commerce.logo_url
          }
        ]);
      }
    } catch (error) {
      console.error('Error obteniendo datos del comercio:', error);
      setErrorMessage('No se pudieron cargar los datos del comercio');
    } finally {
      setIsCommerceFetching(false);
    }
  };

  // Inicializar la primera tienda como seleccionada
  useEffect(() => {
    if (deliveryMethod === 'pickup' && storeLocations.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storeLocations[0].id);
    }
  }, [deliveryMethod, selectedStoreId, storeLocations]);

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

  // Cargar información del cliente si está disponible en localStorage
  useEffect(() => {
    try {
      const savedCustomerInfo = localStorage.getItem('customerInfo');
      if (savedCustomerInfo) {
        setCustomerInfo(JSON.parse(savedCustomerInfo));
      }

      const savedDeliveryAddress = localStorage.getItem('deliveryAddress');
      if (savedDeliveryAddress) {
        setDeliveryAddress(JSON.parse(savedDeliveryAddress));
      }
    } catch (error) {
      console.error("Error cargando datos del cliente:", error);
    }
  }, []);

  // Generar fechas disponibles (próximos 7 días)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
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

  // Calcular costos de envío usando datos del comercio
  const calculateShippingCost = () => {
    if (deliveryMethod !== 'delivery') return 0;

    // Usar el delivery_fee del comercio si está disponible
    return commerceData?.delivery_fee || 0;
  };

  // Total final con costos de envío (sin impuestos)
  const finalTotal = calculateTotal() + calculateShippingCost();

  // Formato para precios en ARS ($)
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('ARS', '$');
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

    // Validar formato de teléfono para Argentina (básico)
    const phoneRegex = /^(?:\+?54)?(?:9)?[1-9]\d{7,10}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/\D/g, ''))) {
      setErrorMessage('Ingresa un número de teléfono válido para Argentina');
      return false;
    }

    // Validar email si fue proporcionado
    if (customerInfo.email && !validateEmail(customerInfo.email)) {
      setErrorMessage('Por favor ingresa un email válido');
      return false;
    }

    // Validaciones específicas para delivery
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress.street.trim() || !deliveryAddress.number.trim()) {
        setErrorMessage('Por favor completa los campos obligatorios de la dirección');
        return false;
      }

      // Verificar si el comercio tiene un valor mínimo de pedido
      const orderTotal = calculateTotal();
      if (commerceData?.min_order_value && orderTotal < commerceData.min_order_value) {
        setErrorMessage(`El pedido mínimo para delivery es ${formatPrice(commerceData.min_order_value)}`);
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
        setErrorMessage('Por favor selecciona una fecha para retirar tu pedido');
        return false;
      }

      if (!selectedTime) {
        setErrorMessage('Por favor selecciona una hora para retirar tu pedido');
        return false;
      }
    }

    // Verificar si el comercio está abierto
    if (!isCommerceOpen) {
      setErrorMessage('Lo sentimos, el comercio está cerrado en este momento');
      return false;
    }

    // Si todo está bien
    setErrorMessage('');
    return true;
  };

  // Validar email con una expresión regular simple
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll al mensaje de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Guardar información del cliente en localStorage
    try {
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
      if (deliveryMethod === 'delivery') {
        localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
      }
    } catch (error) {
      console.error("Error guardando datos del cliente:", error);
    }

    setIsLoading(true);

    try {
      // Verificar información del comercio
      if (!commerceData) {
        console.error('No hay datos del comercio disponibles');
        setErrorMessage('No se pudieron cargar los datos del comercio. Intenta nuevamente.');
        setIsLoading(false);
        return;
      }

      console.log("Datos del comercio para el checkout:", {
        id: commerceData.id,
        nombre: commerceData.business_name,
        telefono: commerceData.contact_phone,
        whatsapp: commerceData.social_whatsapp,
        tiempo_entrega: commerceData.delivery_time,
        pedido_minimo: commerceData.min_order_value,
        costo_envio: commerceData.delivery_fee
      });

      // Verificar número de contacto
      const phoneNumber = commerceData.social_whatsapp || commerceData.contact_phone || '';
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.warn('No hay número de teléfono válido para generar enlace WhatsApp. Se continuará con el pedido de todas formas.');
      } else {
        console.log('Número de teléfono disponible para WhatsApp:', phoneNumber);
      }

      // Generar el enlace de WhatsApp con mejor manejo de errores
      let whatsappLink = '';
      try {
        // Solo si hay un número de teléfono disponible
        if (phoneNumber && phoneNumber.trim() !== '') {
          // Preparar los datos del pedido para WhatsApp
          const whatsappData = {
            customer: customerInfo,
            deliveryMethod,
            items,
            total: finalTotal,
            shipping: calculateShippingCost(),
            ...(deliveryMethod === 'delivery' && { deliveryAddress }),
            ...(deliveryMethod === 'pickup' && {
              pickup: {
                date: selectedDate,
                time: selectedTime
              }
            }),
            paymentMethod: selectedPaymentMethod
          };

          whatsappLink = whatsappService.generateWhatsAppLink(phoneNumber, whatsappData);
          console.log('WhatsApp link generado:', whatsappLink ? 'Exitoso' : 'Fallido');
        }
      } catch (whatsappError) {
        console.error('Error al generar enlace de WhatsApp:', whatsappError);
        // Continuar con el pedido aunque falle WhatsApp
      }

      // Construir el objeto de datos de la orden
      const orderData = {
        items,
        customer: customerInfo,
        deliveryMethod,
        paymentMethod: selectedPaymentMethod,
        total: finalTotal,
        shipping: calculateShippingCost(),
        date: new Date().toISOString(),
        status: 'confirmed',
        ...(deliveryMethod === 'delivery' && { deliveryAddress }),
        ...(deliveryMethod === 'pickup' && {
          pickup: {
            storeId: selectedStoreId,
            store: storeLocations.find(store => store.id === selectedStoreId),
            date: selectedDate,
            time: selectedTime
          }
        }),
        // Añadir información del comercio para referencia
        commerce: {
          id: commerceData?.id,
          business_name: commerceData?.business_name,
          address: commerceData?.address,
          contact_phone: commerceData?.contact_phone,
          social_whatsapp: commerceData?.social_whatsapp,
          delivery_time: commerceData?.delivery_time,
          delivery_fee: commerceData?.delivery_fee,
          min_order_value: commerceData?.min_order_value
        }
      };

      // Si tenemos un enlace de WhatsApp, añadirlo a los datos del pedido
      if (whatsappLink) {
        orderData.whatsappLink = whatsappLink;
      }

      // Mostrar mensaje según método de pago
      if (selectedPaymentMethod === 'mercado_pago') {
        setSuccessMessage('¡Pedido confirmado! Redirigiendo a MercadoPago...');
      } else if (selectedPaymentMethod === 'cash') {
        setSuccessMessage('¡Pedido confirmado! Pagarás en efectivo al recibir tu pedido.');
      }

      // Guardar el enlace de WhatsApp para redirigir después (solo si existe)
      if (whatsappLink) {
        setWhatsappRedirectUrl(whatsappLink);
      }

      setIsOrderCompleted(true);

      // Finalizar el checkout y enviar los datos
      onCompletePurchase(orderData);

      // Abrir WhatsApp solo si se generó un enlace válido
      if (whatsappLink) {
        console.log('Abriendo chat de WhatsApp...');

        setTimeout(() => {
          try {
            window.open(whatsappLink, '_blank');
          } catch (windowError) {
            console.error('Error al abrir ventana de WhatsApp:', windowError);
            alert('No se pudo abrir WhatsApp automáticamente. Verifica que tu navegador permita ventanas emergentes.');
          }
        }, 800);
      } else {
        console.log('Pedido completado sin redirección a WhatsApp. No se encontró número de teléfono válido.');
      }

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      setErrorMessage(`Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el envío directo por WhatsApp (para "Pedir por WhatsApp")
  const handleWhatsAppOrder = () => {
    if (!validateForm()) {
      // Scroll al mensaje de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const whatsappLink = generateWhatsAppLink();
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    } else {
      setErrorMessage('No se pudo generar el enlace a WhatsApp. Por favor, completa el pedido normalmente.');
    }
  };

  // Genera el link para WhatsApp utilizando el servicio
  const generateWhatsAppLink = () => {
    try {
      if (!commerceData) {
        console.error('No hay datos del comercio disponibles para generar enlace WhatsApp');
        return '';
      }

      // Obtener el número de teléfono del comercio con prioridad a WhatsApp
      const phoneNumber = commerceData.social_whatsapp || commerceData.contact_phone || '';
      if (!phoneNumber || phoneNumber.trim() === '') {
        console.error('No se encontró un número de teléfono válido para el comercio');
        return '';
      }

      console.log('Número de teléfono para WhatsApp:', phoneNumber);

      // Preparar los datos del pedido para WhatsApp
      const orderData = {
        customer: customerInfo,
        deliveryMethod,
        items,
        total: finalTotal,
        shipping: calculateShippingCost(),
        ...(deliveryMethod === 'delivery' && { deliveryAddress }),
        ...(deliveryMethod === 'pickup' && {
          pickup: {
            date: selectedDate,
            time: selectedTime
          }
        }),
        paymentMethod: selectedPaymentMethod
      };

      // Usar el servicio para generar el enlace completo
      const link = whatsappService.generateWhatsAppLink(phoneNumber, orderData);
      console.log('WhatsApp link generado:', link ? 'Exitoso' : 'Fallido');
      return link;
    } catch (error) {
      console.error('Error generando enlace de WhatsApp:', error);
      return '';
    }
  };

  // Obtener la tienda seleccionada
  const selectedStore = storeLocations.find(store => store.id === selectedStoreId);

  // Componente para el resumen en un modal
  const OrderSummaryContent = () => (
    <div className="px-4 py-3">
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
            {commerceData?.delivery_time && (
              <span className="ml-2 text-sm text-gray-500">({commerceData.delivery_time})</span>
            )}
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

      {/* Costos */}
      <div className="space-y-2 py-4 border-t border-b border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(calculateTotal())}</span>
        </div>

        {deliveryMethod === 'delivery' && calculateShippingCost() > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Costo de envío</span>
            <span>{formatPrice(calculateShippingCost())}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between pt-4 pb-2">
        <span className="font-bold text-lg">Total</span>
        <span className="font-bold text-xl text-green-600">{formatPrice(finalTotal)}</span>
      </div>

      {/* Acuerdo de términos */}
      <div className="mt-4 mb-6 text-xs text-gray-500">
        Al realizar esta compra, aceptas nuestros <a href="#" className="text-green-600 underline">Términos y Condiciones</a> y <a href="#" className="text-green-600 underline">Política de Privacidad</a>.
      </div>
    </div>
  );

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

          {/* Indicador de tipo de entrega e información del comercio */}
          <div className="flex items-center space-x-2 py-2 text-sm">
            {deliveryMethod === 'delivery' ? (
              <>
                <Truck size={16} className="text-green-500" />
                <span className="font-medium">Entrega a domicilio</span>
                {commerceData?.delivery_time && (
                  <span className="text-gray-500">({commerceData.delivery_time})</span>
                )}

                {/* Indicador de pedido mínimo */}
                {commerceData?.min_order_value && commerceData.min_order_value > 0 && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Pedido mínimo: {formatPrice(commerceData.min_order_value)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <Store size={16} className="text-green-500" />
                                <span className="font-medium">Retiro en tienda</span>
                                {businessHours && (
                                  <span className="text-xs text-gray-500 ml-2">Horario: {businessHours}</span>
                                )}
                              </>
                            )}

                            {/* Indicador de comercio abierto/cerrado */}
                            <div className={`ml-auto flex items-center ${isCommerceOpen ? 'text-green-600' : 'text-red-500'}`}>
                              <span className={`w-2 h-2 rounded-full mr-1 ${isCommerceOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className="text-xs font-medium">{isCommerceOpen ? 'Abierto' : 'Cerrado'}</span>
                            </div>
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

                      {/* Mensaje cuando el comercio está cerrado */}
                      {!isCommerceOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white mx-4 mt-4 rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="bg-amber-500 h-1"></div>
                          <div className="p-4 flex items-start">
                            <Clock size={20} className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-gray-700 font-medium">El comercio está cerrado en este momento</p>
                              <p className="text-sm text-gray-500 mt-1">Puedes revisar el horario de atención: {businessHours}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Cargando información del comercio */}
                      {isCommerceFetching && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-center items-center py-6"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                          <span className="ml-3 text-gray-600">Cargando información...</span>
                        </motion.div>
                      )}

                      {/* Botón para mostrar el resumen en mobile */}
                      {isMobile && (
                        <div className="sticky top-[100px] z-40 px-4 mb-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowSummaryModal(true)}
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
                              <ChevronDown size={18} />
                            </div>
                          </motion.button>
                        </div>
                      )}

                      {/* Modal del resumen para móvil (usando el componente NoSwipeModal) */}
                      <NoSwipeModal
                        isOpen={showSummaryModal}
                        onClose={() => setShowSummaryModal(false)}
                        title="Resumen del pedido"
                        showCloseButton={true}
                      >
                        <OrderSummaryContent />
                      </NoSwipeModal>

                      {!isCommerceFetching && (
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
                                      Celular (WhatsApp) *
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ej. +54 9 11 1234-5678"
                                        required
                                      />
                                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Ingresa tu número con código de área (ej. 11 para CABA) para recibir actualizaciones del pedido.</p>
                                  </div>
                                  <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                      Email
                                    </label>
                                    <div className="relative">
                                      <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ej. tu@email.com"
                                      />
                                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Para recibir confirmación y seguimiento de tu pedido.</p>
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
                                            placeholder="Ej. Av. Rivadavia"
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
                                          placeholder="Ej. 1234"
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                                          Depto/Piso
                                        </label>
                                        <input
                                          type="text"
                                          id="apartment"
                                          name="apartment"
                                          value={deliveryAddress.apartment}
                                          onChange={handleAddressChange}
                                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                          placeholder="Ej. 3ro B"
                                        />
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                          Localidad
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={deliveryAddress.city}
                                            onChange={handleAddressChange}
                                            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Ej. CABA"
                                          />
                                          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                                        Barrio
                                      </label>
                                      <input
                                        type="text"
                                        id="neighborhood"
                                        name="neighborhood"
                                        value={deliveryAddress.neighborhood}
                                        onChange={handleAddressChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Ej. Recoleta"
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
                                        placeholder="Ej. Edificio azul, timbre 3B, entre calles Córdoba y Santa Fe"
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
                                    Local para retiro
                                  </h2>

                                  {/* Información sobre horarios de trabajo */}
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="flex items-center">
                                      <Clock size={16} className="mr-2 text-blue-500" />
                                      <span className="text-blue-700">
                                        <strong>Horario de atención:</strong> {businessHours || "Consultar horarios"}
                                      </span>
                                    </p>
                                  </div>

                                  {/* Selector de tienda simplificado - solo mostramos la única tienda */}
                                  <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Dirección del local
                                    </label>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                      <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                          {commerceData?.logo_url ? (
                                            <Image
                                              src={commerceData.logo_url}
                                              alt={commerceData.business_name}
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
                                          <div className="font-medium">{commerceData?.business_name}</div>
                                          <div className="text-xs text-gray-500">{commerceData?.address}</div>
                                          {commerceData?.phone && (
                                            <div className="text-xs text-gray-500 mt-1">Teléfono: {commerceData.phone}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Selección de fecha y hora para retiro */}
                                  <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                      <Calendar size={18} className="mr-2 text-green-500" />Selecciona día y hora para retirar
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
                                  {/* Mercado Pago */}
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

                                  {/* Efectivo */}
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
                                            : 'Paga en el local al retirar'
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

                                  {/* Opción de WhatsApp */}
                                  {(commerceData?.social_whatsapp || commerceData?.contact_phone) && (
                                    <motion.div
                                      whileHover={{ scale: 1.01 }}
                                      whileTap={{ scale: 0.99 }}
                                      className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center cursor-pointer"
                                      onClick={handleWhatsAppOrder}
                                    >
                                      <Send size={20} className="mr-2 text-green-600" />
                                      <span className="text-green-700 font-medium">Enviar pedido por WhatsApp</span>
                                    </motion.div>
                                  )}
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

                              {/* Información de contacto del comercio */}
                              {commerceData && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                  className="bg-white p-4 rounded-xl shadow-sm"
                                >
                                  <div className="flex items-start">
                                    {commerceData.logo_url && (
                                                          <div className="mr-3 w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <Image
                                                              src={commerceData.logo_url}
                                                              alt={commerceData.business_name}
                                                              width={48}
                                                              height={48}
                                                              className="w-full h-full object-cover"
                                                            />
                                                          </div>
                                                        )}
                                                        <div>
                                                          <h3 className="font-medium">{commerceData.business_name}</h3>
                                                          <div className="mt-1 space-y-1 text-sm text-gray-500">
                                                            {commerceData.contact_phone && (
                                                              <div className="flex items-center">
                                                                <Phone size={14} className="mr-1" />
                                                                <span>{commerceData.contact_phone}</span>
                                                              </div>
                                                            )}
                                                            {commerceData.contact_email && (
                                                              <div className="flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{commerceData.contact_email}</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </div>

                                                {/* Columna derecha - Resumen del pedido para escritorio */}
                                                <div className="md:col-span-5 hidden md:block">
                                                  <AnimatePresence>
                                                    {showSummary && (
                                                      <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 20 }}
                                                        className="bg-white p-6 rounded-xl shadow-sm md:sticky md:top-24"
                                                      >
                                                        <OrderSummaryContent />
                                                      </motion.div>
                                                    )}
                                                  </AnimatePresence>
                                                </div>
                                              </div>
                                            </form>
                                          )}

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
                                                  isLoading || !isCommerceOpen
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-500'
                                                }`}
                                                disabled={isLoading || !isCommerceOpen}
                                              >
                                                {isLoading ? (
                                                  <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Procesando...
                                                  </span>
                                                ) : !isCommerceOpen ? (
                                                  "Comercio cerrado"
                                                ) : (
                                                  'Finalizar compra'
                                                )}
                                              </motion.button>
                                            </div>
                                          </div>

                                          {/* Modal para confirmar el envío a WhatsApp (opcional) */}
                                          <AnimatePresence>
                                            {isOrderCompleted && whatsappRedirectUrl && (
                                              <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                                              >
                                                <motion.div
                                                  initial={{ scale: 0.9, opacity: 0 }}
                                                  animate={{ scale: 1, opacity: 1 }}
                                                  exit={{ scale: 0.9, opacity: 0 }}
                                                  className="bg-white rounded-xl p-6 m-4 max-w-md"
                                                >
                                                  <h2 className="text-xl font-bold mb-4 text-green-600 flex items-center">
                                                    <Check size={24} className="mr-2" /> ¡Pedido Confirmado!
                                                  </h2>
                                                  <p className="text-gray-700 mb-4">
                                                    Tu pedido ha sido registrado correctamente. Estamos preparando tu WhatsApp para confirmar los detalles con el negocio.
                                                  </p>
                                                  <div className="flex gap-3 mt-6">
                                                    <button
                                                      onClick={() => {
                                                        window.open(whatsappRedirectUrl, '_blank');
                                                        setIsOrderCompleted(false);
                                                      }}
                                                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center"
                                                    >
                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        width="24"
                                                        height="24"
                                                        className="fill-current mr-2"
                                                      >
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                      </svg>
                                                      Confirmar por WhatsApp
                                                    </button>
                                                    <button
                                                      onClick={() => setIsOrderCompleted(false)}
                                                      className="flex-none border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium"
                                                    >
                                                      Cerrar
                                                    </button>
                                                  </div>
                                                </motion.div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    };

                                    export default CheckoutPage;