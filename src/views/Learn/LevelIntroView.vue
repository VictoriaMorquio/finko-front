<template>
  <div class="level-intro-page" v-if="lessonIntro">
    <section class="hero-section">
      <router-link :to="{ name: 'SkillLessons', params: { skillId: getSkillIdFromLevelId(levelId) } }" class="close-btn" aria-label="Cerrar">×</router-link>
      <img :src="lessonIntro.image" :alt="lessonIntro.title" class="level-artwork">
    </section>

    <section class="details-section">
      <h1>{{ lessonIntro.title }}</h1>
      <p>{{ lessonIntro.description }}</p>
    </section>

    <footer class="action-footer">
      <BaseButton 
        variant="primary" 
        size="large"
        @click="startLesson" 
        full-width
        class="btn-comenzar"
      >
        Comenzar
      </BaseButton>
    </footer>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">Cargando...</div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { navigateToFirstStep } from '@/utils/stepNavigation';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const levelId = route.params.levelId; // Este ID es el de la habilidad/level

onMounted(() => {
  learnStore.fetchLessonIntro(levelId);
});

const lessonIntro = computed(() => learnStore.currentLesson);

const startLesson = async () => {
  try {
    // Resetear cola de repasos al comenzar lección desde el principio
    await learnStore.resetReviewQueue(levelId);
  } catch (error) {
    // No es crítico que falle el reset, continuamos de todas formas
  }
  
  // Siempre navegar al primer step, incluso si el reset falla
  navigateToFirstStep(router, lessonIntro.value);
};

// Función heurística para intentar obtener el unitId desde el levelId (skillId)
// Ejemplo: skillId = "skill1-2", unitId sería "unit1"
const getUnitIdFromLessonId = (levelId) => {
    if (levelId && levelId.startsWith('skill')) {
        return levelId.split('-')[0].replace('skill', 'unit');
    }
    return 'unit1'; // Fallback, idealmente esta info vendría de la API o store.
};

const getSkillIdFromLevelId = (levelId) => {
    // Patrones posibles:
    // - "skill1-1" -> "skill1" 
    // - "u1s1l1" -> "u1s1"
    // - "u1s1" -> "u1s1"
    
    if (levelId) {
        // Si tiene formato "skill1-1", extraer "skill1"
        if (levelId.startsWith('skill') && levelId.includes('-')) {
            const skillId = levelId.split('-')[0];
            return skillId;
        }
        
        // Si tiene formato "u1s1l1", extraer "u1s1"
        if (levelId.includes('l')) {
            const skillId = levelId.split('l')[0]; // "u1s1l1" -> "u1s1"
            return skillId;
        }
        
        // Si ya es un skillId (formato "u1s1"), devolverlo tal como está
        if (levelId.match(/^u\d+s\d+$/)) {
            return levelId;
        }
    }
    
    return 'u1s1'; // Fallback más realista
};

</script>

<style scoped>
/* Estilos de nivel-intro.html */
.level-intro-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hero-section {
  background-color: #FBEAE3;
  padding: 30px 20px 30px;
  text-align: center;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 25px;
  left: 20px;
  font-size: 28px;
  color: #333333;
  text-decoration: none;
  padding: 5px;
  z-index: 10;
}
.close-btn:hover {
  color: #000000;
}

.level-artwork {
  max-width: 240px;
  width: 70%;
  height: auto;
  margin-top: 20px; /* Para que no choque con flecha */
}

.details-section {
  background-color: #FFFFFF;
  padding: 40px 25px;
  text-align: center;
  flex-grow: 1;
}

.details-section h1 {
  font-size: 32px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 20px;
}

.details-section p {
  font-size: 17px;
  color: #333333;
  line-height: 1.6;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.action-footer {
  background-color: #FFFFFF;
  padding: 20px 25px 40px;
  text-align: center;
  position: sticky; /* Para que se quede abajo si el contenido es poco */
  bottom: 0;
}

/* Estilo del botón para coincidir con el de login */
.action-footer :deep(.btn-comenzar) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados como en login */
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important; /* Color fucsia igual que login */
  color: white !important;
}

.action-footer :deep(.btn-comenzar:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.action-footer :deep(.btn-comenzar:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* BaseButton usa variant finko-start-level */
.loading-message, .error-message-centered {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #555;
  height: 100vh; display: flex; justify-content: center; align-items: center;
}
.error-message-centered {
    color: red;
}

@media (max-width: 360px) {
  .close-btn { top: 20px; left: 15px; font-size: 26px; }
  .level-artwork { margin-top: 15px; }
  .details-section h1 { font-size: 28px; }
  .details-section p { font-size: 16px; }
  .hero-section { padding: 25px 15px 25px; }
  .details-section { padding: 30px 20px; }
  .action-footer { padding: 15px 20px 30px; }
}
</style> 