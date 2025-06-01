// Configuración de API
export const API_CONFIG = {
  // URL base del backend Spring Boot
  BASE_URL: 'https://localhost:8443',
  
  // Cambiar esto a false cuando quieras conectar con el backend real
  USE_MOCK_DATA: false,
  
  // Endpoints implementados en el backend que están listos para usar
  IMPLEMENTED_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup', 
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      UPDATE_ME: '/auth/me',
      CHANGE_PASSWORD: '/auth/me/password',
      PASSWORD_RESET: '/auth/password-reset',
      PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
      UPLOAD_PROFILE_PIC: '/auth/me/profile-pic',
      DELETE_ACCOUNT: '/auth/me/account'
    },
    SUPPORT: {
      CONTACT: '/support/contact',
      CONTACT_INFO: '/support/contact-info'
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