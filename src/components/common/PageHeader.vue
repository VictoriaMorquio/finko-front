<template>
  <header class="page-header-generic" :style="{ backgroundColor: bgColor }">
    <button v-if="showBack || showClose" class="action-btn-header" @click="handleLeftAction" :aria-label="leftActionLabel">
      {{ showBack ? '←' : (showClose ? '×' : '') }}
    </button>
    <img v-if="showLogo" src="/images/finko-logo.png" alt="Finko Logo" class="header-logo-inline" />
    <h1 v-if="title" class="header-title" :style="{ left: (showBack || showClose) && !showLogo ? '-20px' : '0' }">
      {{ title }}
    </h1>
    <button v-if="showSettings || showSearch" class="right-action-btn-header" @click="handleRightAction" :aria-label="rightActionLabel">
      <slot name="right-icon">
        <!-- Default icons, can be overridden by slot -->
        <svg v-if="showSettings" viewBox="0 0 24 24">
          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
        </svg>
        <svg v-if="showSearch" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </slot>
    </button>
    <div v-if="!showSettings && !showSearch && (showBack || showClose)" class="header-spacer-right"></div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: String,
  showBack: Boolean,
  showClose: Boolean,
  showSettings: Boolean,
  showSearch: Boolean,
  showLogo: Boolean, // Para casos como SkillHeader
  backRoute: [String, Object], // Ruta a la que navegar al hacer "back"
  bgColor: {
    type: String,
    default: '#FFFFFF' // Default background
  }
});

const emit = defineEmits(['left-action-clicked', 'right-action-clicked']);
const router = useRouter();

const leftActionLabel = computed(() => {
  if (props.showBack) return 'Volver';
  if (props.showClose) return 'Cerrar';
  return '';
});

const rightActionLabel = computed(() => {
  if (props.showSettings) return 'Ajustes';
  if (props.showSearch) return 'Buscar';
  return '';
});

const handleLeftAction = () => {
  emit('left-action-clicked');
  if (props.showBack) {
    if (props.backRoute) {
      router.push(props.backRoute);
    } else {
      router.go(-1); // Comportamiento por defecto de "atrás"
    }
  } else if (props.showClose) {
    // Lógica de cerrar, podría ser router.go(-1) o una ruta específica
     if (props.backRoute) { // Reutilizar backRoute para cerrar también
      router.push(props.backRoute);
    } else {
      router.go(-1);
    }
  }
};

const handleRightAction = () => {
  emit('right-action-clicked');
  // La navegación para settings/search se manejará en la vista padre
  // o se pueden pasar rutas como props si es un comportamiento común.
};
</script>

<style scoped>
/* .page-header-generic, .action-btn-header, .header-title, .right-action-btn-header están en main.css */
.header-logo-inline {
  width: 90px; /* Ajustar según sea necesario */
  height: auto;
  /* Centrado si no hay título y solo flecha + logo */
  margin-left: auto;
  margin-right: auto;
  /* Ajuste si hay flecha + logo + título (el título debería tener flex-grow) */
}

.header-title {
  /* El ajuste de 'left' se hace condicionalmente en el template */
  /* Si solo hay título y botones a los lados, no necesita el 'left' negativo */
}

.header-spacer-right {
  width: 38px; /* Aproximadamente el ancho del action-btn-header para balancear si solo hay botón izquierdo */
  /* Esto es para centrar el título correctamente cuando solo hay un botón a la izquierda */
}

/* Asegurar que el título se centre incluso con un botón a la izquierda */
.page-header-generic:has(.action-btn-header:first-child:not(:only-child)) .header-title:not(:only-child) {
  /* Si hay un botón a la izquierda y el título no es el único hijo (o sea, hay algo más que el botón izquierdo) */
  /* Y no hay un botón a la derecha para balancear*/
  /* Este selector puede volverse complejo. A veces es más fácil usar flexbox y márgenes auto. */
}

.page-header-generic:has(.action-btn-header) .header-title:not(:has(+ .right-action-btn-header)) {
    position: relative;
    /* left: -20px;  Este ajuste se hace en el template ahora */
}
</style> 