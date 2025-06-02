import { API_CONFIG } from '@/config/api.js';

/**
 * Convierte una ruta de imagen relativa en una URL completa del backend
 * @param {string} imagePath - Ruta relativa de la imagen (ej: '/images/u1h1.jpg')
 * @returns {string} URL completa de la imagen
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🖼️ Image URL (already complete):', imagePath);
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa
  let fullUrl;
  if (imagePath.startsWith('/')) {
    fullUrl = `${API_CONFIG.BASE_URL}${imagePath}`;
  } else {
    // Si no empieza con /, agregar el slash
    fullUrl = `${API_CONFIG.BASE_URL}/${imagePath}`;
  }
  
  console.log('🖼️ Image URL constructed:', { original: imagePath, constructed: fullUrl });
  return fullUrl;
}

/**
 * Procesa un objeto con propiedades de imagen, convirtiendo rutas relativas a URLs completas
 * @param {Object} data - Objeto que puede contener propiedades 'image'
 * @returns {Object} Objeto con URLs de imagen procesadas
 */
export function processImageUrls(data) {
  if (!data || typeof data !== 'object') return data;
  
  // Crear una copia del objeto
  const processed = { ...data };
  
  // Procesar la propiedad 'image' si existe
  if (processed.image) {
    processed.image = getImageUrl(processed.image);
  }
  
  // Procesar arrays que pueden contener objetos con imágenes
  if (Array.isArray(processed.options)) {
    processed.options = processed.options.map(option => ({
      ...option,
      image: option.image ? getImageUrl(option.image) : option.image
    }));
  }
  
  if (Array.isArray(processed.items)) {
    processed.items = processed.items.map(item => ({
      ...item,
      image: item.image ? getImageUrl(item.image) : item.image
    }));
  }
  
  if (Array.isArray(processed.categories)) {
    processed.categories = processed.categories.map(category => ({
      ...category,
      image: category.image ? getImageUrl(category.image) : category.image
    }));
  }
  
  return processed;
}

/**
 * Construye la URL de imagen con fallback a imagen local si hay error
 * @param {string} imagePath - La ruta de la imagen del backend
 * @param {string} fallbackPath - Imagen local de fallback (opcional)
 * @returns {string} URL de la imagen
 */
export const getImageUrlWithFallback = async (imagePath, fallbackPath = '/images/placeholder.jpg') => {
  try {
    const backendSrc = getImageUrl(imagePath);
    const response = await fetch(backendSrc);
    if (response.ok) {
      return backendSrc;
    }
  } catch (error) {
    // En caso de error, usar fallback
  }
  return fallbackPath;
}; 