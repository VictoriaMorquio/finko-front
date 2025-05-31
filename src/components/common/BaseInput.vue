<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'has-error': hasError, 'is-focused': isFocused }">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="base-input"
        @input="updateValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    
    <div v-if="hasError && errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="helpText && !hasError" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  },
  autocomplete: {
    type: String,
    default: 'off'
  }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)
const inputId = `input-${Math.random().toString(36).substr(2, 9)}`

const hasError = computed(() => Boolean(props.errorMessage))

const updateValue = (event) => {
  let value = event.target.value
  
  // Convertir a número si es tipo number
  if (props.type === 'number' && value !== '') {
    value = Number(value)
  }
  
  emit('update:modelValue', value)
}
</script>

<style scoped>
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.required-asterisk {
  color: #F44336;
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
  outline: none;
}

.base-input::placeholder {
  color: #999999;
}

.base-input:focus {
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.input-wrapper.has-error .base-input {
  border-color: #F44336;
}

.input-wrapper.has-error .base-input:focus {
  border-color: #F44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.base-input:disabled {
  background-color: #F5F5F5;
  color: #999999;
  cursor: not-allowed;
}

.input-suffix {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  color: #666666;
  pointer-events: none;
}

.error-message {
  color: #F44336;
  font-size: 14px;
  margin-top: 6px;
  line-height: 1.4;
}

.help-text {
  color: #666666;
  font-size: 14px;
  margin-top: 6px;
  line-height: 1.4;
}

/* Estilos específicos para tipos de input */
.base-input[type="number"] {
  -moz-appearance: textfield;
}

.base-input[type="number"]::-webkit-outer-spin-button,
.base-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .base-input {
    font-size: 16px; /* Evita zoom en iOS */
  }
}
</style> 