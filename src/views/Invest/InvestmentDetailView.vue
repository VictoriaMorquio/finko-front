<template>
  <div class="investment-detail-page" v-if="detail">
    <PageHeader
        title="Invertir"
        :show-back="true"
        :back-route="{ name: 'InvestmentsDashboard' }"
        bg-color="#FDFBFC"
    />

    <main class="detail-content">
      <div class="investment-name">{{ detail.name }}</div>
      <div class="current-price">{{ formatCurrency(detail.currentPrice) }}</div>
      <div class="price-change" :class="getPriceChangeColor(detail.priceChange24h)">
        {{ formatPriceChange(detail.priceChange24h) }}
      </div>

      <!-- Gráfica de rendimiento específica de la inversión -->
      <div class="performance-section">
        <h3 class="performance-title">Rendimiento de {{ detail.stockSymbol || detail.name.split(' ')[0] }}</h3>
        
        <!-- Controles de intervalo de tiempo -->
        <div class="time-interval-controls">
          <button 
            v-for="interval in timeIntervals" 
            :key="interval.value"
            @click="changeTimeInterval(interval.value)"
            :class="['interval-btn', { active: selectedInterval === interval.value }]"
          >
            {{ interval.label }}
          </button>
        </div>

        <!-- Resumen de rendimiento -->
        <div class="performance-summary" v-if="detail.returnPercent !== null">
          <div class="performance-label">Rendimiento del período</div>
          <div class="performance-percentage" :class="getPerformanceColor(detail.returnPercent)">
            {{ formatPerformancePercentage(detail.returnPercent) }}
          </div>
          <div class="performance-subinfo">
            {{ getPerformanceSubInfo() }}
          </div>
        </div>

        <!-- Gráfica -->
        <LineChart
          v-if="detail.chartData && detail.chartData.length > 0"
          :data="detail.chartData"
          :height="180"
          :color="getChartLineColor()"
          :showGrid="false"
          :showTooltip="true"
          style="margin-bottom: 20px;"
        />
        
        <!-- Mensaje cuando no hay datos históricos -->
        <div v-if="!detail.chartData || detail.chartData.length === 0" 
             class="no-chart-data">
          <div class="no-data-message">
            <div class="no-data-icon">📊</div>
            <h4>No hay datos históricos disponibles</h4>
            <p>Esta inversión no tiene datos históricos de precios para el período seleccionado.</p>
            <p>Intenta cambiar el intervalo de tiempo o consulta más adelante.</p>
          </div>
        </div>
      </div>

      <!-- Métricas de la inversión -->
      <section class="investment-metrics">
        <h3 class="metrics-title">Métricas de la inversión</h3>
        <div class="metric-item" v-for="(metric, index) in detail.metrics" :key="index">
          <span class="metric-label">{{ metric.label }}</span>
          <span class="metric-value" :class="{ 'positive': metric.positive, 'negative': metric.positive === false }">
            {{ metric.value }}
          </span>
        </div>
      </section>

      <section class="about-section" v-if="detail.about">
        <h3>Sobre {{ detail.stockSymbol || detail.name.split('(')[0].trim() }}</h3>
        <p>{{ detail.about }}</p>
      </section>
    </main>

    <footer class="action-and-nav-footer">
      <div class="action-buttons">
        <BaseButton class="btn-buy" @click="navigateToBuy">Comprar</BaseButton>
        <BaseButton class="btn-sell" @click="navigateToSell" :disabled="!canSell">Vender</BaseButton>
      </div>
      <!-- BottomNavigationBar es global y se muestra aquí -->
    </footer>
  </div>
  <div v-else-if="investStore.loading" class="loading-message">Cargando detalle...</div>
  <div v-else-if="investStore.error" class="error-message-centered">{{ investStore.error }}</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import LineChart from '@/components/common/LineChart.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import testInvestmentDetail from '../../../test-investment-detail.js';

// Hacer disponible el script de prueba en la consola
if (typeof window !== 'undefined') {
  window.testInvestmentDetail = testInvestmentDetail;
}

const route = useRoute();
const router = useRouter();
const investStore = useInvestStore();
const investmentId = route.params.id;

// Estado para el intervalo de tiempo seleccionado
const selectedInterval = ref('1month'); // Por defecto 1 mes

// Definir intervalos de tiempo disponibles
const timeIntervals = [
  { value: '1week', label: '1S' },
  { value: '1month', label: '1M' },
  { value: '3months', label: '3M' },
  { value: '6months', label: '6M' },
  { value: '1year', label: '1A' },
  { value: 'all', label: 'Todo' }
];

