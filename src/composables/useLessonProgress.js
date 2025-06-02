import { computed } from 'vue';
import { useLearnStore } from '@/stores/learn';

/**
 * Composable para manejar el progreso real de lecciones
 * @param {string} stepId - ID del step actual
 * @returns {Object} Datos de progreso calculados
 */
export function useLessonProgress(stepId) {
  const learnStore = useLearnStore();

  // Extraer número de step desde el ID (ej: "u1s1l1s9" -> 9)
  const currentStepNumber = computed(() => {
    if (!stepId) return 1;
    const match = stepId.match(/s(\d+)$/);
    return match ? parseInt(match[1]) : 1;
  });

  // Obtener datos reales del backend
  const allSteps = computed(() => {
    return learnStore.currentLesson?.allSteps || [];
  });

  const totalSteps = computed(() => {
    return allSteps.value.length || 1;
  });

  const lessonTitle = computed(() => {
    return learnStore.currentLesson?.title || '';
  });

  const currentStep = computed(() => {
    return learnStore.currentLesson?.currentStep;
  });

  // Verificar si es modo repaso
  const isReviewMode = computed(() => {
    return learnStore.currentLesson?.isReviewMode || false;
  });

  // Progreso porcentual real
  const progressPercentage = computed(() => {
    if (totalSteps.value === 0) return 0;
    return Math.round((currentStepNumber.value / totalSteps.value) * 100);
  });

  // Información detallada para debugging
  const debugInfo = computed(() => ({
    stepId,
    currentStepNumber: currentStepNumber.value,
    totalSteps: totalSteps.value,
    progressPercentage: progressPercentage.value,
    allStepsCount: allSteps.value.length,
    hasAllSteps: allSteps.value.length > 0,
    lessonTitle: lessonTitle.value
  }));

  return {
    currentStepNumber,
    totalSteps,
    lessonTitle,
    isReviewMode,
    progressPercentage,
    currentStep,
    allSteps,
    debugInfo
  };
} 