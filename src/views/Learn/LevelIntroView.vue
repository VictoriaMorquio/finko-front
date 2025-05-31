<template>
  <div class="level-intro-page" v-if="lessonIntro">
    <section class="hero-section">
      <router-link :to="{ name: 'UnitSkills', params: { unitId: getUnitIdFromLessonId(lessonId) } }" class="back-arrow" aria-label="Volver">←</router-link>
      <img :src="lessonIntro.image" :alt="lessonIntro.title" class="level-artwork">
    </section>

    <section class="details-section">
      <h1>{{ lessonIntro.title }}</h1>
      <p>{{ lessonIntro.description }}</p>
    </section>

    <footer class="action-footer">
      <BaseButton variant="primary" @click="startLesson" full-width>
        Comenzar
      </BaseButton>
    </footer>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">Cargando...</div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const lessonId = route.params.lessonId; // Este ID es el de la habilidad/lección

onMounted(() => {
  learnStore.fetchLessonIntro(lessonId);
});

const lessonIntro = computed(() => learnStore.currentLesson);

const startLesson = () => {
  if (lessonIntro.value && lessonIntro.value.firstStepId) {
    router.push({
        name: 'LessonContent', // O determinar el tipo de step y ir a Quiz si es quiz
        params: { lessonId: lessonIntro.value.id, stepId: lessonIntro.value.firstStepId }
    });
  } else {
      console.error("No hay primer paso definido para esta lección.");
      // Podría redirigir a dashboard o mostrar error.
  }
};

// Función heurística para intentar obtener el unitId desde el lessonId (skillId)
// Ejemplo: skillId = "skill1-2", unitId sería "unit1"
const getUnitIdFromLessonId = (lessonId) => {
    if (lessonId && lessonId.startsWith('skill')) {
        return lessonId.split('-')[0].replace('skill', 'unit');
    }
    return 'unit1'; // Fallback, idealmente esta info vendría de la API o store.
};

</script>

<style scoped>
/* Estilos de nivel-intro.html */
.level-intro-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hero-section {
  background-color: #FBEAE3;
  padding: 30px 20px 30px;
  text-align: center;
  position: relative;
}

.back-arrow {
  position: absolute;
  top: 25px;
  left: 20px;
  font-size: 28px;
  color: #333333;
  text-decoration: none;
  padding: 5px;
  z-index: 10;
}
.back-arrow:hover {
  color: #000000;
}

.level-artwork {
  max-width: 240px;
  width: 70%;
  height: auto;
  margin-top: 20px; /* Para que no choque con flecha */
}

.details-section {
  background-color: #FFFFFF;
  padding: 40px 25px;
  text-align: center;
  flex-grow: 1;
}

.details-section h1 {
  font-size: 32px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 20px;
}

.details-section p {
  font-size: 17px;
  color: #333333;
  line-height: 1.6;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.action-footer {
  background-color: #FFFFFF;
  padding: 20px 25px 40px;
  text-align: center;
  position: sticky; /* Para que se quede abajo si el contenido es poco */
  bottom: 0;
}
/* BaseButton usa variant finko-start-level */
.loading-message, .error-message-centered {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #555;
  height: 100vh; display: flex; justify-content: center; align-items: center;
}
.error-message-centered {
    color: red;
}

@media (max-width: 360px) {
  .back-arrow { top: 20px; left: 15px; font-size: 26px; }
  .level-artwork { margin-top: 15px; }
  .details-section h1 { font-size: 28px; }
  .details-section p { font-size: 16px; }
  .hero-section { padding: 25px 15px 25px; }
  .details-section { padding: 30px 20px; }
  .action-footer { padding: 15px 20px 30px; }
}
</style> 