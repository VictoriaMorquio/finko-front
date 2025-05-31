<template>
  <div class="lesson-page-container" v-if="lessonStep">
    <header class="simple-header">
      <router-link :to="backRoute" class="back-arrow" aria-label="Volver">←</router-link>
    </header>

    <main class="lesson-main-content">
      <h1>{{ lessonStep.title }}</h1>
      <p v-html="lessonStep.text"></p>
      <img v-if="lessonStep.image" :src="lessonStep.image" :alt="lessonStep.title || 'Ilustración de lección'" class="content-image">
    </main>

    <footer class="lesson-action-footer">
      <BaseButton variant="primary" @click="goToNextStep" full-width>
        {{ lessonStep.isLastStep ? 'Finalizar Nivel' : 'Continuar' }}
      </BaseButton>
    </footer>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">Cargando lección...</div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = computed(() => route.params.lessonId);
const stepId = computed(() => route.params.stepId);

const fetchData = () => {
    if(lessonId.value && stepId.value) {
        learnStore.fetchLessonStep(lessonId.value, stepId.value);
    }
};

onMounted(fetchData);
watch([lessonId, stepId], fetchData, { immediate: false }); // Actualiza si cambian los params

const lessonStep = computed(() => learnStore.currentLesson?.currentStep);

const backRoute = computed(() => {
    // Lógica para volver a la pantalla de habilidades de la unidad o a la intro del nivel.
    // Esto puede necesitar más información del store o del backend.
    // Por ahora, vuelve a la lista de habilidades de la unidad.
    const unitId = lessonId.value?.split('-')[0].replace('skill', 'unit') || 'unit1';
    return { name: 'UnitSkills', params: { unitId } };
});

const goToNextStep = () => {
  if (lessonStep.value?.isLastStep) {
    // Ir a la pantalla de nivel completado
    const levelCompletedId = lessonStep.value.levelCompletedId || lessonId.value.split('-')[0].replace('skill','unit');
    router.push({ name: 'LevelCompleted', params: { levelId: levelCompletedId } });
  } else if (lessonStep.value?.nextStepId) {
    const nextStepData = learnStore.currentLesson?.lessonData?.steps?.[lessonStep.value.nextStepId] || learnStore.mockLessonSteps[lessonId.value]?.steps?.[lessonStep.value.nextStepId] ; // Acceso al mock para determinar tipo
    if (nextStepData?.type === 'quiz' || nextStepData?.type === 'true-false') {
        router.push({ name: 'LessonQuiz', params: { lessonId: lessonId.value, stepId: lessonStep.value.nextStepId } });
    } else {
        router.push({ name: 'LessonContent', params: { lessonId: lessonId.value, stepId: lessonStep.value.nextStepId } });
    }
  } else {
    console.warn("No hay siguiente paso definido o es el último.");
    router.push({ name: 'LearnDashboard' }); // Fallback
  }
};
</script>

<style scoped>
/* Estilos de leccion-trueque.html (similar para contenido general) */
.lesson-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 20px;
}

.simple-header {
  width: 100%;
  padding: 0 20px 15px;
  position: fixed;
  top: 20px;
  left: 0;
  background-color: #FFFFFF;
  z-index: 100;
}

.simple-header .back-arrow {
  font-size: 28px;
  color: #333333;
  text-decoration: none;
  padding: 5px;
}
.simple-header .back-arrow:hover {
  color: #000000;
}

.lesson-main-content {
  padding: 70px 25px 30px; /* Padding superior aumentado para header fijo */
  text-align: left;
  flex-grow: 1;
}

.lesson-main-content h1 {
  font-size: 26px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
}

.lesson-main-content p {
  font-size: 17px;
  color: #333333;
  margin-bottom: 30px;
  line-height: 1.6;
}

.content-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 12px;
  margin-bottom: 30px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.lesson-action-footer {
  background-color: #FFFFFF;
  padding: 20px 25px 40px;
  text-align: center;
  border-top: 1px solid #F0F0F0;
  position: sticky;
  bottom: 0;
  z-index: 90;
}
/* BaseButton usa variant finko-continue-lesson (o similar) */
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
  .simple-header { top: 15px; padding: 0 15px 10px; }
  .simple-header .back-arrow { font-size: 26px; }
  .lesson-main-content { padding: 60px 20px 25px; }
  .lesson-main-content h1 { font-size: 24px; }
  .lesson-main-content p { font-size: 16px; }
  .lesson-action-footer { padding: 15px 20px 30px; }
}
</style> 