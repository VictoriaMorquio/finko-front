<template>
  <div class="buy-sell-stock-page">
    <PageHeader
        title="Comprar"
        :show-close="true"
        :back-route="{ name: 'InvestmentDetail', params: { investmentId: investmentId } }"
    />

    <main class="buy-sell-stock-form-content" v-if="investmentDetail">
      <h2 class="form-title">Comprar Acciones de {{ investmentDetail.name.split('(')[0].trim() }}</h2>
      <p class="current-price-info">Precio Actual: {{ formatCurrency(investmentDetail.currentPrice) }}</p>


      <form id="buyStockForm" @submit.prevent="handleBuyStock">
        <BaseInput
          id="amount"
          v-model="form.amount"
          label="Cantidad a invertir (€)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          @input="calculateShares"
        />
        <BaseInput
          id="shares"
          v-model="form.shares"
          label="Acciones (aprox.)"
          type="number"
          placeholder="0"
          step="0.0001"
          min="0"
          @input="calculateAmount"
        />
        <p v-if="estimatedTotal > 0" class="estimated-total">
            Total Estimado: {{ formatCurrency(estimatedTotal) }}
        </p>
        <p v-if="investStore.error" class="error-message">{{ investStore.error }}</p>
        <p v-if="formError" class="error-message">{{ formError }}</p>
      </form>
    </main>
     <div v-else-if="investStore.loading" class="loading-message">Cargando datos...</div>

    <footer class="action-button-container">
      <BaseButton type="submit" form="buyStockForm" :disabled="investStore.loading || !form.amount || parseFloat(form.amount) <= 0" variant="finko-confirm-buy-sell">
        {{ investStore.loading ? 'Comprando...' : 'Comprar' }}
      </BaseButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const investStore = useInvestStore();
const investmentId = route.params.investmentId;

const form = ref({
  amount: '', // En euros
  shares: '', // Número de acciones
});
const formError = ref('');

onMounted(() => {
  if (!investStore.currentInvestmentDetail || investStore.currentInvestmentDetail.id !== investmentId) {
    investStore.fetchInvestmentDetail(investmentId);
  }
});

const investmentDetail = computed(() => investStore.currentInvestmentDetail);
const currentPrice = computed(() => parseFloat(investmentDetail.value?.currentPrice) || 0);

const calculateShares = () => {
  if (currentPrice.value > 0 && form.value.amount) {
    form.value.shares = (parseFloat(form.value.amount) / currentPrice.value).toFixed(4);
  } else if (!form.value.amount) {
    form.value.shares = '';
  }
};

const calculateAmount = () => {
  if (currentPrice.value > 0 && form.value.shares) {
    form.value.amount = (parseFloat(form.value.shares) * currentPrice.value).toFixed(2);
  } else if (!form.value.shares) {
    form.value.amount = '';
  }
};

const estimatedTotal = computed(() => {
    return form.value.amount ? parseFloat(form.value.amount) : 0;
});

const handleBuyStock = async () => {
  formError.value = '';
  if (!form.value.amount || parseFloat(form.value.amount) <= 0) {
      formError.value = "Por favor, introduce una cantidad válida.";
      return;
  }
  try {
    await investStore.buyStock(investmentId, parseFloat(form.value.amount), parseFloat(form.value.shares));
    alert('¡Compra realizada con éxito! (simulación)');
    // Actualizar datos y volver al detalle
    investStore.fetchInvestmentDetail(investmentId);
    investStore.fetchInvestmentsDashboard(); // Para actualizar la lista general
    router.push({ name: 'InvestmentDetail', params: { investmentId } });
  } catch (error) {
    // El error se maneja en el store
    console.error("Error al comprar:", error);
  }
};
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0,00€";
  return parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};
</script>

<style scoped>
/* Estilos de comprar-acciones.html (similares para vender) */
.buy-sell-stock-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}
/* PageHeader maneja la cabecera */

.buy-sell-stock-form-content {
  padding: 25px 20px;
  flex-grow: 1;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 10px;
  text-align: left;
}
.current-price-info {
    font-size: 15px;
    color: #555;
    margin-bottom: 30px;
    text-align: left;
}

/* BaseInput usa por defecto el fondo rosa pálido que coincide con el diseño */
.estimated-total {
    font-size: 15px;
    color: #333;
    font-weight: 500;
    margin-top: -15px; /* Ajuste si el form-group tiene mucho margen */
    margin-bottom: 20px;
    text-align: right;
}

.action-button-container {
  padding: 20px;
  background-color: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
}
/* BaseButton usa variant finko-confirm-buy-sell */
.loading-message {
    text-align: center; padding: 50px 20px; font-size: 16px; color: #555;
}

@media (max-width: 360px) {
  .form-title { font-size: 22px; }
}
</style> 