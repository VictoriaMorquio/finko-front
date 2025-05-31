<template>
  <div class="lesson-page" v-if="lessonStep">
    <header class="lesson-header">
      <router-link :to="backRoute" class="back-arrow" aria-label="Volver">←</router-link>
      <h1>{{ learnStore.currentLesson?.title || 'Lección' }}</h1>
      <router-link :to="{name: 'LearnDashboard'}" class="close-button" aria-label="Cerrar">×</router-link>
    </header>

    <div class="progress-bar-container">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: lessonStep.progressPercentage + '%' }"></div>
      </div>
    </div>

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
        @click="checkAnswer"
        :disabled="!selectedAnswer && !isAnswered"
        full-width
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
import OptionButton from '@/components/common/OptionButton.vue';
import RadioOption from '@/components/common/RadioOption.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = computed(() => route.params.lessonId);
const stepId = computed(() => route.params.stepId);

const selectedAnswer = ref(null);
const isAnswered = ref(false);
const quizResult = ref(null);

const trueFalseChoices = [
    { label: 'Verdadero', value: true }, // O 'true' como string si el backend lo espera así
    { label: 'Falso', value: false }   // O 'false'
];

const fetchData = () => {
    selectedAnswer.value = null;
    isAnswered.value = false;
    quizResult.value = null;
    if(lessonId.value && stepId.value) {
        learnStore.fetchLessonStep(lessonId.value, stepId.value);
    }
};

onMounted(fetchData);
watch([lessonId, stepId], fetchData, { immediate: false });

const lessonStep = computed(() => learnStore.currentLesson?.currentStep);

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
  if (isAnswered.value) { // Si ya se respondió, el botón es "Siguiente"
    goToNextStep();
    return;
  }

  if (!selectedAnswer.value) return;

  try {
    const result = await learnStore.submitQuizAnswer(lessonId.value, stepId.value, selectedAnswer.value);
    quizResult.value = result;
    isAnswered.value = true;
    // Actualizar progreso de la habilidad (UI optimista)
    if (result.correct) {
        const currentSkillId = lessonId.value; // Asumiendo que lessonId es el skillId
        const currentProgress = lessonStep.value?.progressPercentage || 0;
        learnStore.updateSkillProgress(currentSkillId, currentProgress);
    }
  } catch (error) {
    console.error("Error al comprobar respuesta:", error);
    // Mostrar error al usuario si es necesario
  }
};

const goToNextStep = () => {
  if (lessonStep.value?.isLastStep) {
    const levelCompletedId = lessonStep.value.levelCompletedId || lessonId.value.split('-')[0].replace('skill','unit');
    router.push({ name: 'LevelCompleted', params: { levelId: levelCompletedId } });
  } else if (lessonStep.value?.nextStepId) {
    // Determinar si el siguiente paso es contenido o quiz
    const nextStepData = learnStore.mockLessonSteps[lessonId.value]?.steps?.[lessonStep.value.nextStepId];
    if (nextStepData?.type === 'quiz' || nextStepData?.type === 'true-false') {
      router.push({ name: 'LessonQuiz', params: { lessonId: lessonId.value, stepId: lessonStep.value.nextStepId } });
    } else {
      router.push({ name: 'LessonContent', params: { lessonId: lessonId.value, stepId: lessonStep.value.nextStepId } });
    }
  } else {
    router.push({ name: 'LearnDashboard' });
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

.lesson-header {
  background-color: #FBEAE3;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.lesson-header .back-arrow,
.lesson-header .close-button {
  font-size: 26px;
  color: #333333;
  text-decoration: none;
  padding: 5px;
  background: none; border: none; cursor: pointer;
}
.lesson-header .close-button {
  font-weight: bold;
}

.lesson-header h1 {
  font-size: 18px;
  font-weight: bold;
  color: #111111;
  margin: 0;
  text-align: center; /* El título se centrará entre los botones */
  flex-grow: 1;
}

.progress-bar-container {
  background-color: #FBEAE3;
  padding: 0px 20px 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); /* Sombra sutil, igual que header */
  position: sticky; /* Se pega debajo del header */
  top: 63px; /* Altura aproximada del header (ajustar si es necesario) */
  z-index: 99;
}

.progress-bar-track {
  background-color: #E0E0E0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  background-color: #4CAF50; /* Verde para el progreso de la lección */
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.lesson-content {
  padding: 30px 20px;
  text-align: center;
  flex-grow: 1;
  margin-top: 30px; /* Espacio adicional por la barra de progreso pegajosa */
}

.lesson-image {
  max-width: 180px;
  width: 60%;
  height: auto;
  margin-bottom: 30px;
}

.lesson-content h2 {
  font-size: 24px;
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
  .lesson-header h1 { font-size: 17px; }
  .lesson-content h2 { font-size: 22px; }
}
</style> 