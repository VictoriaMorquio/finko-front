/**
 * Utilidad para manejar la navegación entre diferentes tipos de steps en lecciones
 */

/**
 * Mapea tipos de step a nombres de rutas de Vue Router
 */
export const getRouteNameByStepType = (stepType) => {
  const routeMap = {
    'content': 'LessonContent',
    'quiz': 'LessonQuiz', 
    'true-false': 'TrueFalseStep',
    'drag-drop': 'DragDropStep'
  };
  
  return routeMap[stepType] || 'LessonContent'; // Fallback a content
};

/**
 * Navega al siguiente step de una lección determinando automáticamente el tipo
 * @param {Object} router - Vue Router instance
 * @param {string} lessonId - ID de la lección
 * @param {string} currentStepId - ID del step actual
 * @param {Array} steps - Array de steps de la lección con sus tipos
 * @param {boolean} isLastStep - Si es el último step
 */
export const navigateToNextStep = (router, lessonId, currentStepId, steps = [], isLastStep = false) => {
  if (isLastStep) {
    // Ir a la pantalla de lección completada
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    return;
  }

  // Buscar el step actual en el array
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  if (currentStepIndex === -1 || currentStepIndex >= steps.length - 1) {
    // No se encontró el step actual o es el último
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    return;
  }

  // Obtener el siguiente step
  const nextStep = steps[currentStepIndex + 1];
  const stepType = nextStep.type || 'content';
  const routeName = getRouteNameByStepType(stepType);
  
  // Parámetros de ruta para el siguiente step
  const routeParams = { lessonId, stepId: nextStep.id };
  
  router.push({ 
    name: routeName,
    params: routeParams
  });
};

/**
 * Navega al primer step de una lección
 * @param {Object} router - Vue Router instance  
 * @param {Object} lessonData - Datos de la lección con firstStepId
 */
export const navigateToFirstStep = (router, lessonData) => {
  if (!lessonData || !lessonData.allSteps || lessonData.allSteps.length === 0) {
    // Error manejado por el store
    return;
  }

  const firstStep = lessonData.allSteps[0];
  const lessonId = lessonData.id;
  const stepId = firstStep.id;

  navigateToStepByType(router, firstStep.type, lessonId, stepId);
};

/**
 * Extrae información de step desde parámetros de ruta
 * @param {Object} route - Vue Route object
 * @returns {Object} Información parseada del step
 */
export const parseStepInfo = (route) => {
  const lessonId = route.params.lessonId;
  const stepId = route.params.stepId;
  const currentStepNumber = parseInt(stepId?.split('s').pop()) || 1;
  
  return {
    lessonId,
    stepId,
    currentStepNumber
  };
};

/**
 * Verifica si hay repasos pendientes y navega apropiadamente
 * @param {Object} router - Vue Router instance
 * @param {Object} learnStore - Store de Learn
 * @param {string} lessonId - ID de la lección
 */
export const handleLessonCompletion = async (router, learnStore, lessonId) => {
  try {
    const reviewStatus = await learnStore.checkReviewStatus(lessonId);
    
    if (reviewStatus.hasPendingReviews) {
      await loadNextReviewStep(router, learnStore, lessonId);
    } else {
      router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    }
  } catch (error) {
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
  }
};

/**
 * Carga el siguiente step de repaso
 * @param {Object} router - Vue Router instance
 * @param {Object} learnStore - Store de Learn
 * @param {string} lessonId - ID de la lección
 */
export const loadNextReviewStep = async (router, learnStore, lessonId) => {
  try {
    const reviewStep = await learnStore.fetchNextReviewStep(lessonId);
    
    router.push({
      name: getRouteNameByStepType(reviewStep.type),
      params: { lessonId, stepId: reviewStep.id },
      query: { reviewMode: 'true' }
    });
    
  } catch (error) {
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
  }
};

/**
 * Maneja la navegación después de enviar una respuesta de quiz
 * @param {Object} router - Vue Router instance
 * @param {Object} learnStore - Store de Learn
 * @param {string} lessonId - ID de la lección
 * @param {string} stepId - ID del step actual
 * @param {Array} steps - Array de steps (para navegación normal)
 * @param {boolean} isLastStep - Si es el último step normal
 * @param {boolean} isReviewMode - Si está en modo repaso
 * @param {boolean} wasCorrect - Si la respuesta fue correcta
 */
export const handleQuizNavigation = async (router, learnStore, lessonId, stepId, steps = [], isLastStep = false, isReviewMode = false, wasCorrect = true) => {
  if (isReviewMode) {
    if (wasCorrect) {
      setTimeout(async () => {
        try {
          const reviewStatus = await learnStore.checkReviewStatus(lessonId);
          
          if (reviewStatus.hasPendingReviews) {
            await loadNextReviewStep(router, learnStore, lessonId);
          } else {
            router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
          }
        } catch (error) {
          router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
        }
      }, 500);
    } else {
      return 'retry';
    }
    
  } else if (isLastStep) {
    setTimeout(async () => {
      await handleLessonCompletion(router, learnStore, lessonId);
    }, 500);
    
  } else {
    setTimeout(() => {
      navigateToNextStep(router, lessonId, stepId, steps, isLastStep);
    }, 500);
  }
}; 