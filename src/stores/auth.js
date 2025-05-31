import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/api/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('finkoAuthToken') || null)
  const loading = ref(false)
  const error = ref(null)

  const router = useRouter()
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('finkoAuthToken', response.token)
      localStorage.setItem('finkoUser', JSON.stringify(response.user))
      
      // Redirigir al dashboard después del login exitoso
      router.push({ name: 'LearnDashboard' })
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión'
      throw err
    } finally {
      loading.value = false
    }
  }

  const signup = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.signup(userData)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('finkoAuthToken', response.token)
      localStorage.setItem('finkoUser', JSON.stringify(response.user))
      
      // Redirigir al dashboard después del registro exitoso
      router.push({ name: 'LearnDashboard' })
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Error al registrarse'
      throw err
    } finally {
      loading.value = false
    }
  }

  const requestPasswordReset = async (emailOrUsername) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.requestPasswordReset(emailOrUsername)
      return response.message || 'Se ha enviado un enlace de recuperación a tu email.'
    } catch (err) {
      error.value = err.message || 'Error al enviar enlace de recuperación'
      throw err
    } finally {
      loading.value = false
    }
  }

  const confirmNewPassword = async (token, newPassword) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.confirmNewPassword(token, newPassword)
      // Después del reset exitoso, redirigir a login
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
      return response.message || 'Contraseña actualizada correctamente.'
    } catch (err) {
      error.value = err.message || 'Error al cambiar contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('finkoAuthToken')
    localStorage.removeItem('finkoUser')
    error.value = null
    router.push({ name: 'Login' })
  }

  const fetchUser = async () => {
    if (!token.value) return null
    
    try {
      const userData = await authService.getCurrentUser()
      user.value = userData
      localStorage.setItem('finkoUser', JSON.stringify(userData))
      return userData
    } catch (err) {
      console.error('Error fetching user:', err)
      logout()
      throw err
    }
  }

  // Inicializar usuario desde localStorage o fetch del servidor
  const initializeAuth = async () => {
    if (token.value) {
      // Primero intentar cargar desde localStorage
      const storedUser = localStorage.getItem('finkoUser')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
      
      // Luego validar/actualizar desde el servidor
      try {
        await fetchUser()
      } catch (err) {
        console.error('Auth initialization failed:', err)
        logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    currentUser,
    login,
    signup,
    requestPasswordReset,
    confirmNewPassword,
    logout,
    fetchUser,
    initializeAuth,
    clearError
  }
}) 