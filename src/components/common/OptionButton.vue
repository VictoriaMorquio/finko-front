<template>
  <button
    type="button"
    :class="['option-button', { 'selected': selected, 'correct': correct, 'incorrect': incorrect }]"
    :disabled="disabled"
    @click="$emit('selected')"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  selected: Boolean,
  correct: Boolean,
  incorrect: Boolean,
  disabled: Boolean,
});
defineEmits(['selected']);
</script>

<style scoped>
/* Copied from leccion-pregunta-multiple.html .option-button */
.option-button {
  display: block;
  width: 100%;
  padding: 18px 20px;
  background-color: #F5F5F5; /* Gris muy claro para las opciones */
  color: #333333;
  border: 2px solid transparent; /* Borde transparente por defecto */
  border-radius: 12px;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
  line-height: 1.4;
}

.option-button:hover:not(:disabled) {
  border-color: #CCCCCC; /* Borde gris al pasar el ratón */
}

.option-button.selected {
  border-color: #4CAF50; /* Borde verde para la opción seleccionada */
  background-color: #E8F5E9; /* Fondo verde muy pálido para seleccionada */
  font-weight: 500;
}
.option-button.correct {
  border-color: #4CAF50 !important; /* Ensure override */
  background-color: #E8F5E9 !important;
  color: #2E7D32 !important;
  font-weight: 500;
}

.option-button.incorrect {
  border-color: #D32F2F !important;
  background-color: #FFEBEE !important;
  color: #C62828 !important;
  font-weight: 500;
}

.option-button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

@media (max-width: 360px) {
  .option-button {
    font-size: 14px;
    padding: 16px 18px;
  }
}
</style> 