<template>
  <label :class="['option-label', { 'selected': isChecked }]">
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="isChecked"
      :required="required"
      :disabled="disabled"
      @change="$emit('update:modelValue', value)"
    />
    {{ label }}
  </label>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String, // Radio group name
  value: [String, Boolean, Number], // Value of this radio option
  modelValue: [String, Boolean, Number], // v-model binding
  label: String,
  required: Boolean,
  disabled: Boolean,
});
defineEmits(['update:modelValue']);

const isChecked = computed(() => props.modelValue === props.value);
</script>

<style scoped>
/* Copied from ejercicio-trueque.html .option-label */
.option-label {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  background-color: #FFFFFF;
  border: 1.5px solid #E0E0E0; /* Borde gris claro */
  border-radius: 12px;
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.option-label:hover:not(.disabled) {
  border-color: #BDBDBD;
}

.option-label input[type="radio"] {
  margin-right: 15px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid #757575;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: relative;
}

.option-label input[type="radio"]:checked {
  border-color: #333333;
}

.option-label input[type="radio"]:checked::before {
  content: '';
  display: block;
  width: 12px;
  height: 12px;
  background-color: #333333;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.option-label.selected {
  border-color: #333333;
  /* background-color: #F5F5F5; */
}

.option-label.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.option-label.disabled input[type="radio"] {
    cursor: not-allowed;
}

@media (max-width: 360px) {
  .option-label {
    font-size: 14px;
    padding: 16px 18px;
  }
}
</style> 