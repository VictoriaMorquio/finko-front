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
      <div class="price-change" :class="getPriceChangeColor(detail.priceChangeValue)">
        {{ detail.priceChangeValue }} ({{ detail.priceChangePeriod }})
      </div>

      <LineChart
        v-if="detail.chartData && detail.chartData.series[0].data.length"
        :series="detail.chartData.series"
        :categories="detail.chartData.categories"
        chartHeight="160"
        :lineColor="priceChangeIsPositive(detail.priceChangeValue) ? '#4CAF50' : '#FF007F'"
        :showXAxisLabels="true"
        :showYAxisLabels="false"
        curve="smooth"
        style="margin-bottom: 5px;"
      />
      <div class="chart-labels-detail" v-if="detail.chartData && detail.chartData.categories.length">
        <span v-for="(label, index) in detail.chartData.categories" :key="index">{{ label }}</span>
      </div>

      <section class="investment-metrics">
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
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import LineChart from '@/components/common/LineChart.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const investStore = useInvestStore();
const investmentId = route.params.investmentId;

onMounted(() => {
  investStore.fetchInvestmentDetail(investmentId);
});

const detail = computed(() => investStore.currentInvestmentDetail);

const canSell = computed(() => {
    // Lógica para determinar si se puede vender (ej. si tiene acciones)
    return detail.value && detail.value.currentSharesOwned > 0;
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0,00€";
  return parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};

const priceChangeIsPositive = (priceChangeStr) => {
    return priceChangeStr && priceChangeStr.includes('+');
};
const getPriceChangeColor = (priceChangeStr) => {
    if (!priceChangeStr) return '';
    return priceChangeStr.includes('+') ? 'positive-change' : (priceChangeStr.includes('-') ? 'negative-change' : '');
};


const navigateToBuy = () => {
  router.push({ name: 'BuyStock', params: { investmentId } });
};
const navigateToSell = () => {
  router.push({ name: 'SellStock', params: { investmentId } });
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


/* LineChart es un componente */
.chart-labels-detail {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  margin-bottom: 30px;
}
.chart-labels-detail span {
  font-size: 12px;
  color: #757575;
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
</style> 