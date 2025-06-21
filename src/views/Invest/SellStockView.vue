<template>
  <div class="buy-sell-stock-page">
    <PageHeader
        title="Vender Acciones"
        :show-back="true"
        :back-route="{ name: 'InvestmentDetail', params: { id: investmentId } }"
        bg-color="#FDFBFC"
    />

    <main class="buy-sell-stock-form-content" v-if="investmentDetail">
      <h2 class="form-title">Vender Acciones de {{ investmentDetail.name.split('(')[0].trim() }}</h2>
      <p class="current-price-info">Precio de Venta: {{ formatCurrency(sellPrice) }}</p>
      <p class="shares-owned-info">Acciones en posesión: {{ investmentDetail.sharesOwned?.toFixed(6) || '0' }}</p>

      <form id="sellStockForm" @submit.prevent="handleSellStock">
        <BaseInput
          id="sharesSell"
          v-model="form.shares"
          label="Acciones a vender"
          type="number"
          placeholder="0"
          step="0.000001"
          :max="investmentDetail.sharesOwned"
          min="0"
          @input="calculateAmountFromShares"
          :error-message="getSharesError()"
        />
         <BaseInput
          id="amountSell"
          v-model="form.amount"
          label="Cantidad a obtener (€)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          :disabled="true"
          help-text="Este valor se calcula automáticamente según las acciones a vender"
        />
         <p v-if="estimatedProceeds > 0" class="estimated-total">
            Total: {{ formatCurrency(estimatedProceeds) }}
        </p>
        <p v-if="investStore.error" class="error-message">{{ investStore.error }}</p>
        <p v-if="formError" class="error-message">{{ formError }}</p>
      </form>
    </main>
    <div v-else-if="investStore.loading" class="loading-message">Cargando datos...</div>

    <footer class="action-button-container">
      <BaseButton 
        type="submit" 
        form="sellStockForm" 
        :disabled="investStore.loading || !isFormValid" 
        variant="primary"
      >
        {{ investStore.loading ? 'Vendiendo...' : 'Vender' }}
      </BaseButton>
    </footer>

    <!-- Modal de confirmación de venta exitosa -->
    <TransactionSuccessModal
      :is-visible="showSuccessModal"
      :title="'¡Venta Exitosa!'"
      :message="successMessage"
      :icon="'💰'"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import TransactionSuccessModal from '@/components/common/TransactionSuccessModal.vue';

const route = useRoute();
const router = useRouter();
const investStore = useInvestStore();
const investmentId = route.params.id;

const form = ref({
  amount: '', // En euros
  shares: '', // Número de acciones
});
const formError = ref('');
const showSuccessModal = ref(false);
const successMessage = ref('');

onMounted(() => {
  if (!investStore.currentInvestmentDetail || investStore.currentInvestmentDetail.id !== investmentId) {
    investStore.fetchInvestmentDetail(investmentId);
  }
});

const investmentDetail = computed(() => investStore.currentInvestmentDetail);

// Usar sellPrice en lugar de currentPrice
const sellPrice = computed(() => {
  return parseFloat(investmentDetail.value?.sellPrice) || 0;
});

const maxSharesOwned = computed(() => {
  return parseFloat(investmentDetail.value?.sharesOwned) || 0;
});

const calculateAmountFromShares = () => {
  if (sellPrice.value > 0 && form.value.shares && parseFloat(form.value.shares) > 0) {
    const shares = parseFloat(form.value.shares);
    form.value.amount = (shares * sellPrice.value).toFixed(2);
  } else {
    form.value.amount = '';
  }
};

const estimatedProceeds = computed(() => {
    return form.value.amount ? parseFloat(form.value.amount) : 0;
});

// Validación del formulario
const isFormValid = computed(() => {
  const shares = parseFloat(form.value.shares);
  return shares > 0 && shares <= maxSharesOwned.value && form.value.amount;
});

const getSharesError = () => {
  const shares = parseFloat(form.value.shares);
  if (form.value.shares && shares > maxSharesOwned.value) {
    return `No puedes vender más de ${maxSharesOwned.value.toFixed(6)} acciones`;
  }
  if (form.value.shares && shares <= 0) {
    return 'Debe ser mayor que 0';
  }
  return '';
};

const handleSellStock = async () => {
  formError.value = '';
  
  // Validaciones finales
  const shares = parseFloat(form.value.shares);
  const amount = parseFloat(form.value.amount);
  
  if (!shares || shares <= 0) {
    formError.value = "Por favor, introduce un número de acciones válido para vender.";
    return;
  }
  
  if (shares > maxSharesOwned.value) {
    formError.value = "No puedes vender más acciones de las que posees.";
    return;
  }

  try {
    const result = await investStore.sellStock(investmentId, amount, shares);
    
    // Mostrar modal de éxito en lugar de alert
    successMessage.value = result.message || `Venta de ${shares.toFixed(6)} acciones realizada exitosamente. Total: ${formatCurrency(amount)}`;
    showSuccessModal.value = true;
    
    // Actualizar datos en background
    investStore.fetchInvestmentDetail(investmentId);
    investStore.fetchInvestmentsDashboard();
    
  } catch (error) {
    console.error("Error al vender:", error);
    // El error se maneja en el store
  }
};

const handleModalClose = () => {
  showSuccessModal.value = false;
  // Redireccionar al detalle de la inversión
  router.push({ name: 'InvestmentDetail', params: { id: investmentId } });
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
    font-weight: 500;
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

.error-message {
  color: #D32F2F;
  font-size: 14px;
  margin-top: 8px;
}

.loading-message {
    text-align: center; padding: 50px 20px; font-size: 16px; color: #555;
}
@media (max-width: 360px) {
  .form-title { font-size: 22px; }
}
</style> 