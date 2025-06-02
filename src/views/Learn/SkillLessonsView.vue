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
import { onMounted, computed, watch } from 'vue';
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
  
  // 🎉 Detectar si se regresa de una lección recién completada
  if (route.query.refreshed === 'true') {
    console.log('🎯 Usuario regresó tras completar lección - datos actualizados');
    // Limpiar el query parameter
    router.replace({ name: 'SkillLessons', params: { skillId } });
  }
});

const skillData = computed(() => learnStore.currentSkillLessons);

// 🔄 Observar cambios en los datos para detectar actualizaciones
watch(() => skillData.value, (newData, oldData) => {
  if (newData && oldData && route.query.refreshed === 'true') {
    console.log('✅ Datos de lecciones actualizados tras completación');
  }
}, { deep: true });

// Procesar las lecciones para implementar el sistema progresivo CON VERIFICACIÓN ESTRICTA
const processedLessons = computed(() => {
  if (!skillData.value || !skillData.value.lessons) return [];
  
  const lessons = [...skillData.value.lessons];
  let foundIncomplete = false;
  
  console.log('🔒 Procesando lecciones con verificación estricta:', lessons.map(l => ({
    id: l.id,
    status: l.status,
    progress: l.progress
  })));
  
  return lessons.map((lesson, index) => {
    // La primera lección siempre está disponible
    if (index === 0) {
      const isCompleted = isLessonStrictlyCompleted(lesson);
      return {
        ...lesson,
        status: isCompleted ? 'completed' : 'available'
      };
    }
    
    // Si ya encontramos una lección incompleta, las siguientes están bloqueadas
    if (foundIncomplete) {
      return {
        ...lesson,
        status: 'locked'
      };
    }
    
    // Verificar si la lección anterior está ESTRICTAMENTE completada
    const previousLesson = lessons[index - 1];
    const isPreviousCompleted = isLessonStrictlyCompleted(previousLesson);
    
    if (isPreviousCompleted) {
      // ✅ Anterior completa = esta puede estar disponible
      const isCurrentCompleted = isLessonStrictlyCompleted(lesson);
      if (isCurrentCompleted) {
        return { ...lesson, status: 'completed' };
      } else {
        foundIncomplete = true;
        return { ...lesson, status: 'available' };
      }
    } else {
      // ❌ Anterior incompleta = esta y siguientes bloqueadas
      foundIncomplete = true;
      return { ...lesson, status: 'locked' };
    }
  });
});

// 🔒 FUNCIÓN DE VERIFICACIÓN ESTRICTA
const isLessonStrictlyCompleted = (lesson) => {
  // Verificaciones múltiples para asegurar completación real:
  const hasCompletedStatus = lesson.status === 'completed';
  const hasFullProgress = lesson.progress === 100;
  
  // Solo considerar completada si AMBAS condiciones se cumplen
  const isStrictlyCompleted = hasCompletedStatus && hasFullProgress;
  
  if (hasCompletedStatus !== hasFullProgress) {
    console.warn(`⚠️ Inconsistencia detectada en lección ${lesson.id}:`, {
      status: lesson.status,
      progress: lesson.progress,
      strictCheck: isStrictlyCompleted
    });
  }
  
  return isStrictlyCompleted;
};

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