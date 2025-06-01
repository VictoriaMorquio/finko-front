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
    
    const config = {
      method: 'GET',
      headers: this.getDefaultHeaders(),
      ...options,
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error del servidor' }))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      // Si no hay contenido, devolver respuesta vacía
      if (response.status === 204) {
        return null
      }

      return await response.json()
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

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
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