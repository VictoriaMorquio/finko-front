<template>
  <div class="drag-drop-page-container">
    <PageHeader
      :show-back="true"
      :back-route="{ name: 'SkillLessons', params: { skillId: getSkillIdFromLessonId(lessonId) } }"
      :show-logo="true"
    />

    <main class="drag-drop-main-content" v-if="stepData">
      <!-- Barra de progreso -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">{{ currentStepNumber }}/{{ totalSteps }}</span>
      </div>

      <!-- Contenido del ejercicio -->
      <div class="exercise-container">
        <div class="question-section">
          <h2 class="question-title">{{ stepData.question }}</h2>
          <p class="instruction-text">Arrastra cada elemento a la categoría correcta</p>
        </div>

        <!-- Elementos a arrastrar -->
        <div class="items-section" v-if="!exerciseCompleted">
          <h3 class="section-title">Elementos</h3>
          <div class="draggable-items">
            <div
              v-for="item in availableItems"
              :key="item.id"
              class="draggable-item"
              draggable="true"
              @dragstart="handleDragStart(item, $event)"
              @dragend="handleDragEnd"
            >
              <img v-if="item.image" :src="item.image" :alt="item.text" class="item-image">
              <span class="item-text">{{ item.text }}</span>
            </div>
          </div>
        </div>

        <!-- Categorías (zonas de drop) -->
        <div class="categories-section">
          <h3 class="section-title">Categorías</h3>
          <div class="drop-zones">
            <div
              v-for="category in stepData.categories"
              :key="category.id"
              class="drop-zone"
              :class="{ 
                'drag-over': dragOverCategory === category.id,
                'has-items': categoryItems[category.id]?.length > 0
              }"
              :style="{ borderColor: category.color }"
              @dragover.prevent="handleDragOver(category.id)"
              @dragleave="handleDragLeave"
              @drop="handleDrop(category.id, $event)"
            >
              <div class="category-header" :style="{ backgroundColor: category.color + '20' }">
                <img v-if="category.icon" :src="category.icon" :alt="category.title" class="category-icon">
                <div class="category-info">
                  <h4 class="category-title" :style="{ color: category.color }">{{ category.title }}</h4>
                  <p class="category-description">{{ category.description }}</p>
                </div>
              </div>
              
              <div class="dropped-items">
                <div
                  v-for="item in categoryItems[category.id] || []"
                  :key="item.id"
                  class="dropped-item"
                  :class="{ 
                    'correct': exerciseCompleted && item.isCorrect,
                    'incorrect': exerciseCompleted && !item.isCorrect
                  }"
                >
                  <img v-if="item.image" :src="item.image" :alt="item.text" class="item-image">
                  <span class="item-text">{{ item.text }}</span>
                  <div v-if="exerciseCompleted" class="correctness-indicator">
                    {{ item.isCorrect ? '✅' : '❌' }}
                  </div>
                </div>
              </div>
              
              <div v-if="!categoryItems[category.id]?.length" class="drop-placeholder">
                Arrastra elementos aquí
              </div>
            </div>
          </div>
        </div>

        <!-- Botón de verificar -->
        <div class="action-section" v-if="!exerciseCompleted">
          <button 
            class="check-btn"
            @click="checkAnswers"
            :disabled="!allItemsPlaced || loading"
          >
            {{ loading ? 'Verificando...' : 'Verificar respuestas' }}
          </button>
        </div>

        <!-- Feedback -->
        <div class="feedback-section" v-if="exerciseCompleted">
          <div class="feedback-box" :class="{ 'all-correct': allCorrect, 'has-errors': !allCorrect }">
            <div class="feedback-icon">
              {{ allCorrect ? '🎉' : '📚' }}
            </div>
            <div class="feedback-content">
              <h3 class="feedback-title">
                {{ allCorrect ? '¡Perfecto!' : '¡Buen intento!' }}
              </h3>
              <p class="feedback-text">
                {{ allCorrect ? 
                  '¡Has clasificado todos los elementos correctamente!' : 
                  `Tienes ${correctCount}/${totalItems} respuestas correctas. Las respuestas correctas están marcadas.`
                }}
              </p>
              <div class="score-display">
                Puntuación: {{ correctCount }}/{{ totalItems }}
              </div>
            </div>
          </div>
          
          <button class="continue-btn" @click="continueToNext">
            {{ isLastStep ? 'Finalizar lección' : 'Continuar' }}
          </button>
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
import { onMounted, ref, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { navigateToNextStep, parseStepInfo } from '@/utils/stepNavigation';
import PageHeader from '@/components/common/PageHeader.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();

const lessonId = route.params.lessonId;
const stepId = route.params.stepId;

const draggedItem = ref(null);
const dragOverCategory = ref(null);
const categoryItems = reactive({});
const exerciseCompleted = ref(false);
const loading = ref(false);

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

// Items disponibles para arrastrar (no colocados aún)
const availableItems = computed(() => {
  if (!stepData.value?.items) return [];
  
  const placedItemIds = Object.values(categoryItems).flat().map(item => item.id);
  return stepData.value.items.filter(item => !placedItemIds.includes(item.id));
});

const allItemsPlaced = computed(() => {
  return availableItems.value.length === 0 && stepData.value?.items?.length > 0;
});

const totalItems = computed(() => stepData.value?.items?.length || 0);

const correctCount = computed(() => {
  return Object.values(categoryItems).flat().filter(item => item.isCorrect).length;
});

const allCorrect = computed(() => {
  return correctCount.value === totalItems.value && totalItems.value > 0;
});

// Drag and Drop handlers
const handleDragStart = (item, event) => {
  draggedItem.value = item;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.outerHTML);
  event.target.style.opacity = '0.5';
};

