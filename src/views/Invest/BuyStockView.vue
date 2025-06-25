<template>
  <div class="buy-sell-stock-page">
    <PageHeader
        title="Comprar Acciones"
        :show-back="true"
        :back-route="{ name: 'InvestmentDetail', params: { id: investmentId } }"
        bg-color="#FDFBFC"
    />

    <main class="buy-sell-stock-form-content" v-if="investmentDetail">
      <h2 class="form-title">Comprar Acciones de {{ investmentDetail.name.split('(')[0].trim() }}</h2>
      <p class="current-price-info">Precio de Compra: {{ formatCurrency(buyPrice) }}</p>

      <form id="buyStockForm" @submit.prevent="handleBuyStock">
        <BaseInput
          id="amount"
          v-model="form.amount"
          label="Cantidad a invertir (€)"
          type="number"
          placeholder="0.00"
          step="0.01"
          min="1"
          @input="calculateShares"
          :error-message="getAmountError()"
        />
        <BaseInput
          id="shares"
          v-model="form.shares"
          label="Acciones a obtener"
          type="number"
          placeholder="0"
          step="0.000001"
          min="0"
          :disabled="true"
          help-text="Este valor se calcula automáticamente según la cantidad invertida"
        />
        <p v-if="estimatedTotal > 0" class="estimated-total">
            Total: {{ formatCurrency(estimatedTotal) }}
        </p>
        <p v-if="investStore.error" class="error-message">{{ investStore.error }}</p>
        <p v-if="formError" class="error-message">{{ formError }}</p>
      </form>
    </main>
     <div v-else-if="investStore.loading" class="loading-message">Cargando datos...</div>

    <footer class="action-button-container">
      <BaseButton 
        type="submit" 
        form="buyStockForm" 
        :disabled="investStore.loading || !isFormValid" 
        variant="primary"
      >
        {{ investStore.loading ? 'Comprando...' : 'Comprar' }}
      </BaseButton>
    </footer>

    <!-- Modal de confirmación de compra exitosa -->
    <TransactionSuccessModal
      :is-visible="showSuccessModal"
      :title="'¡Compra Exitosa!'"
      :message="successMessage"
      transaction-type="buy"
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

// Usar buyPrice en lugar de currentPrice
const buyPrice = computed(() => {
  return parseFloat(investmentDetail.value?.buyPrice) || 0;
});

const calculateShares = () => {
  if (buyPrice.value > 0 && form.value.amount && parseFloat(form.value.amount) > 0) {
    const amount = parseFloat(form.value.amount);
    form.value.shares = (amount / buyPrice.value).toFixed(6);
  } else {
    form.value.shares = '';
  }
};

const estimatedTotal = computed(() => {
    return form.value.amount ? parseFloat(form.value.amount) : 0;
});

// Validación del formulario
const isFormValid = computed(() => {
  const amount = parseFloat(form.value.amount);
  return amount >= 1 && form.value.shares && parseFloat(form.value.shares) > 0;
});

const getAmountError = () => {
  const amount = parseFloat(form.value.amount);
  if (form.value.amount && amount < 1) {
    return 'El mínimo de inversión es 1€';
  }
  return '';
};

const handleBuyStock = async () => {
  formError.value = '';
  
  // Validaciones finales
  const amount = parseFloat(form.value.amount);
  const shares = parseFloat(form.value.shares);
  
  if (!amount || amount < 1) {
    formError.value = "El mínimo de inversión es 1€.";
    return;
  }
  
  if (!shares || shares <= 0) {
    formError.value = "Número de acciones inválido.";
    return;
  }

  try {
    const result = await investStore.buyStock(investmentId, amount, shares);
    
    // Mostrar modal de éxito en lugar de alert
    successMessage.value = result.message || `Compra de ${shares.toFixed(6)} acciones realizada exitosamente. Total: ${formatCurrency(amount)}`;
    showSuccessModal.value = true;
    
    // Actualizar datos globales en background
    investStore.fetchInvestmentsDashboard();
    
  } catch (error) {
    console.error("Error al comprar:", error);
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
    font-weight: 500;
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

.error-message {
  color: #D32F2F;
  font-size: 14px;
  margin-top: 8px;
}

/* BaseButton usa variant finko-confirm-buy-sell */
.loading-message {
    text-align: center; padding: 50px 20px; font-size: 16px; color: #555;
}

/* Estilo del botón para coincidir con otros botones fucsia de la app */
.action-button-container :deep(.btn-primary) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important; /* Color fucsia */
  color: white !important;
}

.action-button-container :deep(.btn-primary:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.action-button-container :deep(.btn-primary:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #CCCCCC !important;
}

.action-button-container :deep(.btn-primary:not(:disabled)) {
  background-color: #FF007F !important;
}

@media (max-width: 360px) {
  .form-title { font-size: 22px; }
}
</style> 