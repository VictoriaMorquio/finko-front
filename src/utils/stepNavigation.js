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
  if (!lessonData?.firstStepId) {
    console.error("No hay primer paso definido para esta lección.");
    router.push({ name: 'LearnDashboard' });
    return;
  }

  // Buscar el primer step si tenemos la lista completa
  let firstStep = null;
  if (lessonData.steps && lessonData.steps.length > 0) {
    firstStep = lessonData.steps.find(step => step.id === lessonData.firstStepId) || lessonData.steps[0];
  }

  const stepType = firstStep?.type || 'content';
  const routeName = getRouteNameByStepType(stepType);
  
  const routeParams = { lessonId: lessonData.id, stepId: lessonData.firstStepId };
  
  router.push({
    name: routeName,
    params: routeParams
  });
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
    console.log('🔍 Verificando estado de repasos para lección:', lessonId);
    const reviewStatus = await learnStore.checkReviewStatus(lessonId);
    
    if (reviewStatus.hasPendingReviews) {
      console.log('🔄 Hay repasos pendientes:', reviewStatus.pendingReviewsCount);
      
      // Opcional: mostrar mensaje explicativo
      // showReviewIntroModal(reviewStatus);
      
      // Cargar primer step de repaso
      await loadNextReviewStep(router, learnStore, lessonId);
    } else {
      console.log('✅ No hay repasos pendientes, completando lección');
      router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    }
  } catch (error) {
    console.error('❌ Error al verificar repasos:', error);
    // En caso de error, ir a completado
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
    console.log('📚 Cargando siguiente step de repaso...');
    const reviewStep = await learnStore.fetchNextReviewStep(lessonId);
    
    // Navegar al step de repaso usando el componente apropiado
    const routeName = getRouteNameByStepType(reviewStep.type);
    
    router.push({
      name: routeName,
      params: { lessonId, stepId: reviewStep.id },
      query: { reviewMode: 'true' } // Indicador opcional en URL
    });
    
  } catch (error) {
    console.log('✅ No hay más steps de repaso, completando lección');
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
  console.log('🔄 NAVIGATION - handleQuizNavigation called:', {
    lessonId,
    stepId,
    isLastStep,
    isReviewMode,
    wasCorrect,
    stepsCount: steps.length
  });
  
  if (isReviewMode) {
    // En modo repaso: comportamiento diferente según si acertaste o fallaste
    if (wasCorrect) {
      console.log('🔄 NAVIGATION - Review mode: Correct answer, checking for more reviews in 500ms');
      setTimeout(async () => {
        console.log('🔄 NAVIGATION - Timeout executed, checking review status...');
        try {
          const reviewStatus = await learnStore.checkReviewStatus(lessonId);
          console.log('🔄 NAVIGATION - Review status:', reviewStatus);
          
          if (reviewStatus.hasPendingReviews) {
            console.log('🔄 NAVIGATION - More reviews pending, loading next review step');
            await loadNextReviewStep(router, learnStore, lessonId);
          } else {
            console.log('🔄 NAVIGATION - No more reviews, completing lesson');
            router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
          }
        } catch (error) {
          console.error('🔄 NAVIGATION - Error checking reviews:', error);
          router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
        }
      }, 500); // Reducido de 2000ms a 500ms
    } else {
      console.log('🔄 NAVIGATION - Review mode: Incorrect answer, staying on same question for retry');
      // Si fallas en repaso, NO navegas - te quedas en la misma pregunta para intentar de nuevo
      // El componente debería resetear su estado para permitir otra respuesta
      return 'retry'; // Retornar señal para que el componente resetee estado
    }
    
  } else if (isLastStep) {
    console.log('🔄 NAVIGATION - Last step in normal mode, will check lesson completion in 500ms');
    // Último step normal: verificar repasos
    setTimeout(async () => {
      await handleLessonCompletion(router, learnStore, lessonId);
    }, 500); // Reducido de 2000ms a 500ms
    
  } else {
    console.log('🔄 NAVIGATION - Normal step navigation, will continue in 500ms');
    // Navegación normal entre steps
    setTimeout(() => {
      navigateToNextStep(router, lessonId, stepId, steps, isLastStep);
    }, 500); // Reducido de 2000ms a 500ms
  }
}; 