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
  console.log('🚀 NAVEGACIÓN - navigateToNextStep llamado:', {
    lessonId,
    currentStepId,
    isLastStep,
    totalSteps: steps.length,
    allSteps: steps.map(s => ({ id: s.id, type: s.type }))
  });

  if (isLastStep) {
    console.log('✅ NAVEGACIÓN - Es el último step, yendo a LevelCompleted');
    // Ir a la pantalla de lección completada
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    return;
  }

  // Buscar el step actual en el array
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  console.log('🔍 NAVEGACIÓN - Índice del step actual:', currentStepIndex);
  
  if (currentStepIndex === -1) {
    console.error('❌ NAVEGACIÓN - Step actual NO encontrado en el array:', currentStepId);
    console.log('📋 NAVEGACIÓN - Steps disponibles:', steps.map(s => s.id));
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    return;
  }
  
  if (currentStepIndex >= steps.length - 1) {
    console.log('✅ NAVEGACIÓN - Llegamos al final de los steps, yendo a LevelCompleted');
    router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
    return;
  }

  // Obtener el siguiente step
  const nextStep = steps[currentStepIndex + 1];
  const stepType = nextStep.type || 'content';
  const routeName = getRouteNameByStepType(stepType);
  
  console.log('➡️ NAVEGACIÓN - Navegando al siguiente step:', {
    from: currentStepId,
    to: nextStep.id,
    type: stepType,
    routeName,
    stepIndex: currentStepIndex + 1,
    totalSteps: steps.length
  });
  
  // Parámetros de ruta para el siguiente step
  const routeParams = { lessonId, stepId: nextStep.id };
  
  router.push({ 
    name: routeName,
    params: routeParams
  });
};

/**
 * Navega a un step específico según su tipo
 * @param {Object} router - Vue Router instance
 * @param {string} stepType - Tipo del step 
 * @param {string} lessonId - ID de la lección
 * @param {string} stepId - ID del step
 */
export const navigateToStepByType = (router, stepType, lessonId, stepId) => {
  const routeName = getRouteNameByStepType(stepType);
  
  router.push({
    name: routeName,
    params: { lessonId, stepId }
  });
};

/**
 * Navega al primer step de una lección
 * @param {Object} router - Vue Router instance  
 * @param {Object} lessonData - Datos de la lección con firstStepId
 * @param {string} levelId - ID del nivel/lección (opcional, fallback)
 */
export const navigateToFirstStep = (router, lessonData, levelId = null) => {
  if (!lessonData) {
    console.error('navigateToFirstStep: No se proporcionaron datos de lección');
    return;
  }

  // Intentar obtener los steps de diferentes propiedades posibles
  const steps = lessonData.allSteps || lessonData.steps || [];
  
  if (!steps || steps.length === 0) {
    console.error('navigateToFirstStep: No se encontraron steps en la lección', lessonData);
    return;
  }

  const firstStep = steps[0];
  // Usar el ID de lessonData o el levelId como fallback
  const lessonId = lessonData.id || levelId;
  const stepId = firstStep.id;

  if (!lessonId) {
    console.error('navigateToFirstStep: No se pudo determinar lessonId', { lessonData, levelId });
    return;
  }

  console.log('navigateToFirstStep: Navegando a', { lessonId, stepId, stepType: firstStep.type });
  
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
  console.log('🎯 QUIZ NAV - handleQuizNavigation iniciado:', {
    lessonId,
    stepId,
    isLastStep,
    isReviewMode,
    wasCorrect,
    totalSteps: steps.length
  });

  if (isReviewMode) {
    console.log('🔄 QUIZ NAV - Estamos en modo repaso');
    if (wasCorrect) {
      console.log('✅ QUIZ NAV - Respuesta correcta en repaso, verificando más repasos...');
      setTimeout(async () => {
        try {
          const reviewStatus = await learnStore.checkReviewStatus(lessonId);
          console.log('📊 QUIZ NAV - Estado de repasos:', reviewStatus);
          
          if (reviewStatus.hasPendingReviews) {
            console.log('📝 QUIZ NAV - Hay más repasos pendientes, cargando siguiente...');
            await loadNextReviewStep(router, learnStore, lessonId);
          } else {
            console.log('🏁 QUIZ NAV - No hay más repasos, lección completada');
            router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
          }
        } catch (error) {
          console.error('💥 QUIZ NAV - Error verificando repasos:', error);
          router.push({ name: 'LevelCompleted', params: { levelId: lessonId } });
        }
      }, 500);
    } else {
      console.log('❌ QUIZ NAV - Respuesta incorrecta en repaso, permitiendo retry');
      return 'retry';
    }
    
  } else if (isLastStep) {
    console.log('🏁 QUIZ NAV - Es el último step normal, verificando completación...');
    setTimeout(async () => {
      await handleLessonCompletion(router, learnStore, lessonId);
    }, 500);
    
  } else {
    console.log('➡️ QUIZ NAV - Navegando al siguiente step normal...');
    setTimeout(() => {
      navigateToNextStep(router, lessonId, stepId, steps, isLastStep);
    }, 500);
  }
}; 