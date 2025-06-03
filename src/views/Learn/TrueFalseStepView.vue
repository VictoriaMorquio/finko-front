<template>
  <div class="true-false-page-container">
    <!-- LessonProgressBar DENTRO del contenedor para incluirlo en 100vh -->
    <LessonProgressBar
      :current-step-number="progressData.currentStepNumber.value"
      :total-steps="progressData.totalSteps.value"
      :lesson-title="progressData.lessonTitle.value"
      :is-review-mode="isReviewMode"
    />

    <main class="true-false-main-content" v-if="stepData">
      <!-- Contenido del ejercicio -->
      <div class="exercise-container">
        <div class="statement-section">
          <h2 class="statement-title">{{ stepData.title }}</h2>
          <div class="statement-box">
            <p class="statement-text">{{ stepData.statement }}</p>
          </div>
        </div>

        <div class="answer-section">
          <div class="answer-buttons">
            <button 
              @click="submitAnswer(true)"
              :disabled="answered"
              class="answer-btn"
              :class="{ 
                'correct': answered && isCorrect === true,
                'incorrect': answered && selectedAnswer === true && !isCorrect 
              }"
            >
              <span class="answer-icon">✓</span>
              <span class="answer-text">Verdadero</span>
            </button>
            
            <button 
              @click="submitAnswer(false)"
              :disabled="answered"
              class="answer-btn"
              :class="{ 
                'correct': answered && isCorrect === false,
                'incorrect': answered && selectedAnswer === false && !isCorrect 
              }"
            >
              <span class="answer-icon">✗</span>
              <span class="answer-text">Falso</span>
            </button>
          </div>

          <!-- Feedback después de responder -->
          <div v-if="answered && quizResult?.feedback" class="feedback-section">
            <div class="feedback-message" :class="{ correct: isCorrect, incorrect: !isCorrect }">
              {{ quizResult.feedback }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Botón de continuar como footer fijo -->
    <footer class="continue-footer" v-if="answered && stepData">
      <BaseButton
        variant="primary"
        size="large"
        @click="continueToNext"
        :disabled="loading"
        full-width
        class="btn-continue"
      >
        {{ progressData.currentStepNumber.value >= progressData.totalSteps.value ? 'Finalizar Nivel' : 'Continuar' }}
      </BaseButton>
    </footer>

    <div v-if="learnStore.loading && !stepData" class="loading-message">
      Cargando ejercicio...
    </div>
    <div v-if="learnStore.error && !stepData" class="error-message-centered">
      {{ learnStore.error }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { useLessonProgress } from '@/composables/useLessonProgress';
import { handleQuizNavigation, parseStepInfo } from '@/utils/stepNavigation';
import BaseButton from '@/components/common/BaseButton.vue';
import LessonProgressBar from '@/components/common/LessonProgressBar.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = route.params.lessonId;
const stepId = route.params.stepId;

// Usar el composable para progreso real
const progressData = useLessonProgress(stepId);

const answered = ref(false);
const isCorrect = ref(false);
const loading = ref(false);
const selectedAnswer = ref(null);
const quizResult = ref(null);

// Detectar modo repaso
const isReviewMode = computed(() => {
  return route.query.reviewMode === 'true' || learnStore.currentLesson?.isReviewMode || false;
});

onMounted(async () => {
  // Cargar todos los steps primero para tener la navegación completa
  if (!learnStore.currentLesson?.allSteps) {
    await learnStore.fetchLessonSteps(lessonId);
  }
  // Luego cargar el step específico
  await learnStore.fetchLessonStep(lessonId, stepId);
});

const stepData = computed(() => learnStore.currentLesson?.currentStep);

const submitAnswer = async (answer) => {
  if (loading.value || answered.value) return;
  
  loading.value = true;
  selectedAnswer.value = answer;
  
  try {
    // Para true-false, enviamos un objeto específico
    const trueFalseData = {
      lessonId: lessonId,
      stepId: stepId,
      answer: answer, // boolean true/false
      type: 'true-false' // Indicador para el backend
    };
    
    // Enviar al backend usando el store (igual que LessonQuizView)
    const result = await learnStore.submitQuizAnswer(lessonId, stepId, answer);
    
    quizResult.value = result;
    isCorrect.value = result.correct;
    answered.value = true;
    
  } catch (error) {
    // Error manejado por el store
  } finally {
    loading.value = false;
  }
};

const continueToNext = async () => {
  const steps = learnStore.currentLesson?.allSteps || [];
  const wasCorrect = isCorrect.value; // Usar el estado local de correcto/incorrecto
  const isLastStep = progressData.currentStepNumber.value >= progressData.totalSteps.value;
  
  // Usar handleQuizNavigation para incluir verificación de repasos
  const result = await handleQuizNavigation(
    router, 
    learnStore, 
    lessonId, 
    stepId, 
    steps, 
    isLastStep, 
    isReviewMode.value,
    wasCorrect
  );
  
  // Si estamos en modo repaso y fallamos, resetear estado para permitir retry
  if (result === 'retry') {
    setTimeout(() => {
      answered.value = false;
      isCorrect.value = false;
      selectedAnswer.value = null;
      quizResult.value = null;
    }, 1000); // Reducido de 3000ms a 1000ms para respuesta más rápida
  }
};

// Función heurística para obtener skillId desde lessonId
const getSkillIdFromLessonId = (lessonId) => {
  if (lessonId && lessonId.includes('l')) {
    return lessonId.split('l')[0]; // "u1s1l1" -> "u1s1"
  }
  return 'u1s1'; // Fallback
};
</script>

<style scoped>
.true-false-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #F75B06 0%, #FB305F 40%, #FB02B8 100%);
}

.true-false-main-content {
  flex-grow: 1;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
}

.exercise-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  justify-content: space-around;
}

