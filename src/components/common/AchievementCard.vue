<template>
  <div class="achievement-card" :style="{ backgroundColor: bgColor }">
    <img 
      :src="getImageUrl(image)" 
      :alt="title" 
      class="achievement-image-full"
      @error="onImageError"
      @load="onImageLoad"
    >
  </div>
</template>

<script setup>
import { API_CONFIG } from '@/config/api'

const props = defineProps({
  title: String,
  image: String,
  bgColor: { // Para permitir diferentes colores de fondo
    type: String,
    default: '#FCE9BF' // Default color from profile.html
  }
});

const getImageUrl = (imagePath) => {
  console.log('🖼️ ACHIEVEMENT - Image path recibido:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ ACHIEVEMENT - No hay imagen, usando default');
    return '/images/achievement-default.png';
  }
  
  // Si la URL ya es completa (empieza con http), la usamos tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🖼️ ACHIEVEMENT - URL completa:', imagePath);
    return imagePath;
  }
  
  // Si es una ruta relativa, la construimos con la URL base del backend
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_CONFIG.BASE_URL}${imagePath}`;
    console.log('🖼️ ACHIEVEMENT - URL construida:', fullUrl);
    return fullUrl;
  }
  
  // Si no tiene formato reconocido, usar imagen por defecto
  console.log('🖼️ ACHIEVEMENT - Formato no reconocido, usando default');
  return '/images/achievement-default.png';
};

const onImageError = (event) => {
  console.error('🖼️ ACHIEVEMENT - Error cargando imagen:', event.target.src);
  console.error('🖼️ ACHIEVEMENT - Usando imagen de fallback');
  event.target.src = '/images/achievement-default.png';
};

const onImageLoad = (event) => {
  console.log('🖼️ ACHIEVEMENT - Imagen cargada correctamente:', event.target.src);
};
</script>

<style scoped>
.achievement-card {
  border-radius: 16px;
  min-width: 140px;
  height: 140px; /* Altura fija para hacer cuadrados */
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow: hidden; /* Para que la imagen no se salga del border-radius */
  position: relative;
}

.achievement-image-full {
  width: 100%;
  height: 100%;
  object-fit: cover; /* La imagen cubre todo el espacio manteniendo proporción */
  border-radius: inherit; /* Hereda el border-radius del contenedor */
}

@media (max-width: 360px) {
  .achievement-card { 
    min-width: 120px; 
    height: 120px;
  }
}
</style> 