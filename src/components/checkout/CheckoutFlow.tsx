// src/components/checkout/CheckoutFlow.tsx
'use client';
import { useState, useEffect } from 'react';
import { CartView } from '../cart/CartView';
import { CheckoutPage } from './CheckoutPage';
import { OrderConfirmation } from './OrderConfirmation';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Interfaces
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
  quantity: number;
}

// Interfaz para los datos del comercio
interface CommerceData {
  id: number;
  subdomain: string;
  business_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  owner_name?: string;
  business_category?: string;
  banner_url?: string;
  is_open: boolean;
  delivery_time?: string;
  delivery_fee?: number;
  min_order_value?: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  contact_phone?: string;
  contact_email?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_whatsapp?: string;
  working_hours?: string;
}

interface CheckoutFlowProps {
  // Propiedades opcionales que podrían pasar desde la página principal
  initialDeliveryMethod?: 'delivery' | 'pickup';
  onOrderComplete?: (orderData: any) => void;
  commerceData?: CommerceData; // Permitir recibir datos del comercio como prop
  subdominio?: string; // Para obtener los datos del comercio específico
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  initialDeliveryMethod = 'delivery',
  onOrderComplete,
  commerceData: initialCommerceData,
  subdominio,
}) => {
  const router = useRouter();

  // Estados
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>(initialDeliveryMethod);
  const [commerceData, setCommerceData] = useState<CommerceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar datos del comercio
  useEffect(() => {
    // Si recibimos los datos como prop, los utilizamos
    if (initialCommerceData) {
      setCommerceData(initialCommerceData);
    } else {
      // De lo contrario, los obtenemos de la API
      const fetchCommerceData = async () => {
        setIsLoading(true);
        try {
          // Determinamos la URL base para la API
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tu-api-url.com';

          let response;

          // Si tenemos un subdominio específico, lo usamos para obtener los datos
          if (subdominio) {
            response = await axios.get(`${apiBaseUrl}/api/public/${subdominio}`);
            // La API devuelve commerce y categories, pero solo necesitamos commerce
            setCommerceData(response.data.commerce);
          } else {
            // Si no hay subdominio, intentamos obtener los datos con el endpoint my-commerce
            // (requiere estar autenticado)
            const token = localStorage.getItem('token');
            if (token) {
              response = await axios.get(`${apiBaseUrl}/api/commerces/my-commerce`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              setCommerceData(response.data);
            } else {
              throw new Error('No hay token de autenticación');
            }
          }
        } catch (error) {
          console.error('Error al obtener los datos del comercio:', error);
          setErrorMessage('No se pudieron cargar los datos del comercio');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCommerceData();
    }
  }, [initialCommerceData, subdominio]);

  // Cargar items del carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, []);

  // Guardar cambios del carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calcular el total del carrito incluyendo costos de envío si aplica
  const calculateCartTotal = () => {
    const itemsTotal = cartItems.reduce((total, item) => {
      let itemPrice = item.price * item.quantity;

      if (item.selected_options) {
        item.selected_options.forEach(option => {
          option.selected_items.forEach(selectedItem => {
            itemPrice += selectedItem.price_addition * item.quantity;
          });
        });
      }

      return total + itemPrice;
    }, 0);

    // Incluir el costo de envío si aplica
    if (deliveryMethod === 'delivery' && commerceData?.delivery_fee) {
      return itemsTotal + commerceData.delivery_fee;
    }

    return itemsTotal;
  };

  // Handlers para el carrito
  const handleAddToCart = (product: Product, quantity: number, selectedOptions?: SelectedOption[]) => {
    // Buscar si ya existe el producto con las mismas opciones
    const existingItemIndex = cartItems.findIndex(item => {
      // Verificar si es el mismo producto
      if (item.id !== product.id) return false;

      // Si no hay opciones seleccionadas, es el mismo producto base
      if (!selectedOptions || selectedOptions.length === 0) {
        return !item.selected_options || item.selected_options.length === 0;
      }

      // Si tienen número diferente de opciones, no son iguales
      if (!item.selected_options ||
          item.selected_options.length !== selectedOptions.length) {
        return false;
      }

      // Verificar que todas las opciones seleccionadas sean iguales
      return selectedOptions.every(option => {
        const itemOption = item.selected_options?.find(opt => opt.option_id === option.option_id);
        if (!itemOption || itemOption.selected_items.length !== option.selected_items.length) {
          return false;
        }

        return option.selected_items.every(selectedItem =>
          itemOption.selected_items.some(itemSelectedItem =>
            itemSelectedItem.item_id === selectedItem.item_id
          )
        );
      });
    });

    if (existingItemIndex >= 0) {
      // Si el producto ya existe, actualizar cantidad
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedItems);
    } else {
      // Si es un producto nuevo, agregarlo al carrito
      setCartItems([...cartItems, { ...product, quantity, selected_options: selectedOptions }]);
    }

    // Abrir el carrito
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems(
      cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Handler para iniciar proceso de checkout
  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Handler para volver al carrito desde checkout
  const handleGoBackToCart = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(true);
  };

  // Handler para completar la compra
  const handleCompletePurchase = async (orderData: any) => {
    try {
      // Opcionalmente, enviar la orden al backend si tienes un endpoint para ello
      // const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tu-api-url.com';
      // const response = await axios.post(`${apiBaseUrl}/api/orders`, orderData);

      // Guardar la respuesta para mostrarla en la confirmación
      setOrderCompleted(orderData);

      // Limpiar el carrito
      setCartItems([]);
      localStorage.removeItem('cart');

      // Cerrar el checkout
      setIsCheckoutOpen(false);

      // Si hay callback de orden completada, llamarlo
      if (onOrderComplete) {
        onOrderComplete(orderData);
      }
    } catch (error) {
      console.error('Error al procesar la orden:', error);
      setErrorMessage('Error al procesar tu pedido. Por favor intenta nuevamente.');
    }
  };

  // Renderizar el componente correspondiente según el estado actual
  if (orderCompleted) {
    return <OrderConfirmation orderData={orderCompleted} onGoBack={() => setOrderCompleted(null)} />;
  }

  // Renderizar el flujo de checkout
  return (
    <>
      {/* Vista del carrito */}
      <CartView
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Vista de checkout */}
      {isCheckoutOpen && (
        <CheckoutPage
          items={cartItems}
          deliveryMethod={deliveryMethod}
          onGoBack={handleGoBackToCart}
          onCompletePurchase={handleCompletePurchase}
          commerceData={commerceData} // Pasar los datos del comercio
        />
      )}

      {/* Botón flotante del carrito (solo visible si hay items) */}
      {cartItems.length > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-full shadow-lg flex justify-between items-center"
          >
            <div className="bg-white text-green-500 rounded-full w-7 h-7 flex items-center justify-center font-bold">
              {cartItems.reduce((count, item) => count + item.quantity, 0)}
            </div>
            <span className="font-bold">Ver carrito</span>
            <span className="font-bold">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0
              }).format(calculateCartTotal())}
            </span>
          </button>
        </div>
      )}

      {/* Mensaje de error si ocurre algún problema */}
      {errorMessage && (
        <div className="fixed top-5 left-0 right-0 z-50 mx-auto w-11/12 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage(null)}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default CheckoutFlow;