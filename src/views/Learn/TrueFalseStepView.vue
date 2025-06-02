<template>
  <div class="true-false-page-container">
    <PageHeader
      :show-back="false"
      :show-logo="true"
    />

    <main class="true-false-main-content" v-if="stepData">
      <!-- Barra de progreso -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="{ 'review-progress': isReviewMode }"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ currentStepNumber }}/{{ totalSteps }}</span>
      </div>
      
      <div v-if="isReviewMode" class="review-indicator">
        <span class="review-badge">🔄 REPASO</span>
        <p class="review-text">Modo Repaso - Repasa las preguntas que fallaste</p>
      </div>

      <!-- Contenido del ejercicio -->
      <div class="exercise-container">
        <div class="statement-section">
          <h2 class="statement-title">
            ¿Es esto verdadero o falso?
            <span v-if="isReviewMode" class="review-badge-inline">🔄 REPASO</span>
          </h2>
          <div class="statement-box">
            <p class="statement-text">{{ stepData.statement }}</p>
          </div>
        </div>

        <!-- Botones de respuesta -->
        <div class="answer-section">
          <div class="answer-buttons" v-if="!answered">
            <button
              class="answer-btn false-btn"
              @click="submitAnswer(false)"
              :disabled="loading"
            >
              <span class="btn-text">Falso</span>
            </button>
            
            <button
              class="answer-btn true-btn"
              @click="submitAnswer(true)"
              :disabled="loading"
            >
              <span class="btn-text">Verdadero</span>
            </button>
          </div>

          <!-- Feedback -->
          <div class="feedback-section" v-if="answered">
            <div class="feedback-box" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
              <div class="feedback-content">
                <h3 class="feedback-title">
                  {{ isCorrect ? '¡Correcto!' : 'Incorrecto' }}
                </h3>
                <p class="feedback-text">{{ stepData.feedback[isCorrect ? 'correct' : 'incorrect'] }}</p>
              </div>
            </div>
            
            <button class="continue-btn" @click="continueToNext">
              {{ isLastStep ? 'Finalizar lección' : 'Continuar' }}
            </button>
          </div>
        </div>
      </div>
    </main>

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
import { handleQuizNavigation, parseStepInfo } from '@/utils/stepNavigation';
import PageHeader from '@/components/common/PageHeader.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = route.params.lessonId;
const stepId = route.params.stepId;

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
const currentStepNumber = computed(() => parseInt(stepId.split('s').pop()) || 1);
const totalSteps = computed(() => stepData.value?.totalSteps || 1);
const progressPercentage = computed(() => (currentStepNumber.value / totalSteps.value) * 100);
const isLastStep = computed(() => currentStepNumber.value >= totalSteps.value);

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
  
  // Usar handleQuizNavigation para incluir verificación de repasos
  const result = await handleQuizNavigation(
    router, 
    learnStore, 
    lessonId, 
    stepId, 
    steps, 
    isLastStep.value, 
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
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.exercise-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.statement-section {
  margin-bottom: 40px;
  text-align: center;
}

.statement-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.statement-box {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.statement-text {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
  margin: 0;
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
  margin-bottom: 30px;
}

.answer-btn {
  background: white;
  border: none;
  border-radius: 16px;
  padding: 24px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 80px;
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

.false-btn {
  background: white;
  border: 2px solid #ef4444;
}

.false-btn .btn-text {
  color: #ef4444;
  font-weight: bold;
}

.false-btn:hover:not(:disabled) {
  background: #fef2f2;
  border: 2px solid #dc2626;
}

.false-btn:hover:not(:disabled) .btn-text {
  color: #dc2626;
}

.true-btn {
  background: white;
  border: 2px solid #10b981;
}

.true-btn .btn-text {
  color: #10b981;
  font-weight: bold;
}

.true-btn:hover:not(:disabled) {
  background: #f0fdf4;
  border: 2px solid #059669;
}

.true-btn:hover:not(:disabled) .btn-text {
  color: #059669;
}

.btn-icon {
  font-size: 32px;
}

.btn-text {
  font-size: 18px;
  font-weight: 600;
  /* Color se define específicamente en .true-btn y .false-btn */
}

.feedback-section {
  text-align: center;
}

.feedback-box {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feedback-box.correct {
  border: 3px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.feedback-box.incorrect {
  border: 3px solid #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.feedback-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feedback-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.feedback-text {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.continue-btn {
  background: #FF007F !important;
  color: white !important;
  border: 2px solid white !important;
  border-radius: 12px !important;
  padding: 15px 32px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: auto;
  min-width: 200px;
}

.continue-btn:hover {
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
  
  .statement-box {
    padding: 20px;
  }
  
  .statement-text {
    font-size: 16px;
  }
  
  .answer-buttons {
    gap: 16px;
  }
  
  .answer-btn {
    padding: 20px 16px;
    min-height: 100px;
  }
  
  .btn-icon {
    font-size: 24px;
  }
  
  .btn-text {
    font-size: 16px;
  }
  
  .feedback-box {
    padding: 20px;
  }
  
  .feedback-title {
    font-size: 20px;
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