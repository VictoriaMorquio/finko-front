<template>
  <div class="lesson-page" v-if="lessonStep">
    <LessonProgressBar
      :current-step-number="progressData.currentStepNumber.value"
      :total-steps="progressData.totalSteps.value"
      :lesson-title="progressData.lessonTitle.value"
      :is-review-mode="isReviewMode"
    />

    <main class="lesson-content">
      <img v-if="lessonStep.image" :src="lessonStep.image" alt="Ilustración de lección" class="lesson-image">
      <h2>{{ lessonStep.question || lessonStep.statement }}</h2>

      <div v-if="lessonStep.type === 'quiz'" class="multiple-choice-options">
        <OptionButton
          v-for="option in lessonStep.options"
          :key="option.id"
          @selected="selectOption(option.id)"
          :selected="selectedAnswer === option.id"
          :disabled="isAnswered"
          :correct="isAnswered && option.id === quizResult?.correctAnswer"
          :incorrect="isAnswered && selectedAnswer === option.id && !quizResult?.correct"
        >
          {{ option.text }}
        </OptionButton>
      </div>

      <form v-if="lessonStep.type === 'true-false'" @submit.prevent="checkAnswer" class="true-false-options">
          <RadioOption
            v-for="tfOption in trueFalseChoices"
            :key="tfOption.value"
            :name="'truefalse-' + lessonStep.id"
            :value="tfOption.value"
            :label="tfOption.label"
            v-model="selectedAnswer"
            :disabled="isAnswered"
          />
      </form>

      <div v-if="isAnswered && quizResult?.feedback" class="feedback-message" :class="{ correct: quizResult.correct, incorrect: !quizResult.correct }">
        {{ quizResult.feedback }}
      </div>
    </main>

    <footer class="lesson-footer">
      <BaseButton
        variant="primary"
        size="large"
        @click="checkAnswer"
        :disabled="!selectedAnswer && !isAnswered"
        full-width
        class="btn-quiz"
      >
        {{ isAnswered ? (lessonStep.isLastStep ? 'Finalizar Nivel' : 'Siguiente') : 'Comprobar' }}
      </BaseButton>
    </footer>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">Cargando pregunta...</div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { useLessonProgress } from '@/composables/useLessonProgress';
import { handleQuizNavigation } from '@/utils/stepNavigation';
import OptionButton from '@/components/common/OptionButton.vue';
import RadioOption from '@/components/common/RadioOption.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import LessonProgressBar from '@/components/common/LessonProgressBar.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = computed(() => route.params.lessonId);
const stepId = computed(() => route.params.stepId);

// Usar el composable para progreso real
const progressData = useLessonProgress(stepId.value);

const selectedAnswer = ref(null);
const isAnswered = ref(false);
const quizResult = ref(null);

// Detectar modo repaso
const isReviewMode = computed(() => {
  return route.query.reviewMode === 'true' || learnStore.currentLesson?.isReviewMode || false;
});

const trueFalseChoices = [
    { label: 'Verdadero', value: true }, // O 'true' como string si el backend lo espera así
    { label: 'Falso', value: false }   // O 'false'
];

const fetchData = async () => {
    selectedAnswer.value = null;
    isAnswered.value = false;
    quizResult.value = null;
    if(lessonId.value && stepId.value) {
        try {
            // Cargar todos los steps primero para tener la navegación completa
            if (!learnStore.currentLesson?.allSteps) {
                await learnStore.fetchLessonSteps(lessonId.value);
            }
            // Luego cargar el step específico
            await learnStore.fetchLessonStep(lessonId.value, stepId.value);
        } catch (error) {
            // Error manejado por el store
        }
    }
};

onMounted(fetchData);
watch([lessonId, stepId], fetchData, { immediate: false });

const lessonStep = computed(() => {
  const step = learnStore.currentLesson?.currentStep;
  return step;
});

const backRoute = computed(() => {
    const unitId = lessonId.value?.split('-')[0].replace('skill', 'unit') || 'unit1';
    return { name: 'UnitSkills', params: { unitId } };
});

const selectOption = (optionId) => {
  if (!isAnswered.value) {
    selectedAnswer.value = optionId;
  }
};

