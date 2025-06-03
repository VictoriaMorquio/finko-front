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

      <!-- ✅ INDICADOR DE MODO REPASO -->
      <div v-if="isReviewMode" class="review-indicator">
        <div class="review-badge">🔄 MODO REPASO</div>
        <p class="review-text">Clasifica correctamente los elementos que tuviste mal antes</p>
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
              @dragend="handleDragEnd($event)"
              @touchstart="handleTouchStart(item, $event)"
              @touchmove="handleTouchMove($event)"
              @touchend="handleTouchEnd($event)"
            >
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
              :data-category-id="category.id"
              :class="{ 
                'drag-over': dragOverCategory === category.id,
                'has-items': categoryItems[category.id]?.length > 0
              }"
              :style="{ borderColor: category.color }"
              @dragover.prevent="handleDragOver(category.id, $event)"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop(category.id, $event)"
            >
              <div class="category-header" :style="{ backgroundColor: category.color + '20' }">
                <div class="category-info">
                  <h4 class="category-title" :style="{ color: category.color }">{{ category.title }}</h4>
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

        <!-- Elemento que sigue al cursor durante drag -->
        <div 
          v-if="draggedItem || touchItem"
          class="drag-ghost"
          ref="dragGhost"
          :style="{ 
            left: ghostPosition.x + 'px', 
            top: ghostPosition.y + 'px',
            transform: 'translate(-50%, -50%)'
          }"
        >
          {{ (draggedItem?.text || touchItem?.text) }}
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
const backendResult = ref(null);

// Para el drag ghost
const ghostPosition = reactive({ x: 0, y: 0 });
const dragGhost = ref(null);

// Touch events para móviles
const touchStartPos = ref({ x: 0, y: 0 });
const touchItem = ref(null);

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
  // Si tenemos resultado del backend, usarlo
  if (backendResult.value !== null) {
    return backendResult.value.correct === true;
  }
  
  // Fallback a evaluación local (para UI inmediata)
  return correctCount.value === totalItems.value && totalItems.value > 0;
});

// Drag and Drop handlers
const handleDragStart = (item, event) => {
  console.log('🎯 Drag started:', item, 'Event type:', event.type);
  draggedItem.value = item;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', item.id);
  event.target.style.opacity = '0.3';
  
  // Inicializar posición del fantasma
  ghostPosition.x = event.clientX;
  ghostPosition.y = event.clientY;
  
  // Crear un evento mousemove global para seguir al cursor
  document.addEventListener('dragover', updateGhostPosition);
};

const updateGhostPosition = (event) => {
  if (draggedItem.value || touchItem.value) {
    ghostPosition.x = event.clientX;
    ghostPosition.y = event.clientY;
  }
};

const handleDragEnd = (event) => {
  console.log('🎯 Drag ended, Event type:', event.type);
  event.target.style.opacity = '1';
  draggedItem.value = null;
  dragOverCategory.value = null;
  
  // Limpiar el listener global
  document.removeEventListener('dragover', updateGhostPosition);
};

const handleTouchStart = (item, event) => {
  console.log('📱 Touch started:', item);
  touchItem.value = item;
  const touch = event.touches[0];
  touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  event.target.style.opacity = '0.3';
  
  // Inicializar posición del fantasma para touch
  ghostPosition.x = touch.clientX;
  ghostPosition.y = touch.clientY;
};

const handleTouchMove = (event) => {
  if (!touchItem.value) return;
  event.preventDefault(); // Prevenir scroll
  
  const touch = event.touches[0];
  // Actualizar posición del fantasma
  ghostPosition.x = touch.clientX;
  ghostPosition.y = touch.clientY;
  
  console.log('📱 Touch moving to:', ghostPosition);
};

const handleTouchEnd = (event) => {
  console.log('📱 Touch ended');
  if (!touchItem.value) return;
  
  const touch = event.changedTouches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Buscar la zona de drop más cercana
  const dropZone = elementBelow?.closest('.drop-zone');
  if (dropZone) {
    const categoryId = dropZone.getAttribute('data-category-id');
    if (categoryId) {
      console.log('📱 Touch drop in category:', categoryId);
      // Simular drop
      if (!categoryItems[categoryId]) {
        categoryItems[categoryId] = [];
      }
      categoryItems[categoryId].push({ ...touchItem.value });
    }
  }
  
  event.target.style.opacity = '1';
  touchItem.value = null;
};