onMounted(() => {
  // Cargar datos con el intervalo por defecto (1 mes)
  loadInvestmentData();
});

const detail = computed(() => {
  const data = investStore.currentInvestmentDetail;
  if (data && data.chartData) {
    console.log('🔍 Datos de gráfica:', {
      chartData: !!data.chartData,
      isArray: Array.isArray(data.chartData),
      dataLength: data.chartData?.length,
      hasData: data.chartData && data.chartData.length > 0
    });
  }
  return data;
});

const canSell = computed(() => {
    // Lógica para determinar si se puede vender (ej. si tiene acciones)
    return detail.value && detail.value.sharesOwned > 0;
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0,00€";
  return parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};

const formatPriceChange = (priceChange) => {
  if (priceChange === null || priceChange === undefined) return '0,00€';
  const value = parseFloat(priceChange);
  const isPositive = value >= 0;
  return `${isPositive ? '+' : ''}${value.toFixed(2)}€`;
};

const formatPerformancePercentage = (value) => {
  if (value === null || value === undefined) return '0.0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const priceChangeIsPositive = (priceChange) => {
    return priceChange !== null && priceChange !== undefined && parseFloat(priceChange) >= 0;
};

const getPriceChangeColor = (priceChange) => {
    if (priceChange === null || priceChange === undefined) return '';
    const value = parseFloat(priceChange);
    return value >= 0 ? 'positive-change' : 'negative-change';
};

const getPerformanceColor = (value) => {
    if (value === null || value === undefined) return 'neutral';
    return value >= 0 ? 'positive' : 'negative';
};

const getChartLineColor = () => {
    return '#F72152'; // Fucsia vibrante y sólido
};

const getPerformanceSubInfo = () => {
    if (!detail.value) return '';
    const interval = selectedInterval.value;
    const returnPercent = detail.value.returnPercent;
    
    if (returnPercent === null || returnPercent === undefined) return '';
    
    const sign = returnPercent >= 0 ? '+' : '';
    const period = getIntervalLabel(interval);
    return `${period} <span class="percentage">${sign}${returnPercent.toFixed(1)}%</span>`;
};

const getIntervalLabel = (interval) => {
    const labels = {
        '1week': 'Última semana',
        '1month': 'Último mes',
        '3months': 'Últimos 3 meses',
        '6months': 'Últimos 6 meses',
        '1year': 'Último año',
        'all': 'Desde el inicio'
    };
    return labels[interval] || 'Período seleccionado';
};

// Función para cambiar el intervalo de tiempo
const changeTimeInterval = async (interval) => {
  selectedInterval.value = interval;
  await loadInvestmentData();
};

// Función para cargar datos de inversión con el intervalo seleccionado
const loadInvestmentData = async () => {
  let startDate = null;
  let endDate = null;
  
  // Calcular fechas basadas en el intervalo seleccionado
  const today = new Date();
  const endDateObj = new Date();
  
  switch (selectedInterval.value) {
    case '1week':
      startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1month':
      // Usar un rango más amplio para asegurar que hay datos
      startDate = new Date('2024-05-18'); // Fecha que funciona en Postman
      endDate = new Date('2025-06-18');   // Fecha que funciona en Postman
      break;
    case '3months':
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6months':
      startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '1year':
      startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      // Para 'all' usar el rango completo que funciona en Postman
      startDate = new Date('2024-05-18');
      endDate = new Date('2025-06-18');
      break;
  }
  
  // Formatear fechas como YYYY-MM-DD
  if (startDate) {
    startDate = startDate.toISOString().split('T')[0];
  }
  if (endDate) {
    endDate = endDateObj.toISOString().split('T')[0];
  }
  
  console.log('📅 Fechas calculadas:', { 
    interval: selectedInterval.value, 
    startDate, 
    endDate,
    today: today.toISOString().split('T')[0]
  });
  
  // Cargar datos con los parámetros calculados
  await investStore.fetchInvestmentDetail(investmentId, selectedInterval.value, startDate, endDate);
};

const navigateToBuy = () => {
  router.push({ name: 'BuyStock', params: { id: investmentId } });
};

const navigateToSell = () => {
  router.push({ name: 'SellStock', params: { id: investmentId } });
};
</script>

<style scoped>
/* Estilos de detalle-inversion.html */
.investment-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FDFBFC; /* Blanco cálido/rosado */
  /* padding-bottom para botones + nav bar se maneja en App.vue y footer */
}

