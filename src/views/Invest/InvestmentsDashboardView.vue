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

    <main class="investments-content" v-if="chartDebug">
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
        <div class="label">{{ chartDebug.performanceLabel }}</div>
        <div class="main-percentage" :class="getPerformanceColor(chartDebug.mainPercentage)">
            {{ formatMainPercentage(chartDebug.mainPercentage) }}
        </div>
        <div class="sub-info" v-html="chartDebug.subInfo"></div>
      </div>

      <LineChart
        v-if="chartDebug.chartData && Array.isArray(chartDebug.chartData) && chartDebug.chartData.length > 0"
        :data="chartDataForLineChart"
        :height="180"
        :color="'#F72152'"
        :showGrid="false"
        :showTooltip="true"
        style="margin-bottom: 5px;"
      />
      <div v-else class="no-chart-data">
        🔍 DEBUG: No hay datos del gráfico
        <br>ChartData es array: {{ Array.isArray(chartDebug.chartData) }}
        <br>ChartData length: {{ chartDebug.chartData?.length || 0 }}
        <br>Primer elemento: {{ chartDebug.chartData?.[0] }}
        <br>ChartDataForLineChart length: {{ chartDataForLineChart?.length || 0 }}
        <br>Primer punto LineChart: {{ chartDataForLineChart?.[0] }}
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
const activeFilter = ref('1D'); // Cambio: usar '1D' como defecto

// Debug computed para verificar datos del gráfico
const chartDebug = computed(() => {
  const data = dashboardData.value;
  if (data) {
    console.log('🎯 Dashboard data en componente:', data);
    console.log('📊 Chart data:', data.chartData);
    console.log('📈 Series existe:', !!data.chartData?.series);
    console.log('🔢 Primera serie existe:', !!data.chartData?.series?.[0]);
    console.log('📊 Datos de primera serie:', data.chartData?.series?.[0]?.data);
    console.log('🏷️ Categories:', data.chartData?.categories);
  }
  return data;
});

// Computed para convertir datos al formato que espera LineChart
const chartDataForLineChart = computed(() => {
  const data = chartDebug.value;
  console.log('🔧 chartDataForLineChart - data:', data);
  console.log('🔧 chartDataForLineChart - chartData:', data?.chartData);
  
  // El backend devuelve chartData como array directo: [{date, x, y}, ...]
  if (!data?.chartData || !Array.isArray(data.chartData) || data.chartData.length === 0) {
    console.log('🔧 chartDataForLineChart - returning empty array');
    return [];
  }
  
  // Ya está en el formato correcto que espera LineChart
  const result = data.chartData; // Ya tiene formato [{x: timestamp, y: value}, ...]
  
  console.log('🔧 chartDataForLineChart - result:', result);
  return result;
});

const timeFilters = [
  { label: '1D', value: '1D' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' },
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
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 2px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.time-filters::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.time-filter-btn {
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
  background-color: #FFFFFF;
  color: #666666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 40px;
  text-align: center;
}

.time-filter-btn:hover {
  background-color: #F5F5F5;
  border-color: #D0D0D0;
}

.time-filter-btn.active {
  background-color: #F72152; /* Rosa fucsia como la gráfica */
  color: #FFFFFF; /* Texto blanco para activo */
  border-color: #F72152;
  box-shadow: 0 2px 4px rgba(247, 33, 82, 0.2);
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