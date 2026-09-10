import { STORE_CONFIG } from '../data/mockData';
import { formatPrice } from './formatPrice';

/**
 * Returns the configured WhatsApp number from environment variables or store config.
 */
export const getWhatsAppNumber = (overrideNumber = null) => {
  return (
    overrideNumber ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    STORE_CONFIG.whatsappNumber ||
    '919876543210'
  ).replace(/[^0-9]/g, '');
};

/**
 * Returns the configured WhatsApp base URL from environment variables or defaults to wa.me.
 */
export const getWhatsAppBaseUrl = (overrideNumber = null) => {
  const number = getWhatsAppNumber(overrideNumber);
  const envLink = process.env.NEXT_PUBLIC_WHATSAPP_LINK;
  
  if (envLink && envLink.trim()) {
    // If env link already contains query params or protocol, ensure valid base
    const cleanLink = envLink.trim().replace(/\/$/, '');
    if (cleanLink.includes('wa.me') || cleanLink.includes('whatsapp.com')) {
      return cleanLink;
    }
  }

  return `https://wa.me/${number}`;
};

/**
 * Builds a direct WhatsApp chat URL with prefilled text message.
 */
export const buildWhatsAppUrl = (text, overrideNumber = null) => {
  const baseUrl = getWhatsAppBaseUrl(overrideNumber);
  const delimiter = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${delimiter}text=${encodeURIComponent(text)}`;
};

export const createProductWhatsAppUrl = (product, selectedVariant = null, selectedColor = null, overrideNumber = null) => {
  const storeName = STORE_CONFIG.name || 'Nakoda Imitation';
  const currency = STORE_CONFIG.currency || '₹';
  
  let text = `Hi ${storeName}! 👋\n\nI am interested in buying *${product.name}* from your online catalog.\n`;
  text += `• *Price:* ${formatPrice(product.price, currency)}\n`;
  
  if (selectedVariant) {
    text += `• *Selected Size/Variant:* ${selectedVariant}\n`;
  }
  if (selectedColor) {
    text += `• *Selected Color:* ${selectedColor}\n`;
  }
  
  text += `\nCould you please let me know if this is currently available in the shop? Thank you!`;
  
  return buildWhatsAppUrl(text, overrideNumber);
};

export const createCartWhatsAppUrl = (cartItems, totalAmount, overrideNumber = null) => {
  const storeName = STORE_CONFIG.name || 'Nakoda Imitation';
  const currency = STORE_CONFIG.currency || '₹';

  let text = `🛍️ *NEW ORDER INQUIRY — ${storeName}*\n\n`;
  text += `Hi, I would like to place an order for the following items:\n\n`;

  cartItems.forEach((item, index) => {
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);
    const itemSize = item.selectedSize || (item.sizes && item.sizes[0]) || (item.variants && item.variants[0]) || item.selectedVariant || '';
    text += `${index + 1}. *${item.name}*\n`;
    text += `   Quantity: ${item.quantity}\n`;
    if (itemSize) text += `   Size: ${itemSize}\n`;
    if (item.selectedColor) text += `   Color: ${item.selectedColor}\n`;
    text += `   Price: ${formatPrice(item.price, currency)} × ${item.quantity} = ${formatPrice(itemTotal, currency)}\n\n`;
  });

  text += `────────────────────\n`;
  text += `*💰 TOTAL ORDER VALUE: ${formatPrice(totalAmount, currency)}*\n\n`;
  text += `Please let me know the payment and delivery/pickup options. Thank you!`;

  return buildWhatsAppUrl(text, overrideNumber);
};

export const createHelpWhatsAppUrl = (customMsg = null, overrideNumber = null) => {
  const storeName = STORE_CONFIG.name || 'Nakoda Imitation';
  const text = customMsg || `Hi ${storeName}! I need some assistance with the products in your online catalog.`;
  return buildWhatsAppUrl(text, overrideNumber);
};

export const createInquiryWhatsAppUrl = ({
  inquiryType = 'Product Inquiry',
  productName = '',
  quantity = '1',
  targetBudget = '',
  requiredDate = '',
  customerName = '',
  notes = '',
}, overrideNumber = null) => {
  const storeName = STORE_CONFIG.name || 'Nakoda Imitation';
  let text = `✨ *NEW INQUIRY — ${storeName}*\n\n`;
  text += `Hi, I would like to inquire about the following:\n\n`;
  text += `• *Inquiry Type:* ${inquiryType}\n`;
  if (productName) text += `• *Product/Item:* ${productName}\n`;
  if (quantity) text += `• *Estimated Quantity:* ${quantity}\n`;
  if (targetBudget) text += `• *Target Budget:* ${targetBudget}\n`;
  if (requiredDate) text += `• *Required By:* ${requiredDate}\n`;
  if (customerName) text += `• *From:* ${customerName}\n`;
  if (notes) text += `\n*Details / Requirements:*\n${notes}\n`;
  text += `\nPlease let me know pricing, availability, and lead time. Thank you!`;

  return buildWhatsAppUrl(text, overrideNumber);
};

export const createContactWhatsAppUrl = ({
  name = '',
  category = 'General Support',
  subject = '',
  message = '',
}, overrideNumber = null) => {
  const storeName = STORE_CONFIG.name || 'Nakoda Imitation';
  let text = `💬 *CONTACT MESSAGE — ${storeName}*\n\n`;
  if (name) text += `• *From:* ${name}\n`;
  text += `• *Topic:* ${category}\n`;
  if (subject) text += `• *Subject:* ${subject}\n`;
  if (message) text += `\n*Message:*\n${message}\n`;
  text += `\nLooking forward to hearing from you. Thanks!`;

  return buildWhatsAppUrl(text, overrideNumber);
};
