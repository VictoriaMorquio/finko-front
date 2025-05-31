<template>
  <div class="skill-page-container">
    <PageHeader
        :show-back="true"
        :back-route="{ name: 'LearnDashboard' }"
        :show-logo="true"
    />

    <main class="skill-main-content" v-if="unitData">
      <h1 class="unit-main-title">{{ unitData.title }}</h1>
      <div class="skills-grid" v-if="unitData.skills && unitData.skills.length > 0">
        <SkillCard
          v-for="skill in unitData.skills"
          :key="skill.id"
          :skill="skill"
          @selected="navigateToSkill"
        />
      </div>
      <div v-else class="no-skills-message">Próximamente más habilidades.</div>
    </main>

    <div v-if="learnStore.loading" class="loading-message">Cargando habilidades...</div>
    <div v-if="learnStore.error && !unitData" class="error-message-centered">{{ learnStore.error }}</div>

    <!-- BottomNavigationBar es global -->
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import PageHeader from '@/components/common/PageHeader.vue';
import SkillCard from '@/components/learn/SkillCard.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const unitId = route.params.unitId;

onMounted(() => {
  learnStore.fetchUnitSkills(unitId);
});

const unitData = computed(() => learnStore.currentUnitSkills);

const navigateToSkill = (skillId) => {
  // La navegación a una lección/habilidad puede ser compleja.
  // Podría ir a una pantalla de "Introducción a la Lección" o directamente al primer paso.
  // Asumimos que cada skill ID mapea a un ID de lección/intro.
  router.push({ name: 'LevelIntro', params: { lessonId: skillId } });
};
</script>

<style scoped>
/* Estilos de unidad-habilidades.html */
.skill-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* PageHeader maneja la cabecera. El logo inline se controla por props. */

.skill-main-content {
  padding: 20px 20px 30px;
  flex-grow: 1;
}

.unit-main-title { /* Título "Unidad 1: Habilidades" */
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 30px;
  text-align: left;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); /* Responsive */
  gap: 30px 20px;
}
/* SkillCard es un componente */
.no-skills-message {
    text-align: center;
    color: #777;
    padding: 30px;
    font-size: 16px;
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

@media (max-width: 360px) {
  .skills-grid {
    gap: 20px;
  }
  .unit-main-title {
    font-size: 22px;
  }
  /* SkillCard tiene su media query */
}
</style> 