/* PageHeader maneja la cabecera */

.detail-content {
  padding: 10px 20px 20px;
  flex-grow: 1;
}

.investment-name {
  font-size: 18px;
  color: #444444;
  margin-bottom: 2px;
}

.current-price {
  font-size: 34px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 3px;
}

.price-change {
  font-size: 15px;
  font-weight: 500;
  color: #757575; /* Default, se sobreescribe con clases */
  margin-bottom: 25px;
}
.price-change.positive-change { color: #4CAF50; }
.price-change.negative-change { color: #D32F2F; }

/* Sección de rendimiento */
.performance-section {
  margin-bottom: 30px;
}

.performance-title {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
  text-align: left;
}

.performance-summary {
  margin-bottom: 15px;
}

.performance-summary .performance-label {
  font-size: 15px;
  color: #555555;
  margin-bottom: 5px;
}

.performance-summary .performance-percentage {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 3px;
}

.performance-summary .performance-percentage.positive { color: #4CAF50; }
.performance-summary .performance-percentage.negative { color: #D32F2F; }
.performance-summary .performance-percentage.neutral { color: #757575; }

.performance-summary .performance-subinfo {
  font-size: 14px;
  color: #777777;
}

.performance-summary .performance-subinfo .percentage {
  font-weight: 500;
}

/* Controles de intervalo de tiempo */
.time-interval-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 2px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.time-interval-controls::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.interval-btn {
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

.interval-btn:hover {
  background-color: #F5F5F5;
  border-color: #D0D0D0;
}

.interval-btn.active {
  background-color: #FF007F;
  color: white;
  border-color: #FF007F;
  box-shadow: 0 2px 4px rgba(255, 0, 127, 0.2);
}

/* Gráfica */
.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  margin-bottom: 20px;
}

.chart-labels span {
  font-size: 12px;
  color: #757575;
}

/* Métricas */
.metrics-title {
  font-size: 18px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
}

.investment-metrics {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 25px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 15px;
  border-bottom: 1px solid #F5F5F5;
}
.metric-item:last-child {
  border-bottom: none;
}
.metric-item .metric-label { color: #555555; }
.metric-item .metric-value { color: #111111; font-weight: 500; }
.metric-item .metric-value.positive { color: #4CAF50; }
.metric-item .metric-value.negative { color: #D32F2F; }

.about-section {
    margin-top: 25px;
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.about-section h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
}
.about-section p {
    font-size: 15px;
    color: #555;
    line-height: 1.6;
}

.action-and-nav-footer {
  position: fixed; /* Fijo abajo */
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FDFBFC;
  z-index: 1000; /* Por encima de la nav bar si es necesario, aunque App.vue maneja el espacio */
  padding-bottom: 70px; /* Espacio para la nav bar inferior que estará debajo */
}

.action-buttons {
  display: flex;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #EFE9EC; /* Línea sutil */
  background-color: #FDFBFC; /* Asegurar que tiene fondo */
}

.action-buttons .btn { /* Estilos base para los botones de acción */
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
/* BaseButton usará variants, pero podemos definir aquí si es más fácil */
.btn-buy { background-color: #FF007F; color: white; }
.btn-buy:hover { background-color: #E60072; }
.btn-sell { background-color: #8A8A8A; color: white; }
.btn-sell:hover { background-color: #707070; }
.btn-sell:disabled { background-color: #BDBDBD; cursor: not-allowed;}

.loading-message, .error-message-centered {
    text-align: center;
    padding: 40px 20px;
    font-size: 16px;
    color: #555;
    height: 100vh; display: flex; justify-content: center; align-items: center;
}
.error-message-centered { color: red; }

@media (max-width: 360px) {
  .current-price { font-size: 30px; }
  .metric-item { font-size: 14px; }
  .action-buttons .btn { font-size: 17px; padding: 15px; }
}

/* Mensaje cuando no hay datos */
.no-chart-data {
  margin: 20px 0;
  padding: 20px;
  background-color: #F8F9FA;
  border-radius: 12px;
  border: 1px solid #E9ECEF;
}

.no-data-message {
  text-align: center;
  color: #6C757D;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-data-message h4 {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.no-data-message p {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.no-data-message p:last-child {
  margin-bottom: 0;
  font-size: 13px;
  color: #868E96;
}
</style> 