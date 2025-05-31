<template>
  <div class="skill-card" @click="$emit('selected', skill.id)">
    <div class="skill-image-container">
      <img :src="skill.image" :alt="skill.title" class="skill-image">
    </div>
    <h3 class="skill-title" v-html="skill.title.replace('<br>', '<br/>')"></h3>
    <div class="skill-progress-track">
      <div class="skill-progress-fill" :style="{ width: skill.progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
    required: true,
    // Espera un objeto como: { id: '1', title: '¿Qué es?<br>el dinero', image: '...', progress: 100 }
  }
});
defineEmits(['selected']);
</script>

<style scoped>
/* Copied from unidad-habilidades.html .skill-card */
.skill-card {
  text-align: center;
  cursor: pointer;
}

.skill-card .skill-image-container {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background-color: #F9F9F9;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 10px auto;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.skill-card .skill-image {
  max-width: 75%;
  max-height: 75%;
  object-fit: contain;
}

.skill-card .skill-title {
  font-size: 15px;
  font-weight: 500;
  color: #222222;
  margin-bottom: 8px;
  min-height: 2.8em; /* Aproximadamente 2 líneas */
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.3;
}

.skill-progress-track {
  background-color: #EAEAEA;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  width: 80%;
  margin: 0 auto;
}

.skill-progress-fill {
  background-color: #333333;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease-in-out;
}

@media (max-width: 360px) {
  .skill-card .skill-image-container {
    width: 110px;
    height: 110px;
  }
  .skill-card .skill-title {
    font-size: 14px;
  }
}
</style> 