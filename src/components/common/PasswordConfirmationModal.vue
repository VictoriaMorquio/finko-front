<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Confirmar cambios</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          Por seguridad, ingresa tu contraseña actual para confirmar los cambios en tu perfil:
        </p>
        
        <form @submit.prevent="confirmChanges">
          <BaseInput
            id="modalPassword"
            v-model="password"
            label="Contraseña actual"
            type="password"
            name="modalPassword"
            placeholder="Ingresa tu contraseña actual"
            required
          />
          
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
      
      <div class="modal-footer">
        <BaseButton 
          variant="outline" 
          size="medium"
          @click="closeModal"
          :disabled="isLoading"
        >
          Cancelar
        </BaseButton>
        
        <BaseButton 
          variant="primary" 
          size="medium"
          @click="confirmChanges"
          :disabled="!password || isLoading"
        >
          {{ isLoading ? 'Confirmando...' : 'Confirmar cambios' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
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

const password = ref('');

// Limpiar contraseña cuando se abre/cierra el modal
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    password.value = '';
    // Enfocar el input cuando se abre el modal
    await nextTick();
    const input = document.getElementById('modalPassword');
    if (input) {
      input.focus();
    }
  }
});

const closeModal = () => {
  password.value = '';
  emit('close');
};

const confirmChanges = () => {
  if (!password.value) return;
  emit('confirm', password.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111111;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #111111;
}

.modal-body {
  padding: 20px;
}

.modal-description {
  font-size: 14px;
  color: #666666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px 20px;
}

.modal-footer :deep(.btn-outline) {
  flex: 1;
  border: 2px solid #E0E0E0 !important;
  color: #666666 !important;
  background-color: transparent !important;
}

.modal-footer :deep(.btn-outline:hover:not(:disabled)) {
  border-color: #FF007F !important;
  color: #FF007F !important;
}

.modal-footer :deep(.btn-primary) {
  flex: 1;
  background-color: #FF007F !important;
  color: white !important;
}

.modal-footer :deep(.btn-primary:hover:not(:disabled)) {
  background-color: #E60072 !important;
}

.modal-footer :deep(.btn-primary:disabled) {
  background-color: #CCCCCC !important;
  cursor: not-allowed;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-width: 100%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer :deep(.btn-outline),
  .modal-footer :deep(.btn-primary) {
    width: 100%;
  }
}
</style> 