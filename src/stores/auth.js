import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/api/authService'

export const useAuthStore = defineStore('auth', () => {
  // ========================================
  // STATE - FUENTE ÚNICA DE VERDAD
  // ========================================
  const user = ref(null)
  const token = ref(localStorage.getItem('finko_auth_token') || null)
  const loading = ref(false)
  const error = ref(null)
  const isUpdatingProfile = ref(false)
  const lastSyncTime = ref(Date.now()) // Para debugging

  const router = useRouter()

  // ========================================
  // COMPUTED - REACTIVIDAD ROBUSTA
  // ========================================
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)

  // ========================================
  // WATCHERS - SINCRONIZACIÓN AUTOMÁTICA
  // ========================================
  
  // Sincronizar user.value con localStorage automáticamente
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('finkoUser', JSON.stringify(newUser))
      lastSyncTime.value = Date.now()
    } else {
      localStorage.removeItem('finkoUser')
    }
  }, { deep: true })

  // Sincronizar token con localStorage automáticamente
  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('finko_auth_token', newToken)
    } else {
      localStorage.removeItem('finko_auth_token')
    }
  })

  // ========================================
  // CORE METHODS - GESTIÓN ROBUSTA DE ESTADO
  // ========================================

  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
  }

  // ========================================
  // AUTH METHODS
  // ========================================

  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      setToken(response.token)
      setUser(response.user)
      
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
      setToken(response.token)
      setUser(response.user)
      
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
    setUser(null)
    setToken(null)
    error.value = null
    router.push({ name: 'Login' })
  }

  const fetchUser = async () => {
    if (!token.value) return null
    
    try {
      const userData = await authService.getCurrentUser()
      console.log('🔍 FETCHUSER - Datos recibidos del backend:', userData)
      console.log('🔍 FETCHUSER - ¿Tiene achievements?:', userData.achievements)
      console.log('🔍 FETCHUSER - Keys del usuario:', Object.keys(userData))
      setUser(userData)
      return userData
    } catch (err) {
      console.error('Error fetching user:', err)
      
      // Solo desloguear si es un error de autenticación (401, 403)
      // No desloguear por errores del servidor (500, etc.) o errores de red
      const errorMessage = err.message || ''
      const isAuthError = errorMessage.includes('401') || 
                         errorMessage.includes('403') || 
                         errorMessage.toLowerCase().includes('unauthorized') || 
                         errorMessage.toLowerCase().includes('forbidden') ||
                         errorMessage.toLowerCase().includes('token')
      
      if (isAuthError) {
        console.log('Authentication error detected, logging out')
        logout()
      }
      
      throw err
    }
  }

  // Método específico para refrescar datos del usuario (para stats, coins, etc.)
  const refreshUserData = async () => {
    if (!token.value || !user.value) return null
    
    // NO refrescar si estamos actualizando el perfil para evitar conflictos
    if (isUpdatingProfile.value) {
      return user.value
    }
    
    try {
      const userData = await authService.getCurrentUser()
      console.log('🔄 REFRESH USER - Datos recibidos del backend:', userData)
      console.log('🔄 REFRESH USER - ¿Tiene achievements?:', userData.achievements)
      setUser(userData)
      return userData
    } catch (err) {
      console.warn('Error refreshing user data:', err)
      // No desloguear en refresh, solo loggear el error
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
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error('Error parsing stored user:', e)
        }
      }
      
      // Luego validar/actualizar desde el servidor (solo si hay un usuario válido)
      if (user.value) {
        try {
          await fetchUser()
        } catch (err) {
          console.error('Auth initialization failed:', err)
          // fetchUser ya maneja si debe desloguear o no
        }
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Método para actualizar token cuando el backend regenera uno nuevo
  const updateToken = (newToken) => {
    setToken(newToken)
  }

  // Método para marcar que estamos actualizando el perfil
  const setUpdatingProfile = (isUpdating) => {
    isUpdatingProfile.value = isUpdating
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    isUpdatingProfile,
    lastSyncTime,
    // Computed
    isAuthenticated,
    currentUser,
    // Core methods
    setUser,
    setToken,
    // Auth methods
    login,
    signup,
    requestPasswordReset,
    confirmNewPassword,
    logout,
    fetchUser,
    refreshUserData,
    initializeAuth,
    clearError,
    updateToken,
    setUpdatingProfile
  }
}) 