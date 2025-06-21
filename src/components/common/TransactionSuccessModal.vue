<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="transaction-success-card" @click.stop>
      <!-- Cabecera con botón cerrar -->
      <header class="success-header">
        <button class="close-btn" @click="closeModal" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>{{ title }}</h1>
      </header>

      <!-- Contenido principal -->
      <main class="success-main">
        <!-- Imagen de celebración con animación -->
        <div class="celebration-container">
          <div class="celebration-glow"></div>
          <div class="celebration-icon">{{ icon }}</div>
        </div>

        <!-- Contenido del mensaje -->
        <div class="success-content">
          <h2 class="success-title">{{ getSuccessTitle() }}</h2>
          <p class="success-message">{{ message }}</p>

          <!-- Tarjeta de información adicional -->
          <div class="transaction-info" v-if="showTransactionInfo">
            <div class="info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="info-text">Transacción completada exitosamente</span>
          </div>
        </div>

        <!-- Botón de continuar -->
        <div class="action-section">
          <BaseButton 
            variant="primary" 
            size="large"
            @click="closeModal"
            full-width
            class="btn-continuar-modern"
          >
            Continuar
          </BaseButton>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue';
import { computed } from 'vue';

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
  },
  transactionType: {
    type: String,
    default: 'transaction' // 'buy', 'sell', 'transaction'
  }
});

const emit = defineEmits(['close']);

const showTransactionInfo = computed(() => {
  return props.transactionType === 'buy' || props.transactionType === 'sell';
});

const getSuccessTitle = () => {
  switch (props.transactionType) {
    case 'buy':
      return '¡Compra Realizada!';
    case 'sell':
      return '¡Venta Realizada!';
    default:
      return '¡Éxito!';
  }
};

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
  background: linear-gradient(135deg, rgba(255, 183, 77, 0.9) 0%, rgba(255, 138, 101, 0.9) 30%, rgba(255, 0, 127, 0.9) 70%, rgba(240, 98, 146, 0.9) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.transaction-success-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.transaction-success-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FFB74D, #FF8A65, #FF007F);
}

.success-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: none;
}

.success-header .close-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #495057;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.success-header .close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000000;
}

.success-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.success-main {
  padding: 40px 30px;
  text-align: center;
}

.celebration-container {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.celebration-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 0, 127, 0.2) 0%, rgba(255, 0, 127, 0.05) 50%, transparent 70%);
  pointer-events: none;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  to {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.celebration-icon {
  font-size: 80px;
  position: relative;
  z-index: 1;
  animation: bounce 1s ease-in-out infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-10px);
  }
}

.success-content {
  margin-bottom: 30px;
}

.success-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #FF007F, #FF8A80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-message {
  font-size: 16px;
  color: #718096;
  margin-bottom: 30px;
  line-height: 1.6;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}

.transaction-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
  padding: 16px 24px;
  border-radius: 16px;
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 20px;
}

.transaction-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.info-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-text {
  font-size: 15px;
  color: #2E7D32;
  font-weight: 600;
}

.action-section {
  text-align: center;
  padding: 0 20px;
}

.btn-continuar-modern {
  width: calc(100% - 40px) !important;
  max-width: 280px !important;
  padding: 16px 24px !important;
  border: none !important;
  border-radius: 16px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  background: linear-gradient(135deg, #FF007F 0%, #e91e63 100%) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(255, 0, 127, 0.4) !important;
  text-transform: none !important;
  margin: 0 auto !important;
  display: block !important;
}

.btn-continuar-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(255, 0, 127, 0.5) !important;
}

.btn-continuar-modern:active {
  transform: translateY(0) !important;
}

.btn-continuar-modern:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* Responsive design */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 15px;
  }
  
  .transaction-success-card {
    border-radius: 20px;
  }
  
  .success-main {
    padding: 30px 20px;
  }
  
  .action-section {
    padding: 0 15px;
  }
  
  .btn-continuar-modern {
    width: calc(100% - 30px) !important;
  }
  
  .success-header h1 { 
    font-size: 18px; 
  }
  
  .success-title { 
    font-size: 28px; 
  }
  
  .success-message { 
    font-size: 15px; 
  }
  
  .info-text { 
    font-size: 14px; 
  }
  
  .celebration-icon {
    font-size: 60px;
  }
}

@media (max-width: 360px) {
  .transaction-success-card {
    margin: 10px;
  }
  
  .success-main {
    padding: 25px 15px;
  }
  
  .action-section {
    padding: 0 10px;
  }
  
  .btn-continuar-modern {
    width: calc(100% - 20px) !important;
  }
  
  .success-title { 
    font-size: 26px; 
  }
}
</style> 