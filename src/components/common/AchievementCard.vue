<template>
  <div class="achievement-card" :style="{ backgroundColor: bgColor }">
    <div class="achievement-image-container">
      <img :src="image" :alt="title" class="achievement-image">
    </div>
    <p class="achievement-title">{{ title }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  image: String,
  bgColor: { // Para permitir diferentes colores de fondo
    type: String,
    default: '#FCE9BF' // Default color from profile.html
  }
});
</script>

<style scoped>
/* Copied from perfil.html .achievement-card */
.achievement-card {
  /* background-color is now a prop */
  border-radius: 16px;
  padding: 15px;
  text-align: center;
  min-width: 140px; /* Para el carrusel */
  flex-shrink: 0; /* Para el carrusel */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  height: 100%; /* Para que todos tengan la misma altura en el carrusel si se desea */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.achievement-card .achievement-image-container {
  width: 90px;
  height: 90px;
  margin: 0 auto 10px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.achievement-card .achievement-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.achievement-card .achievement-title {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

@media (max-width: 360px) {
  .achievement-card { min-width: 120px; }
}
</style> 