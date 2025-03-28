// src/services/whatsappService.ts

import { Product, SelectedOption, DeliveryAddress } from '@/types';

// Tipos usados en el servicio
interface WhatsAppOrderData {
  customer: {
    name: string;
    phone: string;
  };
  deliveryMethod: 'delivery' | 'pickup';
  items: Product[];
  total: number;
  shipping?: number;
  deliveryAddress?: DeliveryAddress;
  pickup?: {
    date: string;
    time: string;
  };
  paymentMethod: string;
}

/**
 * Formatea un número de teléfono para WhatsApp (Argentina)
 * Elimina caracteres no numéricos y asegura el formato internacional
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Eliminar todos los caracteres no numéricos
  const numericPhone = phone.replace(/\D/g, '');

  // Si ya comienza con "54", asumimos que está en formato internacional
  if (numericPhone.startsWith('54')) {
    return numericPhone;
  }

  // Si comienza con "9", añadimos "54" al principio
  if (numericPhone.startsWith('9')) {
    return `54${numericPhone}`;
  }

  // Si no comienza con "9", asumimos que necesita "549" (formato argentino con 9)
  return `549${numericPhone}`;
};

/**
 * Formatea el precio en formato de moneda argentina
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace('ARS', '$');
};

/**
 * Genera un mensaje detallado para WhatsApp con el pedido completo
 */
export const generateWhatsAppMessage = (orderData: WhatsAppOrderData): string => {
  let message = `*Nuevo pedido*\n\n`;

  // Información del cliente
  message += `*Cliente:* ${orderData.customer.name}\n`;
  message += `*Teléfono:* ${orderData.customer.phone}\n\n`;

  // Tipo de entrega
  message += `*Tipo de entrega:* ${orderData.deliveryMethod === 'delivery' ? '🚚 Entrega a domicilio' : '🏬 Retiro en local'}\n`;

  // Si es entrega a domicilio, incluir dirección
  if (orderData.deliveryMethod === 'delivery' && orderData.deliveryAddress) {
    message += `*Dirección:* ${orderData.deliveryAddress.street} ${orderData.deliveryAddress.number}`;
    if (orderData.deliveryAddress.apartment) message += `, ${orderData.deliveryAddress.apartment}`;
    if (orderData.deliveryAddress.city) message += `, ${orderData.deliveryAddress.city}`;
    message += '\n';
    if (orderData.deliveryAddress.reference) message += `*Referencia:* ${orderData.deliveryAddress.reference}\n`;
  }

  // Si es retiro en tienda, incluir fecha y hora
  if (orderData.deliveryMethod === 'pickup' && orderData.pickup) {
    const dateFormatted = new Date(orderData.pickup.date).toLocaleDateString('es-AR');
    message += `*Fecha de retiro:* ${dateFormatted} a las ${orderData.pickup.time}\n`;
  }

  message += '\n*Productos:*\n';

  // Listar productos
  orderData.items.forEach(item => {
    message += `• ${item.quantity || 1}x ${item.name} - ${formatPrice((item.price || 0) * (item.quantity || 1))}\n`;

    // Incluir opciones seleccionadas
    if (item.selected_options && item.selected_options.length > 0) {
      item.selected_options.forEach(option => {
        if (option.selected_items.length > 0) {
          message += `   ↳ ${option.option_name}: ${option.selected_items.map(i => i.item_name).join(', ')}\n`;
        }
      });
    }
  });

  message += '\n';
  message += `*Subtotal:* ${formatPrice(orderData.total - (orderData.shipping || 0))}\n`;

  // Incluir costo de envío si aplica
  if (orderData.deliveryMethod === 'delivery' && orderData.shipping && orderData.shipping > 0) {
    message += `*Costo de envío:* ${formatPrice(orderData.shipping)}\n`;
  }

  message += `*Total:* ${formatPrice(orderData.total)}\n\n`;

  // Método de pago
  const paymentMethodText = orderData.paymentMethod === 'mercado_pago'
    ? '💳 MercadoPago'
    : '💵 Efectivo';
  message += `*Método de pago:* ${paymentMethodText}\n`;

  return encodeURIComponent(message);
};

/**
 * Genera un enlace completo de WhatsApp para enviar el pedido
 */
export const generateWhatsAppLink = (phoneNumber: string, orderData: WhatsAppOrderData): string => {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
  const message = generateWhatsAppMessage(orderData);

  return `https://wa.me/${formattedPhone}?text=${message}`;
};

export default {
  formatPhoneForWhatsApp,
  formatPrice,
  generateWhatsAppMessage,
  generateWhatsAppLink
};