.statement-section {
  text-align: center;
  margin-bottom: 20px;
}

.statement-title {
  color: white;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.statement-box {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.statement-text {
  font-size: 17px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  text-align: justify;
}

.answer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.answer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.answer-btn {
  background: white;
  border: none;
  border-radius: 16px;
  padding: 22px 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 75px;
}

.answer-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.answer-btn:active {
  transform: translateY(0);
}

.answer-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.answer-btn.correct {
  background: #f0fdf4;
  border: 2px solid #059669;
}

.answer-btn.incorrect {
  background: #fef2f2;
  border: 2px solid #ef4444;
}

.answer-icon {
  font-size: 30px;
}

.answer-text {
  font-size: 16px;
  font-weight: 600;
}

.feedback-section {
  text-align: center;
  margin-top: 15px;
}

.feedback-message {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-size: 13px;
  line-height: 1.4;
}

.feedback-message.correct {
  border: 3px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.feedback-message.incorrect {
  border: 3px solid #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.continue-footer {
  background: transparent;
  padding: 15px 20px;
  border-top: none;
  position: sticky;
  bottom: 0;
  z-index: 90;
}

.btn-continue {
  background: #FF007F !important;
  color: white !important;
  border: 2px solid white !important;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-size: 17px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
}

.btn-continue:hover {
  background: #E60072 !important;
  transform: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border: 2px solid white !important;
}

.loading-message, .error-message-centered {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  text-align: center;
}

.error-message-centered {
  color: #fecaca;
}

@media (max-width: 768px) {
  .true-false-main-content {
    padding: 16px;
  }
  
  .statement-section {
    margin-bottom: 16px;
  }
  
  .statement-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
  
  .statement-box {
    padding: 20px;
  }
  
  .statement-text {
    font-size: 15px;
  }
  
  .answer-buttons {
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .answer-btn {
    padding: 20px 16px;
    min-height: 75px;
  }
  
  .answer-icon {
    font-size: 28px;
  }
  
  .answer-text {
    font-size: 15px;
  }
  
  .feedback-message {
    padding: 18px;
    font-size: 13px;
    margin-bottom: 16px;
  }
  
  .continue-footer {
    padding: 16px 0;
  }
  
  .btn-continue {
    padding: 12px 24px !important;
    font-size: 16px !important;
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .true-false-main-content {
    padding: 12px;
  }
  
  .statement-section {
    margin-bottom: 12px;
  }
  
  .statement-title {
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .statement-box {
    padding: 18px;
  }
  
  .statement-text {
    font-size: 14px;
  }
  
  .answer-buttons {
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .answer-btn {
    padding: 18px 14px;
    min-height: 70px;
  }
  
  .answer-icon {
    font-size: 26px;
  }
  
  .answer-text {
    font-size: 14px;
  }
  
  .feedback-message {
    padding: 16px;
    font-size: 12px;
    margin-bottom: 12px;
  }
  
  .continue-footer {
    padding: 12px 0;
  }
  
  .btn-continue {
    padding: 10px 20px !important;
    font-size: 15px !important;
    min-width: 160px;
  }
}

/* Estilos para modo repaso */
.review-indicator {
  text-align: center;
  margin-bottom: 20px;
}

.review-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  margin-bottom: 8px;
  animation: pulse-review 2s infinite;
}

.review-badge-inline {
  display: inline-block;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 8px;
  animation: pulse-review 2s infinite;
}

.review-progress {
  background: linear-gradient(90deg, #FF6B35, #F7931E) !important;
}

.review-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  animation: fade-in 0.5s ease-in;
}

@keyframes pulse-review {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 