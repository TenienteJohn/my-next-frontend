// src/services/whatsappService.js

/**
 * Servicio para generar mensajes y enlaces de WhatsApp con formato mejorado
 * Versión actualizada para incluir detalles de precios y opciones adicionales
 */
const whatsappService = {
  /**
   * Genera un enlace de WhatsApp con mensaje pre-formateado
   * @param {string} phoneNumber - Número de teléfono de WhatsApp
   * @param {object} orderData - Datos completos del pedido
   * @returns {string} - URL para abrir WhatsApp con mensaje pre-cargado
   */
  generateWhatsAppLink(phoneNumber, orderData) {
    try {
      if (!phoneNumber) return '';

      // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Generar mensaje formateado
      const message = this.createDetailedOrderMessage(orderData);

      // Codificar para URL
      const encodedMessage = encodeURIComponent(message);

      // Crear el enlace completo
      return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    } catch (error) {
      console.error('Error generando enlace de WhatsApp:', error);
      return '';
    }
  },

  /**
   * Formatea un número de teléfono para WhatsApp
   * @param {string} phoneNumber - Número a formatear
   * @returns {string} - Número formateado
   */
  formatPhoneNumber(phoneNumber) {
    // Eliminar todos los caracteres no numéricos
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Asegurarse que tiene código de país
    if (!cleaned.startsWith('54')) {
      cleaned = '54' + cleaned;
    }

    // Si no tiene el 9 después del código de país, añadirlo
    if (cleaned.startsWith('54') && cleaned.charAt(2) !== '9') {
      cleaned = '549' + cleaned.substring(2);
    }

    return cleaned;
  },

  /**
   * Formatea un precio en pesos argentinos
   * @param {number} price - Precio a formatear
   * @returns {string} - Precio formateado
   */
  formatPrice(price) {
    // Asegurar que sea un número
    const numericPrice = Number(price);
    return numericPrice.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('ARS', '$');
  },

  /**
   * Crea un mensaje detallado del pedido con emojis y formato mejorado
   * @param {object} orderData - Datos completos del pedido
   * @returns {string} - Mensaje formateado
   */
  createDetailedOrderMessage(orderData) {
    try {
      const { customer, deliveryMethod, items, total, shipping, deliveryAddress, pickup, paymentMethod } = orderData;

      // Crear el encabezado
      let message = `🛒 *NUEVO PEDIDO* 🛒\n\n`;

      // Información del cliente
      message += `👤 *DATOS DEL CLIENTE*\n`;
      message += `▪️ Nombre: ${customer.name}\n`;
      message += `▪️ Teléfono: ${customer.phone}\n`;
      if (customer.email) {
        message += `▪️ Email: ${customer.email}\n`;
      }
      message += `\n`;

      // Método de entrega
      if (deliveryMethod === 'delivery') {
        message += `🚚 *ENVÍO A DOMICILIO*\n`;
        message += `▪️ Dirección: ${deliveryAddress.street} ${deliveryAddress.number}`;
        if (deliveryAddress.apartment) {
          message += `, ${deliveryAddress.apartment}`;
        }
        message += `\n`;

        if (deliveryAddress.neighborhood) {
          message += `▪️ Barrio: ${deliveryAddress.neighborhood}\n`;
        }

        if (deliveryAddress.city) {
          message += `▪️ Localidad: ${deliveryAddress.city}\n`;
        }

        if (deliveryAddress.reference) {
          message += `▪️ Referencias: ${deliveryAddress.reference}\n`;
        }
      } else { // pickup
        message += `🏬 *RETIRO EN TIENDA*\n`;
        if (pickup && pickup.date) {
          const date = new Date(pickup.date);
          const formattedDate = date.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });
          message += `▪️ Fecha: ${formattedDate}\n`;
        }

        if (pickup && pickup.time) {
          message += `▪️ Hora: ${pickup.time} hs\n`;
        }
      }
      message += `\n`;

      // Detalle del pedido
      message += `📋 *DETALLE DEL PEDIDO*\n`;

      // Crear tabla de productos
      items.forEach((item, index) => {
        const itemPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const subtotal = itemPrice * quantity;

        // Información básica del producto
        message += `${index + 1}. *${item.name}* x${quantity} - ${this.formatPrice(itemPrice)}\n`;

        // Si tiene opciones adicionales, mostrarlas
        if (item.selected_options && item.selected_options.length > 0) {
          item.selected_options.forEach(option => {
            if (option.selected_items && option.selected_items.length > 0) {
              message += `   ┗ *${option.option_name}*: `;

              // Detallar cada ítem adicional con su precio
              const optionItems = option.selected_items.map(selectedItem => {
                const priceAddition = Number(selectedItem.price_addition) || 0;
                if (priceAddition > 0) {
                  return `${selectedItem.item_name} (+${this.formatPrice(priceAddition)})`;
                } else {
                  return selectedItem.item_name;
                }
              });

              message += optionItems.join(', ') + '\n';
            }
          });
        }

        // Subtotal por producto con opciones
        let itemTotalWithOptions = subtotal;
        if (item.selected_options) {
          item.selected_options.forEach(option => {
            option.selected_items.forEach(selectedItem => {
              const priceAddition = Number(selectedItem.price_addition) || 0;
              itemTotalWithOptions += priceAddition * quantity;
            });
          });
        }

        // Si el precio con opciones es diferente al precio base, mostrarlo
        if (itemTotalWithOptions !== subtotal) {
          message += `   ┗ Subtotal c/opciones: ${this.formatPrice(itemTotalWithOptions)}\n`;
        }
        message += `\n`;
      });

      // Resumen de costos
      message += `💰 *RESUMEN*\n`;
      message += `▪️ Subtotal: ${this.formatPrice(total - shipping)}\n`;

      if (deliveryMethod === 'delivery' && shipping > 0) {
        message += `▪️ Costo de envío: ${this.formatPrice(shipping)}\n`;
      }

      message += `▪️ *TOTAL A PAGAR: ${this.formatPrice(total)}*\n\n`;

      // Método de pago
      message += `💳 *MÉTODO DE PAGO*\n`;
      switch (paymentMethod) {
        case 'mercado_pago':
          message += `▪️ MercadoPago\n`;
          break;
        case 'cash':
          message += `▪️ Efectivo\n`;
          break;
        default:
          message += `▪️ ${paymentMethod}\n`;
      }

      // Mensaje de cierre
      message += `\n✨ ¡Gracias por tu pedido! ✨\n`;
      message += `Confirmanos por favor que recibiste este mensaje.`;

      return message;
    } catch (error) {
      console.error('Error creando mensaje de WhatsApp:', error);
      return '¡Hola! Quiero hacer un pedido, pero hubo un error al generar el detalle. Por favor, contáctame para coordinar.';
    }
  }
};

export default whatsappService;