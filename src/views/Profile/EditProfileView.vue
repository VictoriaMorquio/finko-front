<template>
  <div class="edit-profile-page">
    <PageHeader
        title="Edit profile"
        :show-close="true"
        :back-route="{ name: 'Profile' }"
    />

    <main class="profile-form-section" v-if="form">
      <div class="profile-picture-container-edit">
        <img :src="getProfilePicUrl(authStore.currentUser?.profilePic)" alt="Foto de perfil" class="profile-picture-edit" @error="onImageError">
        <!-- Lógica para cambiar foto no implementada en este mock básico -->
      </div>
      <p class="username-display">@{{ authStore.currentUser?.username }}</p>

      <form id="editProfileForm" @submit.prevent="handleSaveProfile">
        <BaseInput
          id="username"
          v-model="form.username"
          label="Usuario"
          name="username"
          required
        />
        <BaseInput
          id="email"
          v-model="form.email"
          label="Email"
          type="email"
          name="email"
          required
        />
        <BaseInput
          id="name"
          v-model="form.name"
          label="Nombre"
          name="name"
          required
        />
        
        <p v-if="profileStore.error" class="error-message">{{ profileStore.error }}</p>
      </form>
      
      <!-- Botón para cambiar contraseña -->
      <div class="change-password-section">
        <BaseButton 
          variant="outline"
          size="medium"
          full-width
          class="btn-change-password-link"
          @click="navigateToChangePassword"
        >
          🔒 Cambiar Contraseña
        </BaseButton>
      </div>
    </main>
    <div v-else class="loading-spinner">Cargando...</div>

    <footer class="save-button-container">
      <BaseButton 
        type="submit" 
        form="editProfileForm" 
        :disabled="profileStore.isLoading || !hasChanges" 
        variant="primary"
        size="large"
        full-width
        class="btn-save-profile"
      >
        {{ profileStore.isLoading ? 'Guardando...' : 'Guardar cambios' }}
      </BaseButton>
    </footer>

    <!-- Modal de confirmación de contraseña -->
    <PasswordConfirmationModal
      :is-visible="showPasswordModal"
      :is-loading="profileStore.isLoading"
      :error="modalError"
      @close="closePasswordModal"
      @confirm="confirmWithPassword"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { API_CONFIG } from '@/config/api';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import PasswordConfirmationModal from '@/components/common/PasswordConfirmationModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const form = ref(null);
const originalData = ref(null); // Datos originales para comparar
const showPasswordModal = ref(false);
const modalError = ref('');
const pendingFormData = ref(null);

// Computed para verificar si hay cambios
const hasChanges = computed(() => {
  if (!form.value || !originalData.value) return false;
  
  return (
    form.value.username !== originalData.value.username ||
    form.value.email !== originalData.value.email ||
    form.value.name !== originalData.value.name
  );
});

onMounted(() => {
  if (authStore.currentUser) {
    const userData = {
      username: authStore.currentUser.username,
      email: authStore.currentUser.email,
      name: authStore.currentUser.fullname
    };
    
    form.value = { ...userData };
    originalData.value = { ...userData }; // Guardar datos originales
  } else {
    // Si el usuario no está cargado, podría ser un error o necesitar carga
    // El router guard debería haber manejado esto.
    router.push({ name: 'Login' });
  }
});

const handleSaveProfile = async () => {
  if (!form.value) return;
  
  // Limpiar errores previos
  profileStore.error = null;
  modalError.value = '';
  
  // Guardar los datos del formulario y mostrar el modal
  pendingFormData.value = { ...form.value };
  showPasswordModal.value = true;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  modalError.value = '';
  pendingFormData.value = null;
};

const confirmWithPassword = async (password) => {
  if (!pendingFormData.value || !password) return;
  
  modalError.value = '';
  
  try {
    // Agregar la contraseña a los datos del formulario
    const dataWithPassword = {
      ...pendingFormData.value,
      currentPassword: password
    };
    
    await profileStore.updateProfile(dataWithPassword);
    
    // Cerrar modal y volver al perfil
    closePasswordModal();
    router.push({ name: 'Profile' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    // Mostrar error en el modal
    modalError.value = error.message || 'Error al actualizar el perfil';
  }
};

const navigateToChangePassword = () => {
  router.push({ name: 'ChangePassword' });
};

const getProfilePicUrl = (profilePic) => {
  if (!profilePic) {
    return '/images/profile-pic-default.png';
  }
  
  // Si la URL ya es completa (empieza con http), la usamos tal como está
  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    return profilePic;
  }
  
  // Si es una ruta relativa, la construimos con la URL base del backend
  if (profilePic.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${profilePic}`;
  }
  
  // Si no tiene formato reconocido, usar imagen por defecto
  return '/images/profile-pic-default.png';
};

const onImageError = (event) => {
  console.warn("Error al cargar imagen del backend, usando imagen por defecto");
  event.target.src = '/images/profile-pic-default.png';
};
</script>

<style scoped>
/* Estilos de editar-perfil.html */
.edit-profile-page {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}
/* PageHeader maneja la cabecera */

.profile-form-section {
  padding: 30px 20px 20px; /* Reducido padding bottom */
  text-align: center;
}

.profile-form-section form {
  text-align: left; /* Alinear el formulario a la izquierda */
  margin-top: 20px; /* Espacio entre el username y el formulario */
}

/* Mantener centrados solo la foto y el username */
.profile-picture-container-edit,
.username-display {
  text-align: center;
}

.profile-picture-container-edit {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 10px auto;
  overflow: hidden;
  background-color: #FBEAE3;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.profile-picture-edit {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-form-section .username-display {
  font-size: 18px;
  font-weight: 500;
  color: #111111;
  margin-bottom: 30px;
}

.change-password-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #F0F0F0;
}

/* Estilo para el botón de cambiar contraseña */
.change-password-section :deep(.btn-change-password-link) {
  border: 2px solid #FF007F !important;
  color: #FF007F !important;
  background-color: transparent !important;
  font-weight: 600 !important;
}

.change-password-section :deep(.btn-change-password-link:hover:not(:disabled)) {
  background-color: #FF007F !important;
  color: white !important;
}

/* BaseInput maneja .form-group, label, input (color de fondo por defecto es el de signup, que es el que usa esta vista) */

.save-button-container {
  padding: 20px;
  background-color: #FFFFFF;
}

/* Personalización del botón de guardar para que coincida con el botón de login */
.save-button-container :deep(.btn-save-profile) {
  width: 100% !important;
  padding: 15px !important;
  background-color: #FF007F !important;
  color: white !important;
  font-weight: 600 !important;
  border: none !important;
  border-radius: 25px !important;
  font-size: 16px !important;
  transition: all 0.3s ease !important;
}

.save-button-container :deep(.btn-save-profile:hover:not(:disabled)) {
  background-color: #E6006B !important;
  transform: translateY(-1px) !important;
}

.save-button-container :deep(.btn-save-profile:disabled) {
  background-color: #CCCCCC !important;
  color: #888888 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.loading-spinner {
    text-align: center;
    padding: 50px 20px;
    font-size: 18px;
    color: #555;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 360px) {
  .profile-picture-container-edit { width: 90px; height: 90px; }
  .profile-form-section .username-display { font-size: 17px; }
  /* BaseInput y BaseButton tienen sus media queries */
}
</style> 