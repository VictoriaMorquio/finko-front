import { API_CONFIG } from '../config/api.js'

// Cliente HTTP base para comunicarse con el backend
class HttpClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  // Obtener token del localStorage
  getAuthToken() {
    return localStorage.getItem('finko_auth_token')
  }

  // Configurar headers por defecto
  getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // Método base para realizar peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    console.log('🌐 HTTP Request:', {
      method: options.method || 'GET',
      url: url,
      headers: this.getDefaultHeaders()
    });
    
    const config = {
      method: 'GET',
      headers: this.getDefaultHeaders(),
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers
      }
    }

    // Si es una petición HTTPS directa al backend, configurar para certificados autofirmados
    if (url.startsWith('https://localhost:8443')) {
      // Para peticiones directas al backend con certificado autofirmado
      // En el navegador, esto requerirá que el usuario acepte el certificado manualmente
      console.log('🔒 Petición HTTPS directa al backend - Asegúrate de aceptar el certificado autofirmado');
    }

    try {
      const response = await fetch(url, config)
      
      console.log('📡 HTTP Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error del servidor' }))
        
        // Incluir el código de status en el mensaje de error para mejor manejo
        const errorMessage = errorData.message || `Error ${response.status}`
        const errorWithStatus = `${errorMessage} (${response.status})`
        
        throw new Error(errorWithStatus)
      }

      // Si no hay contenido, devolver respuesta vacía
      if (response.status === 204) {
        return null
      }

      const responseData = await response.json()
      
      // Si hay token regenerado en headers, incluirlo en la respuesta
      const tokenRegenerated = response.headers.get('X-Token-Regenerated')
      if (tokenRegenerated === 'true') {
        const newToken = response.headers.get('Authorization')?.replace('Bearer ', '') || 
                        response.headers.get('X-New-Token') ||
                        response.headers.get('Access-Token')
        
        if (newToken) {
          responseData._newToken = newToken
          responseData._tokenRegenerated = true
        }
      }
      
      return responseData
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Métodos de conveniencia
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint, data = null, options = {}) {
    const config = { ...options, method: 'DELETE' }
    
    // Si se proporciona data, incluirla en el cuerpo
    if (data !== null) {
      config.body = JSON.stringify(data)
    }
    
    return this.request(endpoint, config)
  }

  // Para subida de archivos
  async postFile(endpoint, formData, options = {}) {
    const headers = { ...this.getDefaultHeaders() }
    delete headers['Content-Type'] // Dejar que el browser configure el Content-Type para FormData

    return this.request(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: formData
    })
  }
}

export default new HttpClient() 