import { defineStore } from 'pinia'
import { ref } from 'vue'
import profileService from '@/api/profileService'
import { useAuthStore } from './auth'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profileData: null,
    loading: false,
    error: null,
  }),
  getters: {
    userProfile: (state) => {
      const authStore = useAuthStore()
      return authStore.currentUser
    },
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
  },
  actions: {
    async updateProfile(profileDetails) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      if (!authStore.currentUser) {
        this.error = "Usuario no autenticado."
        this.loading = false
        return
      }

      const oldUser = JSON.parse(JSON.stringify(authStore.currentUser))
      const updatedLocalUser = {
        ...authStore.currentUser,
        username: profileDetails.username,
        email: profileDetails.email,
        fullname: profileDetails.name,
      }
      authStore.user = updatedLocalUser
      localStorage.setItem('finkoUser', JSON.stringify(updatedLocalUser))

      try {
        const updatedUser = await profileService.updateUserProfile(authStore.currentUser.id, profileDetails)
        authStore.user = updatedUser
        localStorage.setItem('finkoUser', JSON.stringify(updatedUser))
      } catch (err) {
        this.error = err.message || 'Fallo al actualizar el perfil.'
        authStore.user = oldUser
        localStorage.setItem('finkoUser', JSON.stringify(oldUser))
        throw err
      } finally {
        this.loading = false
      }
    },
    async logoutUser() {
      const authStore = useAuthStore()
      this.loading = true
      try {
        await profileService.logout()
        authStore.logout()
      } catch (error) {
        console.error("Error during logout:", error)
        authStore.logout()
      } finally {
        this.loading = false
      }
    },
    async deleteAccount() {
      const authStore = useAuthStore()
      this.loading = true
      try {
        await profileService.deleteAccount(authStore.currentUser.id)
        authStore.logout()
      } catch (error) {
        this.error = error.message || "Error al eliminar la cuenta."
        console.error("Error during account deletion:", error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async contactSupport(messageData) {
      this.loading = true
      this.error = null
      try {
        const response = await profileService.contactSupport(messageData)
        this.loading = false
        return response
      } catch (error) {
        this.error = error.message || "Error al contactar con soporte."
        this.loading = false
        throw error
      }
    }
  }
}) 