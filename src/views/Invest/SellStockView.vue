<template>
  <div class="buy-sell-stock-page">
    <PageHeader
        title="Vender"
        :show-close="true"
        :back-route="{ name: 'InvestmentDetail', params: { investmentId: investmentId } }"
    />

    <main class="buy-sell-stock-form-content" v-if="investmentDetail">
      <h2 class="form-title">Vender Acciones de {{ investmentDetail.name.split('(')[0].trim() }}</h2>
      <p class="current-price-info">Precio Actual: {{ formatCurrency(investmentDetail.currentPrice) }}</p>
      <p class="shares-owned-info">Acciones en posesión: {{ investmentDetail.currentSharesOwned?.toFixed(4) || '0' }}</p>

      <form id="sellStockForm" @submit.prevent="handleSellStock">
        <BaseInput
          id="sharesSell"
          v-model="form.shares"
          label="Acciones a vender"
          type="number"
          placeholder="0"
          step="0.0001"
          :max="investmentDetail.currentSharesOwned"
          min="0"
          @input="calculateAmountFromShares"
        />
         <BaseInput
          id="amountSell"
          v-model="form.amount"
          label="Cantidad a obtener (€ aprox.)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          @input="calculateSharesFromAmount"
        />
         <p v-if="estimatedProceeds > 0" class="estimated-total">
            Total Estimado: {{ formatCurrency(estimatedProceeds) }}
        </p>
        <p v-if="investStore.error" class="error-message">{{ investStore.error }}</p>
        <p v-if="formError" class="error-message">{{ formError }}</p>
      </form>
    </main>
    <div v-else-if="investStore.loading" class="loading-message">Cargando datos...</div>

    <footer class="action-button-container">
      <BaseButton type="submit" form="sellStockForm" :disabled="investStore.loading || !form.shares || parseFloat(form.shares) <= 0" variant="finko-confirm-buy-sell">
        {{ investStore.loading ? 'Vendiendo...' : 'Vender' }}
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

const calculateAmountFromShares = () => {
  formError.value = '';
  const sharesToSell = parseFloat(form.value.shares);
  if (sharesToSell > (investmentDetail.value?.currentSharesOwned || 0)) {
      formError.value = "No puedes vender más acciones de las que posees.";
      form.value.shares = investmentDetail.value?.currentSharesOwned.toFixed(4); // Corregir al máximo
  }
  if (currentPrice.value > 0 && form.value.shares) {
    form.value.amount = (parseFloat(form.value.shares) * currentPrice.value).toFixed(2);
  } else if (!form.value.shares) {
    form.value.amount = '';
  }
};
const calculateSharesFromAmount = () => {
    formError.value = '';
    if(currentPrice.value > 0 && form.value.amount){
        const calculatedShares = (parseFloat(form.value.amount) / currentPrice.value);
        if (calculatedShares > (investmentDetail.value?.currentSharesOwned || 0)) {
            formError.value = "La cantidad ingresada excede el valor de tus acciones en posesión.";
            form.value.shares = investmentDetail.value?.currentSharesOwned.toFixed(4);
            form.value.amount = (parseFloat(form.value.shares) * currentPrice.value).toFixed(2);
        } else {
            form.value.shares = calculatedShares.toFixed(4);
        }
    } else if (!form.value.amount) {
        form.value.shares = '';
    }
}

const estimatedProceeds = computed(() => {
    return form.value.amount ? parseFloat(form.value.amount) : 0;
});

const handleSellStock = async () => {
  formError.value = '';
  if (!form.value.shares || parseFloat(form.value.shares) <= 0) {
      formError.value = "Por favor, introduce un número de acciones válido para vender.";
      return;
  }
  if (parseFloat(form.value.shares) > (investmentDetail.value?.currentSharesOwned || 0)) {
      formError.value = "No puedes vender más acciones de las que posees.";
      return;
  }
  try {
    await investStore.sellStock(investmentId, parseFloat(form.value.amount), parseFloat(form.value.shares));
    alert('¡Venta realizada con éxito! (simulación)');
    investStore.fetchInvestmentDetail(investmentId);
    investStore.fetchInvestmentsDashboard();
    router.push({ name: 'InvestmentDetail', params: { investmentId } });
  } catch (error) {
    console.error("Error al vender:", error);
  }
};
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0,00€";
  return parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};
</script>

<style scoped>
/* Reutiliza estilos de .buy-sell-stock-page de BuyStockView.vue */
.buy-sell-stock-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}
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
.current-price-info, .shares-owned-info {
    font-size: 15px;
    color: #555;
    margin-bottom: 5px; /* Menos margen para .shares-owned-info */
    text-align: left;
}
 .shares-owned-info {
    margin-bottom: 30px;
}
.estimated-total {
    font-size: 15px;
    color: #333;
    font-weight: 500;
    margin-top: -15px;
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
.loading-message {
    text-align: center; padding: 50px 20px; font-size: 16px; color: #555;
}
@media (max-width: 360px) {
  .form-title { font-size: 22px; }
}
</style> 