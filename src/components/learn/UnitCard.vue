<template>
  <div class="unit-card" @click="$emit('selected', unit.id)">
    <div class="unit-image-container" :style="{ backgroundColor: unit.bgColor || '#FBEAE3' }">
      <img :src="getFullImageUrl(unit.image)" :alt="unit.title" class="unit-image" @error="handleImageError">
    </div>
    <h3 class="unit-title" v-html="unit.title.replace('<br>', '<br/>')"></h3>
    <p class="unit-description">{{ unit.description }}</p>
  </div>
</template>

<script setup>
import { getImageUrl } from '@/utils/imageUtils.js';

defineProps({
  unit: {
    type: Object,
    required: true,
    // Espera un objeto como: { id: '1', title: 'Unidad 1:<br>Fundamentos', description: '...', image: '...', bgColor: '...' }
  }
});
defineEmits(['selected']);

const getFullImageUrl = (imagePath) => {
  return getImageUrl(imagePath);
};

const handleImageError = (event) => {
  console.warn('Error loading unit image:', event.target.src);
  // Usar imagen placeholder local si falla la del backend
  event.target.src = '/images/placeholder-unit.jpg';
};
</script>

<style scoped>
/* Copied from aprende.html .unit-card */
.unit-card {
  text-align: center;
  cursor: pointer;
}

.unit-card .unit-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  /* background-color is now dynamic via :style */
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px auto;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.unit-card .unit-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unit-card .unit-title {
  font-size: 15px;
  font-weight: bold;
  color: #222222;
  margin-bottom: 5px;
  line-height: 1.3; /* For <br> */
}

.unit-card .unit-description {
  font-size: 13px;
  color: #666666;
  line-height: 1.3;
}

@media (max-width: 360px) {
  .unit-card .unit-image-container {
    width: 100px;
    height: 100px;
  }
  .unit-card .unit-title {
    font-size: 14px;
  }
  .unit-card .unit-description {
    font-size: 12px;
  }
}
</style> 