const checkAnswer = async () => {
  console.log('🎯 QUIZ - checkAnswer iniciado:', {
    lessonId: lessonId.value,
    stepId: stepId.value,
    isAnswered: isAnswered.value,
    selectedAnswer: selectedAnswer.value
  });

  if (isAnswered.value) { // Si ya se respondió, el botón es "Siguiente"
    console.log('➡️ QUIZ - Ya respondido, navegando al siguiente step');
    goToNextStep();
    return;
  }

  if (!selectedAnswer.value) {
    console.log('⚠️ QUIZ - No hay respuesta seleccionada');
    return;
  }

  try {
    console.log('📤 QUIZ - Enviando respuesta al backend...');
    const result = await learnStore.submitQuizAnswer(lessonId.value, stepId.value, selectedAnswer.value);
    console.log('📥 QUIZ - Respuesta del backend:', result);
    
    quizResult.value = result;
    isAnswered.value = true;
    
    // Actualizar progreso de la habilidad (UI optimista)
    if (result.correct) {
        console.log('✅ QUIZ - Respuesta correcta, actualizando progreso');
        const currentSkillId = lessonId.value; // Asumiendo que lessonId es el skillId
        const currentProgress = lessonStep.value?.progressPercentage || 0;
        learnStore.updateSkillProgress(currentSkillId, currentProgress);
    } else {
        console.log('❌ QUIZ - Respuesta incorrecta');
    }
  } catch (error) {
    console.error('💥 QUIZ - Error al enviar respuesta:', error);
    // Mostrar error al usuario si es necesario
  }
};

const goToNextStep = async () => {
  const steps = learnStore.currentLesson?.allSteps || [];
  const isLastStep = lessonStep.value?.isLastStep || false;
  const wasCorrect = quizResult.value?.correct || false;
  
  console.log('🚀 QUIZ - goToNextStep iniciado:', {
    lessonId: lessonId.value,
    stepId: stepId.value,
    totalSteps: steps.length,
    isLastStep,
    wasCorrect,
    isReviewMode: isReviewMode.value,
    allSteps: steps.map(s => ({ id: s.id, type: s.type }))
  });
  
  // Usar la nueva función que maneja repasos automáticamente
  const result = await handleQuizNavigation(
    router, 
    learnStore, 
    lessonId.value, 
    stepId.value, 
    steps, 
    isLastStep, 
    isReviewMode.value,
    wasCorrect
  );
  
  console.log('📋 QUIZ - Resultado de handleQuizNavigation:', result);
  
  // Si estamos en modo repaso y fallamos, resetear estado para permitir retry
  if (result === 'retry') {
    console.log('🔄 QUIZ - Modo retry activado, reseteando estado');
    setTimeout(() => {
      selectedAnswer.value = null;
      isAnswered.value = false;
      quizResult.value = null;
    }, 1000); // Reducido de 3000ms a 1000ms para respuesta más rápida
  }
};
</script>

<style scoped>
/* Estilos de leccion-pregunta-multiple.html y ejercicio-trueque.html */
.lesson-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.lesson-content {
  padding: 30px 20px;
  text-align: center;
  flex-grow: 1;
}

.lesson-image {
  max-width: 180px;
  width: 60%;
  height: auto;
  margin-bottom: 30px;
}

.lesson-content h2 {
  font-size: 22px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 30px;
  text-align: left;
  line-height: 1.4;
}

.multiple-choice-options, .true-false-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
/* OptionButton y RadioOption manejan sus estilos */

.feedback-message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 8px;
    font-size: 15px;
    text-align: center;
    font-weight: 500;
}
.feedback-message.correct {
    background-color: #E8F5E9;
    color: #2E7D32;
    border: 1px solid #A5D6A7;
}
.feedback-message.incorrect {
    background-color: #FFEBEE;
    color: #C62828;
    border: 1px solid #EF9A9A;
}

.lesson-footer {
  background-color: #FFFFFF;
  padding: 20px 20px 30px;
  text-align: center;
  border-top: 1px solid #F0F0F0;
  position: sticky;
  bottom: 0;
  z-index: 90;
}

/* Estilo del botón para coincidir con el de login */
.lesson-footer :deep(.btn-quiz) {
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

.lesson-footer :deep(.btn-quiz:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.lesson-footer :deep(.btn-quiz:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #FF007F !important; /* Mantener color fucsia even cuando disabled */
}

/* BaseButton usa variant finko-check-answer */
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
  .lesson-content h2 { font-size: 20px; }
}
</style> 