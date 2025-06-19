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
      <div class="price-change" :class="getPriceChangeColor(detail.priceChangePercent)">
        {{ formatPriceChange(detail.priceChangePercent) }}
      </div>

      <!-- Gráfica de rendimiento específica de la inversión -->
      <div class="performance-section">
       
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
  { value: '1day', label: '1D' },
  { value: '1month', label: '1M' },
  { value: '3months', label: '3M' },
  { value: '6months', label: '6M' },
  { value: '1year', label: '1A' },
  { value: '5years', label: '5A' }
];

onMounted(() => {
  // Cargar datos con el intervalo por defecto (1 mes)
  loadInvestmentData();
});

const detail = computed(() => {
  return investStore.currentInvestmentDetail;
});

const canSell = computed(() => {
    // Lógica para determinar si se puede vender (ej. si tiene acciones)
    return detail.value && detail.value.sharesOwned > 0;
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0,00€";
  return parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};

const formatPriceChange = (priceChangePercent) => {
  if (priceChangePercent === null || priceChangePercent === undefined) return '0.00%';
  const value = parseFloat(priceChangePercent);
  const isPositive = value >= 0;
  return `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
};

const formatPerformancePercentage = (value) => {
  if (value === null || value === undefined) return '0.0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const priceChangeIsPositive = (priceChange) => {
    return priceChange !== null && priceChange !== undefined && parseFloat(priceChange) >= 0;
};

const getPriceChangeColor = (priceChangePercent) => {
    if (priceChangePercent === null || priceChangePercent === undefined) return '';
    const value = parseFloat(priceChangePercent);
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
        '1day': 'Último día',
        '1month': 'Último mes',
        '3months': 'Últimos 3 meses',
        '6months': 'Últimos 6 meses',
        '1year': 'Último año',
        '5years': 'Últimos 5 años'
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
  let backendInterval = null;
  
  // Calcular fechas basadas en el intervalo seleccionado
  const today = new Date();
  
  switch (selectedInterval.value) {
    case '1day':
      startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1h'; // ✅ Backend espera '1h' para datos por horas
      break;
    case '1month':
      // Último mes real - dinámico
      startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1day'; // ✅ Backend espera '1day' para último mes
      break;
    case '3months':
      startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1day';
      break;
    case '6months':
      startDate = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1week';
      break;
    case '1year':
      startDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1month';
      break;
    case '5years':
      startDate = new Date(today.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
      endDate = new Date(today);
      backendInterval = '1month';
      break;
  }
  
  // Formatear fechas como YYYY-MM-DD
  const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
  const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;
  
  // Cargar datos con los parámetros correctos para el backend
  await investStore.fetchInvestmentDetail(investmentId, backendInterval, formattedStartDate, formattedEndDate);
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
  padding: 10px 20px 120px;
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
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #EFE9EC;
  background-color: #FDFBFC;
}

/* Estilos base para todos los botones */
.action-buttons :deep(.base-button) {
  flex: 1;
  padding: 18px 24px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Botón Comprar - gradiente fucsia */
.action-buttons :deep(.btn-buy) { 
  background: linear-gradient(135deg, #F72152 0%, #E91E63 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(247, 33, 82, 0.3);
}

.action-buttons :deep(.btn-buy:hover:not(:disabled)) { 
  background: linear-gradient(135deg, #E60048 0%, #D81B5A 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(247, 33, 82, 0.4);
}

/* Botón Vender - gradiente gris */
.action-buttons :deep(.btn-sell) { 
  background: linear-gradient(135deg, #9E9E9E 0%, #757575 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}

.action-buttons :deep(.btn-sell:hover:not(:disabled)) { 
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(158, 158, 158, 0.4);
}

.action-buttons :deep(.btn-sell:disabled) { 
  background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(189, 189, 189, 0.2);
}

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