const handleDragOver = (categoryId, event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  dragOverCategory.value = categoryId;
  console.log('🎯 Dragging over category:', categoryId);
};

const handleDragLeave = (event) => {
  // Solo limpiar si realmente salimos del área (no de un elemento hijo)
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    dragOverCategory.value = null;
  }
};

const handleDrop = (categoryId, event) => {
  event.preventDefault();
  console.log('🎯 Drop in category:', categoryId, 'item:', draggedItem.value);
  dragOverCategory.value = null;
  
  if (draggedItem.value) {
    // Inicializar array si no existe
    if (!categoryItems[categoryId]) {
      categoryItems[categoryId] = [];
    }
    
    // Agregar item a la categoría
    categoryItems[categoryId].push({ ...draggedItem.value });
    console.log('🎯 Item added to category:', categoryId, categoryItems[categoryId]);
    draggedItem.value = null;
  }
};

const checkAnswers = async () => {
  if (!allItemsPlaced.value || loading.value) return;
  
  loading.value = true;
  
  try {
    // Marcar respuestas correctas/incorrectas localmente primero
    Object.keys(categoryItems).forEach(categoryId => {
      categoryItems[categoryId].forEach(item => {
        item.isCorrect = item.correctCategory === categoryId;
      });
    });
    
    exerciseCompleted.value = true;
    
    // 🔥 FORMATO CORRECTO: Enviar Map de itemId -> categoryId como espera el backend
    try {
      // Construir el Map que el backend espera: { "item1": "categoria1", "item2": "categoria2" }
      const dragDropAnswerMap = {};
      
      // Iterar sobre todas las categorías y sus items colocados
      Object.entries(categoryItems).forEach(([categoryId, items]) => {
        items.forEach(item => {
          dragDropAnswerMap[item.id] = categoryId;
        });
      });
      
      console.log('📤 DRAG-DROP - Enviando respuesta en formato Map al backend:', {
        lessonId,
        stepId,
        answer: dragDropAnswerMap,
        type: 'drag-drop'
      });
      
      // ✅ LOGGING DETALLADO para debug
      console.log('🔍 DRAG-DROP - Detalles completos del envío:', {
        lessonId: lessonId,
        stepId: stepId,
        answerType: typeof dragDropAnswerMap,
        answerKeys: Object.keys(dragDropAnswerMap),
        answerValues: Object.values(dragDropAnswerMap),
        answerEntries: Object.entries(dragDropAnswerMap),
        rawAnswer: JSON.stringify(dragDropAnswerMap, null, 2),
        stepDataItems: stepData.value?.items?.map(item => ({ id: item.id, correctCategory: item.correctCategory }))
      });
      
      // Verificar que tenemos todos los items
      const totalExpectedItems = stepData.value?.items?.length || 0;
      const itemsInMap = Object.keys(dragDropAnswerMap).length;
      
      if (itemsInMap !== totalExpectedItems) {
        console.warn('⚠️ DRAG-DROP - Número de items no coincide:', {
          expected: totalExpectedItems,
          actual: itemsInMap,
          map: dragDropAnswerMap
        });
      }
      
      // Enviar el Map al backend (formato que espera el backend)
      const result = await learnStore.submitQuizAnswer(lessonId, stepId, dragDropAnswerMap);
      console.log('📥 DRAG-DROP - Respuesta del backend:', result);
      
      // ✅ ALMACENAR resultado del backend para la UI
      backendResult.value = result;
      
      // ✅ IMPORTANTE: Verificar si el backend procesó correctamente
      if (result && typeof result === 'object') {
        console.log('✅ DRAG-DROP - Backend respondió correctamente');
        
        // El backend ya evalúa automáticamente y registra para repasos si es necesario
        if (result.correct === false && !isReviewMode.value) {
          console.log('❌ DRAG-DROP - Backend detectó errores, registrados para repaso automáticamente');
        } else if (result.correct === true) {
          console.log('✅ DRAG-DROP - Backend confirma respuesta correcta');
        }
      } else {
        console.warn('⚠️ DRAG-DROP - Respuesta del backend inesperada:', result);
      }
      
    } catch (backendError) {
      console.error('💥 DRAG-DROP - Error enviando al backend:', backendError);
      console.error('💥 DRAG-DROP - Stack trace:', backendError.stack);
      
      // ⚠️ IMPORTANTE: Si el backend falla, el sistema de repasos no funcionará
      if (backendError.message?.includes('500') || backendError.message?.includes('Internal Server Error')) {
        console.error('🚨 DRAG-DROP - Error 500 del backend - El sistema de repasos NO funcionará');
      }
      
      // Continuar con la experiencia local aunque falle el backend
    }
    
  } catch (error) {
    console.error('💥 DRAG-DROP - Error verificando respuestas:', error);
  } finally {
    loading.value = false;
  }
};

