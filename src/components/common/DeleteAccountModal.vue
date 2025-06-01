<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">⚠️ Eliminar Cuenta</h2>
        <button class="close-button" @click="closeModal">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-section">
          <p class="warning-text">
            <strong>¿Estás seguro de que quieres eliminar tu cuenta?</strong>
          </p>
          <p class="warning-subtitle">
            Esta acción <strong>NO SE PUEDE DESHACER</strong> y eliminará permanentemente:
          </p>
          
        </div>

        <form @submit.prevent="handleConfirm" class="confirmation-form">
          <BaseInput
            id="currentPassword"
            v-model="formData.currentPassword"
            label="Confirma tu contraseña actual"
            type="password"
            name="currentPassword"
            placeholder="Escribe tu contraseña"
            required
            :disabled="isLoading"
          />

          <BaseInput
            id="confirmText"
            v-model="formData.confirmText"
            label="Escribe exactamente: DELETE_MY_ACCOUNT"
            name="confirmText"
            placeholder="DELETE_MY_ACCOUNT"
            required
            :disabled="isLoading"
          />

          <p v-if="error" class="error-message">{{ error }}</p>

          <div class="modal-actions">
            <BaseButton 
              type="button"
              variant="outline"
              size="medium"
              @click="closeModal"
              :disabled="isLoading"
              class="cancel-button"
            >
              Cancelar
            </BaseButton>
            
            <BaseButton 
              type="submit"
              variant="danger"
              size="medium"
              :disabled="isLoading || !isFormValid"
              class="delete-button"
            >
              {{ isLoading ? 'Eliminando...' : 'ELIMINAR CUENTA' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'confirm']);

const formData = ref({
  currentPassword: '',
  confirmText: ''
});

// Computed para validar que el formulario esté completo
const isFormValid = computed(() => {
  return formData.value.currentPassword.trim() !== '' && 
         formData.value.confirmText === 'DELETE_MY_ACCOUNT';
});

// Limpiar formulario cuando se abre/cierra el modal
watch(() => props.isVisible, (newValue) => {
  if (!newValue) {
    formData.value.currentPassword = '';
    formData.value.confirmText = '';
  }
});

const closeModal = () => {
  if (!props.isLoading) {
    emit('close');
  }
};

const handleClickOutside = () => {
  closeModal();
};

const handleConfirm = () => {
  if (isFormValid.value && !props.isLoading) {
    emit('confirm', {
      currentPassword: formData.value.currentPassword,
      confirmDelete: formData.value.confirmText
    });
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #D32F2F;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #F5F5F5;
}

.modal-body {
  padding: 0 24px 24px;
}

.warning-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #FFF3E0;
  border-radius: 12px;
  border-left: 4px solid #FF9800;
}

.warning-text {
  font-size: 16px;
  color: #E65100;
  margin: 0 0 12px 0;
}

.warning-subtitle {
  font-size: 14px;
  color: #BF360C;
  margin: 0 0 12px 0;
}

.warning-list {
  margin: 0;
  padding-left: 20px;
  color: #BF360C;
  font-size: 14px;
}

.warning-list li {
  margin-bottom: 6px;
}

.confirmation-form {
  margin-top: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button {
  flex: 1;
}

.delete-button {
  flex: 1;
}

/* Estilos personalizados para el botón de peligro */
:deep(.delete-button) {
  background-color: #D32F2F !important;
  color: white !important;
  border: none !important;
  font-weight: 600 !important;
}

:deep(.delete-button:hover:not(:disabled)) {
  background-color: #B71C1C !important;
}

:deep(.delete-button:disabled) {
  background-color: #CCCCCC !important;
  color: #888888 !important;
  cursor: not-allowed !important;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  text-align: center;
  margin: 12px 0 0 0;
  padding: 8px;
  background-color: #FFEBEE;
  border-radius: 8px;
  border: 1px solid #FFCDD2;
}

/* Responsive */
@media (max-width: 500px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px 20px 0;
  }
  
  .modal-body {
    padding: 0 20px 20px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 