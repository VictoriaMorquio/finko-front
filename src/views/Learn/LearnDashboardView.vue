<template>
  <div class="dashboard-page">
    <header class="dashboard-header">
      <img src="/images/finko-logo.png" alt="Finko Logo" class="logo">
    </header>

    <section class="progress-section" v-if="!learnStore.loading">
      <h2>Progreso general</h2>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: learnStore.generalProgress + '%' }"></div>
      </div>
      <span class="progress-percentage">{{ learnStore.generalProgress }}%</span>
    </section>

    <main class="units-section" v-if="!learnStore.loading && learnStore.units.length > 0">
      <h2 class="units-title">Unidades</h2>
      <div class="units-grid">
        <UnitCard
          v-for="unit in learnStore.units"
          :key="unit.id"
          :unit="unit"
          @selected="navigateToUnit"
        />
      </div>
    </main>

    <div v-if="learnStore.loading" class="loading-message">Cargando contenido...</div>
    <div v-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>

    <!-- BottomNavigationBar es global -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import UnitCard from '@/components/learn/UnitCard.vue';

const learnStore = useLearnStore();
const router = useRouter();

onMounted(() => {
  learnStore.fetchLearnDashboardData();
});

const navigateToUnit = (unitId) => {
  router.push({ name: 'UnitSkills', params: { unitId } });
};
</script>

<style scoped>
/* Estilos de aprende.html */
.dashboard-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* padding-bottom para nav bar se maneja en App.vue */
}

.dashboard-header {
  padding: 20px 20px 15px;
  text-align: center;
}

.dashboard-header .logo {
  width: 200px;
  height: auto;
}

.progress-section {
  padding: 0px 20px 25px;
}

.progress-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.progress-bar-track {
  background-color: #EAEAEA;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-bar-fill {
  background-color: #333333;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.progress-percentage {
  font-size: 14px;
  color: #555555;
}

.units-section {
  padding: 0 20px 30px;
  flex-grow: 1;
}

.units-section .units-title { /* Renombrado para evitar colisión con .page-title global */
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 20px;
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); /* Responsive */
  gap: 25px;
}
/* UnitCard es un componente */

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
  .units-grid {
    gap: 20px; /* Un poco menos de espacio */
  }
  .units-section .units-title {
    font-size: 22px;
  }
  /* UnitCard tiene su media query */
}
</style> 