const continueToNext = async () => {
  const steps = learnStore.currentLesson?.allSteps || [];
  const wasCorrect = allCorrect.value; // Si todas las respuestas fueron correctas
  const isCurrentlyLastStep = isLastStep.value;
  
  console.log('🚀 DRAG-DROP - continueToNext iniciado:', {
    lessonId,
    stepId,
    totalSteps: steps.length,
    isLastStep: isCurrentlyLastStep,
    wasCorrect,
    correctCount: correctCount.value,
    totalItems: totalItems.value
  });
  
  // Si es el último step, usar handleLessonCompletion para verificar repasos
  if (isCurrentlyLastStep) {
    console.log('🏁 DRAG-DROP - Es el último step, verificando repasos...');
    const { handleLessonCompletion } = await import('@/utils/stepNavigation');
    await handleLessonCompletion(router, learnStore, lessonId);
  } else {
    // Si no es el último step, navegar normalmente
    console.log('➡️ DRAG-DROP - Navegando al siguiente step...');
    const { navigateToNextStep } = await import('@/utils/stepNavigation');
    navigateToNextStep(router, lessonId, stepId, steps, isCurrentlyLastStep);
  }
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
  background: linear-gradient(135deg, #FFB74D 0%, #FF8A65 30%, #FF007F 70%, #F06292 100%);
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
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.instruction-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin: 0;
}

.section-title {
  color: white;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.items-section {
  margin-bottom: 30px;
}

.draggable-items {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 columnas de igual tamaño */
  gap: 12px;
  justify-items: center; /* Centrar elementos en cada columna */
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
  touch-action: none;
}

.draggable-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.draggable-item:active {
  cursor: grabbing;
  transform: scale(1.05);
}

.drag-ghost {
  position: fixed;
  top: 0;
  left: 0;
  background: white;
  border: 2px solid #FF007F;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  transform-origin: center;
  animation: pulse-drag 0.6s ease-in-out infinite alternate;
}

@keyframes pulse-drag {
  from { 
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 8px 25px rgba(255, 0, 127, 0.3);
  }
  to { 
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 10px 30px rgba(255, 0, 127, 0.5);
  }
}

.categories-section {
  margin-bottom: 30px;
}

.drop-zones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.category-info {
  flex: 1;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
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

.review-indicator {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.review-badge {
  background: #FF007F;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.review-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .drag-drop-main-content {
    padding: 16px;
  }
  
  .question-title {
    font-size: 19px;
  }
  
  .instruction-text {
    font-size: 13px;
  }
  
  .drop-zones {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .draggable-items {
    gap: 8px;
    padding: 12px;
    grid-template-columns: 1fr 1fr; /* Mantener 2 columnas en móvil también */
  }
  
  .draggable-item {
    min-width: 100px; /* Reducido para que quepan 2 en móvil */
    padding: 8px 12px;
    font-size: 13px; /* Texto un poco más pequeño en móvil */
  }
  
  .category-header {
    padding: 10px;
  }
  
  .dropped-items {
    padding: 10px;
  }
  
  .feedback-box {
    padding: 20px;
  }
  
  .feedback-title {
    font-size: 19px;
  }
}
</style> 