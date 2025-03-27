// src/components/PurchaseFlowIntegration.tsx
'use client';
import { useState, useEffect } from 'react';
import { CartModule, CartView, CartButton } from './cart/CartModule';
import { CheckoutPage } from './checkout/CheckoutPage';
import { OrderConfirmation } from './checkout/OrderConfirmation';

// Interfaces para productos y opciones
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

export const PurchaseFlowIntegration = () => {
  // Estados para el flujo de compra
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'products' | 'checkout' | 'confirmation'>('products');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Calcular total y cantidad del carrito
  const cartTotal = cartItems.reduce((sum, item) => {
    let itemPrice = item.price * item.quantity;

    if (item.selected_options) {
      item.selected_options.forEach(option => {
        option.selected_items.forEach(selectedItem => {
          itemPrice += selectedItem.price_addition * item.quantity;
        });
      });
    }

    return sum + itemPrice;
  }, 0);

  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Handlers para el carrito
  const handleAddToCart = (product: Product, quantity: number, selectedOptions?: SelectedOption[]) => {
    // Buscar si el producto ya existe con las mismas opciones
    const existingItemIndex = cartItems.findIndex(item => {
      if (item.id !== product.id) return false;

      // Comparar opciones seleccionadas
      if (!selectedOptions || selectedOptions.length === 0) {
        return !item.selected_options || item.selected_options.length === 0;
      }

      if (!item.selected_options || item.selected_options.length !== selectedOptions.length) {
        return false;
      }

      // Verificar que cada opción y sus items seleccionados sean iguales
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
      // Si el producto ya existe, actualizar la cantidad
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedItems);
    } else {
      // Si es un producto nuevo, agregarlo al carrito
      setCartItems([...cartItems, {
        ...product,
        quantity,
        selected_options: selectedOptions || []
      }]);
    }

    // Cerrar el modal de detalles y mostrar un mensaje
    setIsProductDetailOpen(false);
    setTimeout(() => {
      setIsCartOpen(true);
    }, 300); // Pequeño delay para mejor UX
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Cambiar a la vista de checkout
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
  };

  // Volver a la vista del carrito
  const handleBackToCart = () => {
    setCurrentView('products');
    setTimeout(() => {
      setIsCartOpen(true);
    }, 100);
  };

  // Manejar la finalización de la compra
  const handleCompletePurchase = (orderData: any) => {
    setCompletedOrder(orderData);
    setCurrentView('confirmation');
    setCartItems([]);
  };

  // Volver a la tienda desde la confirmación
  const handleBackToShop = () => {
    setCurrentView('products');
    setCompletedOrder(null);
  };

  // Renderizar el componente apropiado según la vista actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'checkout':
        return (
          <CheckoutPage
            items={cartItems}
            deliveryMethod={deliveryMethod}
            onGoBack={handleBackToCart}
            onCompletePurchase={handleCompletePurchase}
          />
        );
      case 'confirmation':
        return (
          <OrderConfirmation
            orderData={completedOrder}
            onGoBack={handleBackToShop}
          />
        );
      default:
        return (
          <>
            {/* Aquí iría la interfaz principal de la tienda/catálogo */}
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-6">Ejemplo de integración del flujo de compra</h1>

              {/* Selector de método de entrega (ejemplo) */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h2 className="font-bold mb-3">Método de entrega preferido</h2>
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      deliveryMethod === 'delivery'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    Domicilio
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      deliveryMethod === 'pickup'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    Recoger en tienda
                  </button>
                </div>
              </div>

              {/* Productos de ejemplo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Producto 1 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Producto Ejemplo 1</h3>
                  <p className="text-gray-600 mb-3">$15.000</p>
                  <button
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => {
                      setSelectedProduct({
                        id: 1,
                        name: 'Producto Ejemplo 1',
                        description: 'Descripción del producto ejemplo 1',
                        price: 15000,
                        quantity: 1
                      });
                      setIsProductDetailOpen(true);
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>

                {/* Producto 2 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Producto Ejemplo 2</h3>
                  <p className="text-gray-600 mb-3">$22.500</p>
                  <button
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => {
                      setSelectedProduct({
                        id: 2,
                        name: 'Producto Ejemplo 2',
                        description: 'Descripción del producto ejemplo 2',
                        price: 22500,
                        quantity: 1
                      });
                      setIsProductDetailOpen(true);
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>

                {/* Producto 3 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Producto Ejemplo 3</h3>
                  <p className="text-gray-600 mb-3">$18.900</p>
                  <button
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => {
                      setSelectedProduct({
                        id: 3,
                        name: 'Producto Ejemplo 3',
                        description: 'Descripción del producto ejemplo 3',
                        price: 18900,
                        quantity: 1
                      });
                      setIsProductDetailOpen(true);
                    }}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>

            {/* Modal de detalles del producto */}
            {selectedProduct && (
              <CartModule
                isOpen={isProductDetailOpen}
                onClose={() => setIsProductDetailOpen(false)}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* Vista del carrito */}
            <CartView
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleProceedToCheckout}
            />

            {/* Botón flotante del carrito */}
            {cartItems.length > 0 && !isCartOpen && (
              <CartButton
                itemCount={cartItemCount}
                totalAmount={cartTotal}
                onClick={() => setIsCartOpen(true)}
              />
            )}
          </>
        );
    }
  };

  return renderCurrentView();
};

export default PurchaseFlowIntegration;