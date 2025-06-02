<template>
  <div class="lesson-page-container" v-if="lessonStep">
    <LessonProgressBar
      :current-step-number="progressData.currentStepNumber.value"
      :total-steps="progressData.totalSteps.value"
      :lesson-title="progressData.lessonTitle.value"
      :is-review-mode="progressData.isReviewMode.value"
    />
    
    <header class="simple-header">
      <!-- Sin navegación hacia atrás en lecciones -->
    </header>

    <main class="lesson-main-content">
      <h1>{{ lessonStep.title }}</h1>
      <p v-html="lessonStep.text"></p>
      <img v-if="lessonStep.image" :src="lessonStep.image" :alt="lessonStep.title || 'Ilustración de lección'" class="content-image">
    </main>

    <footer class="lesson-action-footer">
      <BaseButton 
        variant="primary" 
        size="large"
        @click="goToNextStep" 
        full-width
        class="btn-continuar-leccion"
      >
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
import { useLessonProgress } from '@/composables/useLessonProgress';
import { navigateToNextStep } from '@/utils/stepNavigation';
import BaseButton from '@/components/common/BaseButton.vue';
import LessonProgressBar from '@/components/common/LessonProgressBar.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = computed(() => route.params.lessonId);
const stepId = computed(() => route.params.stepId);

// Usar el composable para progreso real
const progressData = useLessonProgress(stepId.value);

const fetchData = async () => {
    if(lessonId.value && stepId.value) {
        // Cargar todos los steps primero para tener la navegación completa
        if (!learnStore.currentLesson?.allSteps) {
            await learnStore.fetchLessonSteps(lessonId.value);
        }
        // Luego cargar el step específico
        await learnStore.fetchLessonStep(lessonId.value, stepId.value);
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
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId.value } });
  } else {
    const steps = learnStore.currentLesson?.allSteps || [];
    const isLastStep = lessonStep.value?.isLastStep || false;
    navigateToNextStep(router, lessonId.value, stepId.value, steps, isLastStep);
  }
};
</script>

<style scoped>
/* Estilos de leccion-trueque.html (similar para contenido general) */
.lesson-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.simple-header {
  width: 100%;
  padding: 0 20px 15px;
  /* Removido position: fixed para evitar superposición con progress bar */
  background-color: #FFFFFF;
  z-index: 100;
}

.lesson-main-content {
  padding: 30px 25px 30px; /* Padding superior reducido porque ya no hay header fijo */
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

/* Estilo del botón para coincidir con el de login */
.lesson-action-footer :deep(.btn-continuar-leccion) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados como en login */
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important; /* Color fucsia igual que login */
  color: white !important;
}

.lesson-action-footer :deep(.btn-continuar-leccion:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.lesson-action-footer :deep(.btn-continuar-leccion:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
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
  .simple-header { padding: 0 15px 10px; }
  .lesson-main-content { padding: 25px 20px 25px; }
  .lesson-main-content h1 { font-size: 24px; }
  .lesson-main-content p { font-size: 16px; }
  .lesson-action-footer { padding: 15px 20px 30px; }
}
</style> 