const handleDragEnd = (event) => {
  event.target.style.opacity = '1';
  draggedItem.value = null;
};

const handleDragOver = (categoryId) => {
  dragOverCategory.value = categoryId;
};

const handleDragLeave = () => {
  dragOverCategory.value = null;
};

const handleDrop = (categoryId, event) => {
  event.preventDefault();
  dragOverCategory.value = null;
  
  if (draggedItem.value) {
    // Inicializar array si no existe
    if (!categoryItems[categoryId]) {
      categoryItems[categoryId] = [];
    }
    
    // Agregar item a la categoría
    categoryItems[categoryId].push({ ...draggedItem.value });
    draggedItem.value = null;
  }
};

const checkAnswers = async () => {
  if (!allItemsPlaced.value || loading.value) return;
  
  loading.value = true;
  
  try {
    // Simular verificación en el backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Marcar respuestas correctas/incorrectas
    Object.keys(categoryItems).forEach(categoryId => {
      categoryItems[categoryId].forEach(item => {
        item.isCorrect = item.correctCategory === categoryId;
      });
    });
    
    exerciseCompleted.value = true;
    
    // Enviar resultados al backend
    // const userAnswers = Object.entries(categoryItems).flatMap(([categoryId, items]) =>
    //   items.map(item => ({ itemId: item.id, categoryId }))
    // );
    // await learnStore.submitDragDropAnswer(lessonId, stepId, userAnswers);
    
  } catch (error) {
    console.error('Error al verificar respuestas:', error);
  } finally {
    loading.value = false;
  }
};

const continueToNext = () => {
  const steps = learnStore.currentLesson?.allSteps || [];
  navigateToNextStep(router, lessonId, stepId, steps, isLastStep.value);
};

const getSkillIdFromLessonId = (lessonId) => {
  if (lessonId && lessonId.includes('l')) {
    return lessonId.split('l')[0];
  }
  return 'u1s1';
};
</script>

<style scoped>
.drag-drop-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.drag-drop-main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.question-section {
  text-align: center;
  margin-bottom: 30px;
}

.question-title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.instruction-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0;
}

.section-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.items-section {
  margin-bottom: 30px;
}

.draggable-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  min-height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.draggable-item {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: grab;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
  user-select: none;
}

.draggable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.draggable-item:active {
  cursor: grabbing;
}

.categories-section {
  margin-bottom: 30px;
}

.drop-zones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.drop-zone {
  background: white;
  border-radius: 16px;
  border: 3px dashed #e5e7eb;
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 200px;
}

.drop-zone.drag-over {
  border-style: solid;
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.category-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.category-info {
  flex: 1;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.category-description {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.dropped-items {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100px;
}

.dropped-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.dropped-item.correct {
  background: #d1fae5;
  border: 2px solid #10b981;
}

.dropped-item.incorrect {
  background: #fee2e2;
  border: 2px solid #ef4444;
}

.item-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 4px;
}

.item-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.correctness-indicator {
  font-size: 16px;
}

.drop-placeholder {
  color: #9ca3af;
  text-align: center;
  font-style: italic;
  padding: 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  margin: 16px;
}

.action-section {
  text-align: center;
  margin-bottom: 20px;
}

.check-btn {
  background: #FF007F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 0, 127, 0.3);
}

.check-btn:hover:not(:disabled) {
  background: #e6006f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 0, 127, 0.4);
}

.check-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.feedback-box.all-correct {
  border: 3px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.feedback-box.has-errors {
  border: 3px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
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
  margin: 0 0 16px 0;
}

.score-display {
  font-size: 18px;
  font-weight: 600;
  color: #4f46e5;
  background: #eef2ff;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

.continue-btn {
  background: #FF007F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 0, 127, 0.3);
}

.continue-btn:hover {
  background: #e6006f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 0, 127, 0.4);
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
  .drag-drop-main-content {
    padding: 16px;
  }
  
  .question-title {
    font-size: 20px;
  }
  
  .instruction-text {
    font-size: 14px;
  }
  
  .drop-zones {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .draggable-items {
    gap: 8px;
    padding: 12px;
  }
  
  .draggable-item {
    min-width: 120px;
    padding: 8px 12px;
  }
  
  .category-header {
    padding: 12px;
  }
  
  .dropped-items {
    padding: 12px;
  }
  
  .feedback-box {
    padding: 20px;
  }
  
  .feedback-title {
    font-size: 20px;
  }
}
</style> 