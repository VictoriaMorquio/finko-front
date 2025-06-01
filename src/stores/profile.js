import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import profileService from '@/api/profileService'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profileData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const justUpdated = ref(false)
  
  // Getters (obtener authStore dinámicamente)
  const userProfile = computed(() => {
    const authStore = useAuthStore()
    return authStore.currentUser
  })
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value)
  const wasJustUpdated = computed(() => justUpdated.value)
  
  // Actions
  const updateProfile = async (profileDetails) => {
    loading.value = true
    error.value = null
    
    // Obtener authStore dinámicamente para evitar instancias múltiples
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      error.value = "Usuario no autenticado."
      loading.value = false
      return
    }

    if (!profileDetails.currentPassword) {
      error.value = "Se requiere la contraseña actual para confirmar los cambios."
      loading.value = false
      return
    }

    // PROTEGER CONTRA CONFLICTOS: Marcar que estamos actualizando el perfil
    authStore.setUpdatingProfile(true)

    const oldUser = JSON.parse(JSON.stringify(authStore.currentUser))
    
    // Crear usuario actualizado
    const updatedLocalUser = {
      ...authStore.currentUser,
      username: profileDetails.username,
      email: profileDetails.email,
      fullname: profileDetails.name,
    }
    
    // ACTUALIZACIÓN OPTIMISTA usando el método robusto
    authStore.setUser(updatedLocalUser)

    try {
      const dataToSend = {
        username: profileDetails.username,
        email: profileDetails.email,
        fullname: profileDetails.name,
        currentPassword: profileDetails.currentPassword
      }
      
      const response = await profileService.updateUserProfile(authStore.currentUser.id, dataToSend)
      
      // Si el backend regeneró el token (cuando cambia username), actualizarlo
      if (response._tokenRegenerated && response._newToken) {
        authStore.updateToken(response._newToken)
      }
      
      // Actualizar usuario con los datos más recientes del backend
      const updatedUser = response.user || response
      authStore.setUser(updatedUser)
      
      // Marcar que se acaba de actualizar exitosamente
      justUpdated.value = true
      
    } catch (err) {
      error.value = err.message || 'Fallo al actualizar el perfil.'
      authStore.setUser(oldUser)
      throw err
    } finally {
      // IMPORTANTE: Limpiar el flag al final SIEMPRE
      authStore.setUpdatingProfile(false)
      loading.value = false
    }
  }

  const logoutUser = async () => {
    loading.value = true
    const authStore = useAuthStore()
    try {
      await profileService.logout()
      authStore.logout()
    } catch (error) {
      console.error("Error during logout:", error)
      authStore.logout()
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (deleteData) => {
    loading.value = true
    error.value = null
    const authStore = useAuthStore()
    try {
      await profileService.deleteAccount(deleteData)
      authStore.logout()
    } catch (err) {
      error.value = err.message || "Error al eliminar la cuenta."
      console.error("Error during account deletion:", err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const contactSupport = async (messageData) => {
    loading.value = true
    error.value = null
    try {
      const response = await profileService.contactSupport(messageData)
      loading.value = false
      return response
    } catch (err) {
      error.value = err.message || "Error al contactar con soporte."
      loading.value = false
      throw err
    }
  }

  const clearJustUpdated = () => {
    justUpdated.value = false
  }

  return {
    // State
    profileData,
    loading,
    error,
    justUpdated,
    // Getters
    userProfile,
    isLoading,
    hasError,
    wasJustUpdated,
    // Actions
    updateProfile,
    logoutUser,
    deleteAccount,
    contactSupport,
    clearJustUpdated
  }
}) 