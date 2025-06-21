<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <div class="success-section">
          <div class="success-icon">{{ icon }}</div>
          <p class="success-message">{{ message }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <BaseButton 
          variant="primary" 
          size="medium"
          @click="closeModal"
          full-width
        >
          Continuar
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '¡Operación Exitosa!'
  },
  message: {
    type: String,
    default: 'La operación se ha completado correctamente.'
  },
  icon: {
    type: String,
    default: '✅'
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
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

.success-section {
  text-align: center;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message {
  font-size: 16px;
  color: #333333;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  padding: 0 20px 20px 20px;
}

.modal-footer :deep(.btn-primary) {
  background-color: #2196F3 !important;
  color: white !important;
}

.modal-footer :deep(.btn-primary:hover:not(:disabled)) {
  background-color: #1976D2 !important;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-width: 100%;
  }
  
  .success-icon {
    font-size: 40px;
  }
  
  .success-message {
    font-size: 15px;
  }
}
</style> 