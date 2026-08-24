import { STORE_CONFIG } from '../data/mockData';

export const createProductWhatsAppUrl = (product, selectedVariant = null, selectedColor = null) => {
  const number = STORE_CONFIG.whatsappNumber;
  let text = `Hi ${STORE_CONFIG.name}! 👋\n\nI am interested in buying *${product.name}* from your online catalog.\n`;
  text += `• *Price:* ${STORE_CONFIG.currency}${product.price.toLocaleString()}\n`;
  
  if (selectedVariant) {
    text += `• *Selected Size/Variant:* ${selectedVariant}\n`;
  }
  if (selectedColor) {
    text += `• *Selected Color:* ${selectedColor}\n`;
  }
  
  text += `\nCould you please let me know if this is currently available in the shop? Thank you!`;
  
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

export const createCartWhatsAppUrl = (cartItems, totalAmount) => {
  const number = STORE_CONFIG.whatsappNumber;
  let text = `🛍️ *NEW ORDER INQUIRY — ${STORE_CONFIG.name}*\n\n`;
  text += `Hi, I would like to place an order for the following items:\n\n`;

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    text += `${index + 1}. *${item.name}*\n`;
    text += `   Quantity: ${item.quantity}\n`;
    if (item.selectedSize) text += `   Size: ${item.selectedSize}\n`;
    if (item.selectedColor) text += `   Color: ${item.selectedColor}\n`;
    text += `   Price: ${STORE_CONFIG.currency}${item.price.toLocaleString()} × ${item.quantity} = ${STORE_CONFIG.currency}${itemTotal.toLocaleString()}\n\n`;
  });

  text += `────────────────────\n`;
  text += `*💰 TOTAL ORDER VALUE: ${STORE_CONFIG.currency}${totalAmount.toLocaleString()}*\n\n`;
  text += `Please let me know the payment and delivery/pickup options. Thank you!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

export const createHelpWhatsAppUrl = (customMsg = null) => {
  const number = STORE_CONFIG.whatsappNumber;
  const text = customMsg || `Hi ${STORE_CONFIG.name}! I need some assistance with the products in your online catalog.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

export const createInquiryWhatsAppUrl = ({
  inquiryType = 'Product Inquiry',
  productName = '',
  quantity = '1',
  targetBudget = '',
  requiredDate = '',
  customerName = '',
  notes = '',
}) => {
  const number = STORE_CONFIG.whatsappNumber;
  let text = `✨ *NEW INQUIRY — ${STORE_CONFIG.name}*\n\n`;
  text += `Hi, I would like to inquire about the following:\n\n`;
  text += `• *Inquiry Type:* ${inquiryType}\n`;
  if (productName) text += `• *Product/Item:* ${productName}\n`;
  if (quantity) text += `• *Estimated Quantity:* ${quantity}\n`;
  if (targetBudget) text += `• *Target Budget:* ${targetBudget}\n`;
  if (requiredDate) text += `• *Required By:* ${requiredDate}\n`;
  if (customerName) text += `• *From:* ${customerName}\n`;
  if (notes) text += `\n*Details / Requirements:*\n${notes}\n`;
  text += `\nPlease let me know pricing, availability, and lead time. Thank you!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

export const createContactWhatsAppUrl = ({
  name = '',
  category = 'General Support',
  subject = '',
  message = '',
}) => {
  const number = STORE_CONFIG.whatsappNumber;
  let text = `💬 *CONTACT MESSAGE — ${STORE_CONFIG.name}*\n\n`;
  if (name) text += `• *From:* ${name}\n`;
  text += `• *Topic:* ${category}\n`;
  if (subject) text += `• *Subject:* ${subject}\n`;
  if (message) text += `\n*Message:*\n${message}\n`;
  text += `\nLooking forward to hearing from you. Thanks!`;

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

