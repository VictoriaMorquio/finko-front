<template>
  <div class="change-password-page">
    <PageHeader
        title="Cambiar Contraseña"
        :show-close="true"
        :back-route="{ name: 'EditProfile' }"
    />

    <main class="password-form-section">
      <div class="form-description">
        <p>Para cambiar tu contraseña, introduce tu contraseña actual y la nueva contraseña.</p>
      </div>

      <form id="changePasswordForm" @submit.prevent="handleChangePassword">
        <BaseInput
          id="currentPassword"
          v-model="form.currentPassword"
          label="Contraseña actual"
          type="password"
          name="currentPassword"
          :error="errors.currentPassword"
          required
        />
        
        <BaseInput
          id="newPassword"
          v-model="form.newPassword"
          label="Nueva contraseña"
          type="password"
          name="newPassword"
          :error="errors.newPassword"
          required
        />
        
        <BaseInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          label="Confirmar nueva contraseña"
          type="password"
          name="confirmPassword"
          :error="errors.confirmPassword"
          required
        />
        
        <div v-if="generalError" class="error-banner">
          {{ generalError }}
        </div>
        
        <div v-if="successMessage" class="success-banner">
          {{ successMessage }}
        </div>
      </form>
    </main>

    <footer class="save-button-container">
      <BaseButton 
        type="submit" 
        form="changePasswordForm" 
        :disabled="isLoading" 
        variant="primary"
        size="large"
        full-width
        class="btn-change-password"
      >
        {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
      </BaseButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const generalError = ref('');
const successMessage = ref('');

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const validateForm = () => {
  // Limpiar errores previos
  errors.currentPassword = '';
  errors.newPassword = '';
  errors.confirmPassword = '';
  let isValid = true;

  // Validar contraseña actual
  if (!form.currentPassword) {
    errors.currentPassword = 'La contraseña actual es requerida';
    isValid = false;
  }

  // Validar nueva contraseña
  if (!form.newPassword) {
    errors.newPassword = 'La nueva contraseña es requerida';
    isValid = false;
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'La nueva contraseña debe tener entre 8 y 128 caracteres';
    isValid = false;
  } else if (form.newPassword.length > 128) {
    errors.newPassword = 'La nueva contraseña debe tener entre 8 y 128 caracteres';
    isValid = false;
  }

  // Validar confirmación
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la nueva contraseña';
    isValid = false;
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
    isValid = false;
  }

  // Validar que la nueva contraseña sea diferente a la actual
  if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    isValid = false;
  }

  return isValid;
};

const handleChangePassword = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  generalError.value = '';
  successMessage.value = '';
  
  try {
    // Aquí iría la llamada al servicio para cambiar contraseña
    // Por ahora simularemos una llamada exitosa
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular API call
    
    // Simulamos éxito
    successMessage.value = 'Contraseña cambiada exitosamente';
    
    // Limpiar formulario
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      router.push({ name: 'Profile' });
    }, 2000);
    
  } catch (error) {
    generalError.value = error.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
    console.error('Change password error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.change-password-page {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.password-form-section {
  padding: 30px 20px 20px;
  text-align: left;
}

.form-description {
  text-align: center;
  margin-bottom: 30px;
}

.form-description p {
  font-size: 16px;
  color: #666666;
  line-height: 1.4;
}

.error-banner {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.success-banner {
  background-color: #e8f5e8;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.save-button-container {
  padding: 20px;
  background-color: #FFFFFF;
}

/* Personalización del botón para que coincida con otros botones principales */
.save-button-container :deep(.btn-change-password) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important;
  color: white !important;
}

.save-button-container :deep(.btn-change-password:hover:not(:disabled)) {
  background-color: #E60072 !important;
}

.save-button-container :deep(.btn-change-password:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 360px) {
  .form-description p {
    font-size: 15px;
  }
}
</style> 