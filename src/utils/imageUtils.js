import { API_CONFIG } from '../config/api.js';

/**
 * Construye la URL completa para una imagen desde el backend
 * @param {string} imagePath - La ruta de la imagen devuelta por el backend (ej: "/images/units/u1.jpg")
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Si es una ruta del backend, construir la URL completa
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // Si no tiene barra inicial, agregarla
  return `${API_CONFIG.BASE_URL}/${imagePath}`;
};

/**
 * Construye la URL de imagen con fallback a imagen local si hay error
 * @param {string} imagePath - La ruta de la imagen del backend
 * @param {string} fallbackPath - Imagen local de fallback (opcional)
 * @returns {string} URL de la imagen
 */
export const getImageUrlWithFallback = (imagePath, fallbackPath = '/images/placeholder.jpg') => {
  try {
    return getImageUrl(imagePath);
  } catch (error) {
    console.warn('Error loading image from backend, using fallback:', error);
    return fallbackPath;
  }
}; 