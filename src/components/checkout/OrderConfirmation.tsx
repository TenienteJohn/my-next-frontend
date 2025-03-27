// src/components/checkout/OrderConfirmation.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, MapPin, ChevronLeft, CalendarClock, Store, Truck, Home, CreditCard, Banknote, Award, Share2, ShieldCheck, MapPinned } from 'lucide-react';

interface OrderConfirmationProps {
  orderId?: string;
  orderData?: any;
  onGoBack?: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderId,
  orderData,
  onGoBack,
}) => {
  const router = useRouter();
  const [order, setOrder] = useState<any>(orderData);
  const [isLoading, setIsLoading] = useState(!orderData);

  // Si no tenemos datos de la orden directamente, simular la carga de datos
  useEffect(() => {
    if (!orderData && orderId) {
      setIsLoading(true);

      // Aquí se haría una llamada a la API para obtener los datos de la orden
      // Por ahora, simularemos con un timeout
      const timeout = setTimeout(() => {
        // Datos de ejemplo
        setOrder({
          id: orderId || 'ORD-12345',
          date: new Date().toISOString(),
          status: 'confirmed',
          customer: {
            name: 'Juan Pérez',
            email: 'juan@ejemplo.com',
            phone: '+56 9 1234 5678'
          },
          deliveryMethod: 'delivery',
          deliveryAddress: {
            street: 'Av. Principal',
            number: '123',
            city: 'Santiago',
            reference: 'Casa azul'
          },
          paymentMethod: 'mercado_pago',
          paymentStatus: 'paid',
          items: [
            {
              id: 1,
              name: 'Producto Ejemplo',
              price: 15000,
              quantity: 2,
              image_url: '/images/products/example.jpg'
            }
          ],
          total: 30000,
          shipping: 3500,
          tax: 5700,
          estimatedDelivery: '30-60 minutos'
        });
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [orderData, orderId]);

  // Formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear precios
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('CLP', '$').replace('.', ',');
  };

  // Renderizar un estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-700 mt-4">Cargando detalles del pedido...</h2>
      </div>
    );
  }

  // Si no hay orden o datos incorrectos
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Pedido no encontrado</h2>
        <p className="text-gray-500 mb-6">No pudimos encontrar los detalles de este pedido.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderno con efecto de glass */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {onGoBack && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onGoBack}
                  className="mr-3 p-2 rounded-full hover:bg-gray-100"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </motion.button>
              )}
              <h1 className="text-xl font-bold">Confirmación de pedido</h1>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Compartir pedido"
            >
              <Share2 size={18} className="text-gray-600" />
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Banner de éxito */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm mb-6 border border-green-200"
        >
          <div className="flex items-center mb-3">
            <div className="bg-green-500 text-white rounded-full p-2 mr-3 shadow-sm">
              <Check size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">¡Pedido realizado con éxito!</h2>
              <p className="text-green-700 mt-1">
                Hemos recibido tu pedido y lo estamos procesando.
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white p-3 rounded-lg text-green-800 text-sm">
            <Award size={16} className="text-green-500 mr-2 flex-shrink-0" />
            <p>Recibirás una confirmación por email a <span className="font-semibold">{order.customer?.email}</span></p>
          </div>
        </motion.div>

        {/* Número de orden y detalles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Pedido #{order.id}</h2>
              <p className="text-gray-500 text-sm">
                Realizado el {order.date ? formatDate(order.date) : 'N/A'}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status === 'confirmed' ? 'Confirmado' : 'Procesando'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Detalles de entrega</h3>

            {order.deliveryMethod === 'delivery' ? (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start">
                  <Truck size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Entrega a domicilio</p>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-gray-700 flex items-center">
                        <Clock size={14} className="mr-2 text-gray-500" />
                        Tiempo estimado: <span className="font-medium ml-1">{order.estimatedDelivery || '30-60 minutos'}</span>
                      </p>
                      <p className="text-gray-700 flex items-start">
                        <MapPinned size={14} className="mr-2 mt-1 text-gray-500" />
                        <span>
                          {order.deliveryAddress?.street} {order.deliveryAddress?.number}, {order.deliveryAddress?.city}
                          {order.deliveryAddress?.apartment && `, ${order.deliveryAddress.apartment}`}
                        </span>
                      </p>
                      {order.deliveryAddress?.reference && (
                        <p className="text-gray-600 text-sm flex items-start pl-4 ml-2 border-l border-gray-200">
                          <span>Referencia: {order.deliveryAddress.reference}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start">
                  <Store size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Retiro en tienda</p>
                    {order.pickup?.store && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-gray-700 flex items-center">
                          <Store size={14} className="mr-2 text-gray-500" />
                          {order.pickup.store.name}
                        </p>
                        <p className="text-gray-700 flex items-start">
                          <MapPin size={14} className="mr-2 mt-1 text-gray-500" />
                          <span>
                            {order.pickup.store.address}, {order.pickup.store.city}
                          </span>
                        </p>
                        {order.pickup?.date && order.pickup?.time && (
                          <p className="text-gray-700 flex items-center">
                            <CalendarClock size={14} className="mr-2 text-gray-500" />
                            Retirar: <span className="font-medium ml-1">
                              {new Date(order.pickup.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })} a las {order.pickup.time}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Detalles del pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Detalles del pago</h3>

          <div className="flex items-center p-4 border border-gray-100 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              {order.paymentMethod === 'mercado_pago' ? (
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  {/* Logo de MercadoPago */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.8534 5.2644H4.14658C2.96818 5.2644 2 6.21963 2 7.38225V16.618C2 17.7806 2.96818 18.7359 4.14658 18.7359H19.8534C21.0318 18.7359 22 17.7806 22 16.618V7.38225C22 6.21963 21.0318 5.2644 19.8534 5.2644Z" fill="#2D3277"/>
                    <path d="M14.6962 11.9998C14.6962 13.9661 13.0193 15.5628 10.9522 15.5628C8.88643 15.5628 7.20825 13.9661 7.20825 11.9998C7.20825 10.0336 8.88643 8.43689 10.9522 8.43689C13.0193 8.43689 14.6962 10.0336 14.6962 11.9998Z" fill="#449EE8"/>
                    <path d="M16.792 8.43689C16.792 9.78356 15.6699 10.8747 14.3233 10.8747C12.9754 10.8747 11.8533 9.78356 11.8533 8.43689C11.8533 7.09022 12.9754 5.99911 14.3233 5.99911C15.6699 5.99911 16.792 7.09022 16.792 8.43689Z" fill="#40D38D"/>
                    <path d="M19.8534 11.9998C19.8534 13.3452 18.7313 14.4376 17.3833 14.4376C16.037 14.4376 14.9149 13.3452 14.9149 11.9998C14.9149 10.6545 16.037 9.56165 17.3833 9.56165C18.7313 9.56165 19.8534 10.6545 19.8534 11.9998Z" fill="#FFDB5E"/>
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Banknote size={24} className="text-green-500" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {order.paymentMethod === 'mercado_pago' ? 'MercadoPago' : 'Efectivo'}
              </p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
                {order.paymentStatus === 'paid' && (
                  <span className="text-xs text-gray-500 ml-2">•  Transacción #{(Math.random() * 1000000).toFixed(0)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(order.total - (order.shipping || 0))}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuestos</span>
                <span className="font-medium">{formatPrice(order.tax || 0)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {order.deliveryMethod === 'delivery' ? 'Costo de envío' : 'Retiro en tienda'}
                </span>
                <span className={`font-medium ${order.deliveryMethod === 'pickup' ? 'text-green-600' : ''}`}>
                  {order.deliveryMethod === 'delivery'
                    ? formatPrice(order.shipping || 0)
                    : 'Gratis'
                  }
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-200 font-bold mt-2">
                <span>Total</span>
                <span className="text-lg text-green-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Productos del pedido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Productos</h3>

          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="flex items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden mr-4 flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src="/api/placeholder/64/64"  // Placeholder para el ejemplo
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
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
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Cantidad: {item.quantity}
                        </span>
                      </div>

                      {/* Opciones seleccionadas */}
                      {item.selected_options && item.selected_options.length > 0 && (
                        <div className="mt-2">
                          {item.selected_options.map((option: any, optIdx: number) =>
                            option.selected_items.length > 0 && (
                              <div key={optIdx} className="text-xs text-gray-500 flex items-center mt-0.5">
                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-1"></span>
                                <span>{option.option_name}: {option.selected_items.map((i: any) => i.item_name).join(', ')}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Información del cliente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Información del cliente</h3>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
            <div className="flex">
              <span className="text-gray-500 w-24">Nombre:</span>
              <span className="font-medium flex-1">{order.customer?.name}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-24">Email:</span>
              <span className="font-medium flex-1">{order.customer?.email}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-24">Teléfono:</span>
              <span className="font-medium flex-1">{order.customer?.phone}</span>
            </div>
          </div>
        </motion.div>

        {/* Mensaje de seguridad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center p-4 bg-blue-50 rounded-xl text-blue-700 text-sm mb-6"
        >
          <ShieldCheck size={20} className="text-blue-500 mr-3 flex-shrink-0" />
          <p>Nos preocupamos por tu privacidad y seguridad. Nunca compartiremos tus datos con terceros.</p>
        </motion.div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/')}
            className="py-3 px-6 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex-1 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Volver a la tienda
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              // Acción para seguir el pedido o ver detalles
              // router.push(`/orders/${order.id}`);
              alert('Redirección a seguimiento de pedido')
            }}
            className="py-3 px-6 border border-green-500 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors flex-1 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Seguir pedido
          </motion.button>
        </div>

        {/* Ayuda y soporte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-4 rounded-xl text-center mb-10 border border-gray-100"
        >
          <p className="text-gray-600">
            ¿Necesitas ayuda con tu pedido? Contáctanos al <span className="font-semibold">+56 9 1234 5678</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;