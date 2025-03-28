// src/services/whatsappService.ts
import { Product, SelectedOption, DeliveryAddress } from '@/types';

// Tipos usados en el servicio
interface WhatsAppOrderData {
  customer: {
    name: string;
    phone: string;
    email?: string;
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
  try {
    if (!phone || typeof phone !== 'string') {
      console.error('Teléfono inválido:', phone);
      return '';
    }

    // Eliminar todos los caracteres no numéricos
    const numericPhone = phone.replace(/\D/g, '');

    if (!numericPhone) {
      console.error('Teléfono sin dígitos numéricos:', phone);
      return '';
    }

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
  } catch (error) {
    console.error('Error formateando teléfono:', error, phone);
    return '';
  }
};

/**
 * Formatea el precio en formato de moneda argentina
 */
export const formatPrice = (price: number): string => {
  try {
    return price.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('ARS', '$');
  } catch (error) {
    console.error('Error formateando precio:', error, price);
    return `$${price}`;
  }
};

/**
 * Genera un mensaje detallado para WhatsApp con el pedido completo
 */
export const generateWhatsAppMessage = (orderData: WhatsAppOrderData): string => {
  try {
    if (!orderData || !orderData.customer || !orderData.items) {
      console.error('Datos de pedido inválidos para mensaje de WhatsApp:', orderData);
      return '';
    }

    let message = `*Nuevo pedido*\n\n`;

    // Información del cliente
    message += `*Cliente:* ${orderData.customer.name || 'No especificado'}\n`;
    message += `*Teléfono:* ${orderData.customer.phone || 'No especificado'}\n`;
    if (orderData.customer.email) {
      message += `*Email:* ${orderData.customer.email}\n`;
    }
    message += '\n';

    // Tipo de entrega
    message += `*Tipo de entrega:* ${orderData.deliveryMethod === 'delivery' ? '🚚 Entrega a domicilio' : '🏬 Retiro en local'}\n`;

    // Si es entrega a domicilio, incluir dirección
    if (orderData.deliveryMethod === 'delivery' && orderData.deliveryAddress) {
      message += `*Dirección:* ${orderData.deliveryAddress.street || ''} ${orderData.deliveryAddress.number || ''}`;
      if (orderData.deliveryAddress.apartment) message += `, ${orderData.deliveryAddress.apartment}`;
      if (orderData.deliveryAddress.city) message += `, ${orderData.deliveryAddress.city}`;
      message += '\n';
      if (orderData.deliveryAddress.reference) message += `*Referencia:* ${orderData.deliveryAddress.reference}\n`;
    }

    // Si es retiro en tienda, incluir fecha y hora
    if (orderData.deliveryMethod === 'pickup' && orderData.pickup) {
      try {
        const dateFormatted = new Date(orderData.pickup.date).toLocaleDateString('es-AR');
        message += `*Fecha de retiro:* ${dateFormatted} a las ${orderData.pickup.time}\n`;
      } catch (dateError) {
        message += `*Fecha de retiro:* ${orderData.pickup.date} a las ${orderData.pickup.time}\n`;
      }
    }

    message += '\n*Productos:*\n';

    // Listar productos
    if (Array.isArray(orderData.items)) {
      orderData.items.forEach(item => {
        if (!item) return;

        const quantity = item.quantity || 1;
        const price = item.price || 0;
        message += `• ${quantity}x ${item.name || 'Producto'} - ${formatPrice(price * quantity)}\n`;

        // Incluir opciones seleccionadas
        if (item.selected_options && item.selected_options.length > 0) {
          item.selected_options.forEach(option => {
            if (!option || !option.selected_items || !option.selected_items.length) return;

            message += `   ↳ ${option.option_name || 'Opción'}: ${option.selected_items.map(i => i?.item_name || 'Item').join(', ')}\n`;
          });
        }
      });
    } else {
      message += `• No hay productos en el pedido\n`;
    }

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
  } catch (error) {
    console.error('Error generando mensaje de WhatsApp:', error);
    // Mensaje mínimo de fallback
    return encodeURIComponent('Nuevo pedido desde la web');
  }
};

/**
 * Genera un enlace completo de WhatsApp para enviar el pedido
 */
export const generateWhatsAppLink = (phoneNumber: string, orderData: WhatsAppOrderData): string => {
  try {
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
      console.error('Número de teléfono inválido para enlace de WhatsApp:', phoneNumber);
      return '';
    }

    // Formatear el número de teléfono
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    if (!formattedPhone) {
      console.error('No se pudo formatear el número de teléfono:', phoneNumber);
      return '';
    }

    // Generar el mensaje
    const message = generateWhatsAppMessage(orderData);
    if (!message) {
      console.error('No se pudo generar el mensaje para WhatsApp');
      return '';
    }

    // Construir y devolver el enlace completo
    return `https://wa.me/${formattedPhone}?text=${message}`;
  } catch (error) {
    console.error('Error generando enlace de WhatsApp:', error);
    return '';
  }
};

export default {
  formatPhoneForWhatsApp,
  formatPrice,
  generateWhatsAppMessage,
  generateWhatsAppLink
};