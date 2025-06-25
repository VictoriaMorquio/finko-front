// Configuración de API
export const API_CONFIG = {
  // URL base usando el proxy de Vite
  BASE_URL: '/api',
  
  // Cambiar esto a false cuando quieras conectar con el backend real
  USE_MOCK_DATA: false, // Conectar con el backend real
  
  // Endpoints implementados en el backend que están listos para usar
  IMPLEMENTED_ENDPOINTS: {
    AUTH: {
      LOGIN: '/v1/auth/login',
      SIGNUP: '/v1/auth/signup', 
      LOGOUT: '/v1/auth/logout',
      ME: '/v1/auth/me',
      UPDATE_ME: '/v1/auth/me',
      CHANGE_PASSWORD: '/v1/auth/me/password',
      PASSWORD_RESET: '/v1/auth/password-reset',
      PASSWORD_RESET_CONFIRM: '/v1/auth/password-reset/confirm',
      UPLOAD_PROFILE_PIC: '/v1/auth/me/profile-pic',
      DELETE_ACCOUNT: '/v1/auth/me/account'
    },
    LEARN: {
      // ✅ TODOS LOS ENDPOINTS IMPLEMENTADOS Y FUNCIONANDO
      DASHBOARD: '/v1/learn/dashboard',
      UNIT_SKILLS: '/v1/learn/units/{unitId}/skills',
      SKILL_LESSONS: '/v1/learn/skills/{skillId}/lessons',
      LESSON_INTRO: '/v1/learn/lessons/{lessonId}/intro',
      LESSON_STEPS: '/v1/learn/lessons/{lessonId}/steps',
      LESSON_STEP: '/v1/learn/lessons/{lessonId}/steps/{stepId}',
      LEVEL_COMPLETED: '/v1/learn/levels/{levelId}/completed',
      QUIZ_SUBMIT: '/v1/learn/quiz/submit',
      // ✅ NUEVOS ENDPOINTS DE SISTEMA DE REPASOS
      REVIEW_STATUS: '/v1/learn/lessons/{lessonId}/review/status',
      REVIEW_NEXT: '/v1/learn/lessons/{lessonId}/review/next',
      REVIEW_RESET: '/v1/learn/lessons/{lessonId}/review/reset'
    },
    SUPPORT: {
      CONTACT: '/v1/support/contact',
      CONTACT_INFO: '/v1/support/contact-info'
    },
    INVEST: {
      // ✅ ENDPOINT UNIFICADO IMPLEMENTADO
      SEARCH: '/v1/investments/search', // Maneja tanto lista como búsqueda
      // ✅ ENDPOINT DE DETALLE IMPLEMENTADO
      DETAIL: '/v1/investments/{investmentId}/details', // Detalle con datos históricos
      // ✅ ENDPOINT DE PERFORMANCE DASHBOARD IMPLEMENTADO
      PERFORMANCE: '/v1/performance/client/{filter}' // Dashboard de rendimiento con filtros
    }
  }
}

// Función helper para verificar si un endpoint está implementado
export const isEndpointImplemented = (category, endpoint) => {
  return API_CONFIG.IMPLEMENTED_ENDPOINTS[category]?.[endpoint] !== undefined
}

// Función para obtener la URL completa de un endpoint
export const getEndpointUrl = (category, endpoint) => {
  const path = API_CONFIG.IMPLEMENTED_ENDPOINTS[category]?.[endpoint]
  return path ? `${API_CONFIG.BASE_URL}${path}` : null
} 