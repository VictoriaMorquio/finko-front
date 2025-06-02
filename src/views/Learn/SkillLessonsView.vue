<template>
  <div class="skill-lessons-container">
    <PageHeader
        :show-back="true"
        :back-route="{ name: 'UnitSkills', params: { unitId: getUnitIdFromSkillId(skillId) } }"
        :show-logo="true"
    />

    <main class="skill-lessons-content" v-if="skillData">
      <h1 class="skill-title">{{ skillData.title }}</h1>
      <div class="lessons-list" v-if="processedLessons && processedLessons.length > 0">
        <LessonCard
          v-for="lesson in processedLessons"
          :key="lesson.id"
          :lesson="lesson"
          @selected="navigateToLesson"
        />
      </div>
      <div v-else class="no-lessons-message">
        Próximamente más lecciones para esta habilidad.
      </div>
    </main>

    <div v-if="learnStore.loading" class="loading-message">Cargando lecciones...</div>
    <div v-if="learnStore.error && !skillData" class="error-message-centered">{{ learnStore.error }}</div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import PageHeader from '@/components/common/PageHeader.vue';
import LessonCard from '@/components/learn/LessonCard.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const skillId = route.params.skillId;

onMounted(() => {
  learnStore.fetchSkillLessons(skillId);
});

const skillData = computed(() => learnStore.currentSkillLessons);

// Procesar las lecciones para implementar el sistema progresivo
const processedLessons = computed(() => {
  if (!skillData.value || !skillData.value.lessons) return [];
  
  const lessons = [...skillData.value.lessons];
  let foundIncomplete = false;
  
  return lessons.map((lesson, index) => {
    // La primera lección siempre está disponible
    if (index === 0) {
      return {
        ...lesson,
        status: lesson.status === 'completed' ? 'completed' : 'available'
      };
    }
    
    // Si ya encontramos una lección incompleta, las siguientes están bloqueadas
    if (foundIncomplete) {
      return {
        ...lesson,
        status: 'locked'
      };
    }
    
    // Verificar si la lección anterior está completada
    const previousLesson = lessons[index - 1];
    if (previousLesson.status === 'completed') {
      // La lección anterior está completa, esta puede estar disponible
      if (lesson.status === 'completed') {
        return { ...lesson, status: 'completed' };
      } else {
        foundIncomplete = true;
        return { ...lesson, status: 'available' };
      }
    } else {
      // La lección anterior no está completa, esta y las siguientes están bloqueadas
      foundIncomplete = true;
      return { ...lesson, status: 'locked' };
    }
  });
});

const navigateToLesson = (lessonId) => {
  // Solo navegar si la lección no está bloqueada
  const lesson = processedLessons.value.find(l => l.id === lessonId);
  if (lesson && lesson.status !== 'locked') {
    // Aquí navegarás a donde necesites cuando el usuario pulse una lección disponible
    router.push({ name: 'LevelIntro', params: { levelId: lessonId } });
  }
};

// Función heurística para obtener unitId desde skillId
// Ejemplo: skillId = "u1s1" -> unitId = "u1"
const getUnitIdFromSkillId = (skillId) => {
  if (skillId && skillId.startsWith('u') && skillId.includes('s')) {
    return skillId.split('s')[0]; // "u1s1" -> "u1"
  }
  return 'u1'; // Fallback
};
</script>

<style scoped>
.skill-lessons-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.skill-lessons-content {
  padding: 20px;
  flex-grow: 1;
}

.skill-title {
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 24px;
  text-align: left;
}

.lessons-list {
  max-width: 600px;
  margin: 0 auto;
}

.no-lessons-message {
  text-align: center;
  color: #777;
  padding: 40px 20px;
  font-size: 16px;
  background: white;
  border-radius: 16px;
  margin-top: 20px;
}

.loading-message, .error-message-centered {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #555;
}

.error-message-centered {
  color: red;
}

@media (max-width: 480px) {
  .skill-lessons-content {
    padding: 16px;
  }
  
  .skill-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
}
</style> 