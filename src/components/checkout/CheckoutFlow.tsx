// src/components/checkout/CheckoutFlow.tsx
'use client';
import { useState, useEffect } from 'react';
import { CartView } from '../cart/CartView';
import { CheckoutPage } from './CheckoutPage';
import { useRouter } from 'next/navigation';

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

interface CheckoutFlowProps {
  // Propiedades opcionales que podrían pasar desde la página principal
  initialDeliveryMethod?: 'delivery' | 'pickup';
  onOrderComplete?: (orderData: any) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  initialDeliveryMethod = 'delivery',
  onOrderComplete,
}) => {
  const router = useRouter();

  // Estados
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>(initialDeliveryMethod);

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

  // Calcular el total del carrito
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
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

    // Mostrar notificación o feedback al usuario
    // ...

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
  const handleCompletePurchase = (orderData: any) => {
    // Aquí procesaríamos la orden, enviaríamos a la API, etc.
    console.log('Orden completada:', orderData);

    // Limpiar el carrito
    setCartItems([]);

    // Cerrar el checkout
    setIsCheckoutOpen(false);

    // Si hay callback de orden completada, llamarlo
    if (onOrderComplete) {
      onOrderComplete(orderData);
    }

    // Redireccionar a confirmación o mostrar mensaje
    // router.push('/order-success');

    // O mostrar un mensaje temporal y volver a la página principal
    alert('¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.');
  };

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
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
              }).format(calculateCartTotal())}
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default CheckoutFlow;