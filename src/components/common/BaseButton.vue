<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <div v-if="loading" class="loading-spinner"></div>
    <span v-if="!loading || !hideTextOnLoading">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'text', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  hideTextOnLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  'base-button',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-full-width': props.fullWidth,
    'btn-loading': props.loading,
    'btn-disabled': props.disabled
  }
])
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-family: inherit;
  text-decoration: none;
  gap: 8px;
}

.base-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

/* Variantes */
.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976D2;
}

.btn-secondary {
  background-color: #F5F5F5;
  color: #333333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #E0E0E0;
}

.btn-outline {
  background-color: transparent;
  color: #2196F3;
  border: 1px solid #2196F3;
}

.btn-outline:hover:not(:disabled) {
  background-color: #E3F2FD;
}

.btn-text {
  background-color: transparent;
  color: #2196F3;
  padding: 8px 12px;
}

.btn-text:hover:not(:disabled) {
  background-color: #E3F2FD;
}

.btn-danger {
  background-color: #F44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #D32F2F;
}

/* Tamaños */
.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.btn-medium {
  padding: 12px 20px;
  font-size: 16px;
  min-height: 44px;
}

.btn-large {
  padding: 16px 24px;
  font-size: 18px;
  min-height: 52px;
}

/* Estados */
.btn-full-width {
  width: 100%;
}

.btn-disabled,
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  cursor: wait;
}

/* Spinner de carga */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .btn-large {
    padding: 14px 20px;
    font-size: 16px;
  }
  
  .btn-medium {
    padding: 10px 18px;
    font-size: 15px;
  }
}
</style> 