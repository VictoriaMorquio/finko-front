<template>
  <div class="achievement-card" :style="{ backgroundColor: bgColor }">
    <img 
      v-if="getImageUrl(image)"
      :src="getImageUrl(image)" 
      :alt="title" 
      class="achievement-image-full"
      @error="onImageError"
      @load="onImageLoad"
    >
    <!-- Placeholder cuando no hay imagen -->
    <div v-else class="achievement-placeholder">
      <div class="achievement-icon">🏆</div>
      <div class="achievement-text">{{ title || 'Logro' }}</div>
    </div>
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
    console.log('🖼️ ACHIEVEMENT - No hay imagen, usando placeholder');
    // En lugar de una imagen inexistente, usar null para mostrar un placeholder
    return null;
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
  
  // Si no tiene formato reconocido, usar null
  console.log('🖼️ ACHIEVEMENT - Formato no reconocido, usando placeholder');
  return null;
};

const onImageError = (event) => {
  console.error('🖼️ ACHIEVEMENT - Error cargando imagen:', event.target.src);
  // Simplemente ocultar la imagen que falló - el template mostrará el placeholder
  event.target.style.display = 'none';
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

.achievement-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
}

.achievement-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.achievement-text {
  font-size: 12px;
  font-weight: 600;
  color: #8B5A2B;
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 360px) {
  .achievement-card { 
    min-width: 120px; 
    height: 120px;
  }
}
</style> 