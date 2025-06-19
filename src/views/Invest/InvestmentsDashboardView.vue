<template>
  <div class="investments-page-container">
    <PageHeader
        title="Inversiones"
        :show-back="false"
        :show-search="true"
        @right-action-clicked="handleSearch"
    >
      <!-- Se podría poner un botón de back si esta no es la raíz de /invest -->
      <!-- <template #left-icon> <button @click="$router.go(-1)">←</button> </template> -->
    </PageHeader>

    <main class="investments-content" v-if="dashboardData">
      <h2 class="section-title-invest">Rendimiento</h2> <!-- Renombrado para evitar conflicto -->
      <div class="time-filters">
        <button
            v-for="filter in timeFilters"
            :key="filter.value"
            class="time-filter-btn"
            :class="{ active: activeFilter === filter.value }"
            @click="changeFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="performance-summary">
        <div class="label">{{ dashboardData.performanceLabel }}</div>
        <div class="main-percentage" :class="getPerformanceColor(dashboardData.mainPercentage)">
            {{ formatMainPercentage(dashboardData.mainPercentage) }}
        </div>
        <div class="sub-info" v-html="dashboardData.subInfo"></div>
      </div>

      <LineChart
        v-if="dashboardData.chartData.series && dashboardData.chartData.series[0].data.length"
        :series="dashboardData.chartData.series"
        :categories="dashboardData.chartData.categories"
        chartHeight="180"
        :lineColor="getPerformanceColor(dashboardData.mainPercentage, true)"
        :showXAxisLabels="true"
        :showYAxisLabels="false"
        :showGrid="false"
        curve="smooth"
        style="margin-bottom: 5px;"
      />
      <div class="chart-labels" v-if="dashboardData.chartData.categories.length">
        <span v-for="(label, index) in dashboardData.chartData.categories" :key="index">
            {{ label }}
        </span>
      </div>

      <h2 class="section-title-invest" style="margin-top: 30px;">Inversiones</h2>
      <div class="investments-list" v-if="dashboardData.investments.length > 0">
        <InvestmentItem
          v-for="investment in dashboardData.investments"
          :key="investment.id"
          :investment="investment"
          @selected="navigateToDetail"
        />
      </div>
      <div v-else class="no-investments">No tienes inversiones activas.</div>
    </main>

    <div v-if="investStore.loading && !dashboardData" class="loading-message">Cargando inversiones...</div>
    <div v-if="investStore.error && !dashboardData" class="error-message-centered">{{ investStore.error }}</div>

    <!-- BottomNavigationBar es global -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import LineChart from '@/components/common/LineChart.vue';
import InvestmentItem from '@/components/invest/InvestmentItem.vue';

const router = useRouter();
const investStore = useInvestStore();

const dashboardData = computed(() => investStore.dashboardData);
const activeFilter = ref('allTime'); // 'allTime', '1year', '1month'

const timeFilters = [
  { label: 'Desde el inicio', value: 'allTime' },
  { label: '1 año', value: '1year' },
  { label: '1 mes', value: '1month' },
];

onMounted(() => {
  investStore.fetchInvestmentsDashboard(activeFilter.value);
});

const changeFilter = (filterValue) => {
  activeFilter.value = filterValue;
  investStore.fetchInvestmentsDashboard(filterValue);
};

const handleSearch = () => {
  router.push({ name: 'InvestmentSearch' });
};

const navigateToDetail = (investmentId) => {
  router.push({ name: 'InvestmentDetail', params: { id: investmentId } });
};

const formatMainPercentage = (value) => {
    if (value === null || value === undefined) return '0.0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

const getPerformanceColor = (value, forLine = false) => {
    if (value === null || value === undefined) return forLine ? '#757575' : '#555555'; // Gris para nulo/línea
    return value >= 0 ? '#4CAF50' : (forLine ? '#D32F2F' : '#D32F2F'); // Verde o Rojo
};

</script>

<style scoped>
/* Estilos de inversiones-grafica.html */
.investments-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
/* PageHeader maneja la cabecera */

.investments-content {
  padding: 20px 20px 0; /* No padding bottom, el scroll lo maneja */
  flex-grow: 1;
  overflow-y: auto; /* Permitir scroll solo para esta sección si es necesario */
}

.section-title-invest { /* Renombrado */
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
  text-align: left;
}

.time-filters {
  display: flex;
  justify-content: space-around; /* Distribuir espacio */
  background-color: #F5F3F7; /* Lila/gris pálido */
  border-radius: 25px; /* Muy redondeado */
  padding: 5px;
  margin-bottom: 20px;
}

.time-filter-btn {
  flex: 1; /* Ocupar espacio equitativamente */
  padding: 8px 10px;
  border: none;
  background-color: transparent;
  border-radius: 20px; /* Redondeado interno */
  font-size: 14px;
  font-weight: 500;
  color: #5C3A47; /* Texto rosa oscuro/púrpura */
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  text-align: center;
}

.time-filter-btn.active {
  background-color: #FFFFFF;
  color: #111111; /* Texto negro para activo */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.performance-summary {
  margin-bottom: 10px;
}

.performance-summary .label {
  font-size: 15px;
  color: #555555;
  margin-bottom: 5px;
}

.performance-summary .main-percentage {
  font-size: 32px;
  font-weight: bold;
  /* color se aplica dinámicamente */
  margin-bottom: 3px;
}
.performance-summary .main-percentage.positive { color: #4CAF50; }
.performance-summary .main-percentage.negative { color: #D32F2F; }


.performance-summary .sub-info {
  font-size: 14px;
  color: #777777;
}
/* El .percentage dentro de sub-info se maneja con v-html y estilos inline en el mockData */


/* LineChart (SVG) es un componente, su contenedor no necesita mucho estilo aquí */

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 5px; /* Ajustar para que las etiquetas se alineen con la gráfica */
  margin-bottom: 30px; /* Espacio antes de la lista de inversiones */
}
.chart-labels span {
  font-size: 12px;
  color: #757575;
}

.investments-list {
  padding: 0; /* La lista no necesita padding si los items lo tienen */
}
/* InvestmentItem es un componente */
.no-investments {
    text-align: center;
    color: #777;
    padding: 30px 0;
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
</style> 