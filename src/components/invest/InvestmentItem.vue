<template>
  <div class="investment-item" @click="$emit('selected', investment.id)">
    <div class="item-icon">
      <img :src="investment.icon" :alt="investment.name">
    </div>
    <div class="item-details">
      <div class="item-name">{{ investment.name }}</div>
      <div class="item-category">{{ investment.category }}</div>
    </div>
    <div class="item-performance" :class="performanceClass">
      {{ formatPerformance(investment.performance) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  investment: {
    type: Object,
    required: true,
    // Espera: { id: '1', name: 'Tecnología Innovadora', category: 'Acciones', icon: '...', performance: 5.2 }
  }
});
defineEmits(['selected']);

const performanceClass = computed(() => {
  return props.investment.performance >= 0 ? 'positive' : 'negative';
});

const formatPerformance = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
</script>

<style scoped>
/* Copied from inversiones-grafica.html .investment-item */
.investment-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
}
.investment-item:last-child {
  border-bottom: none;
}

.investment-item .item-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  margin-right: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #E0E0E0; /* Placeholder si no hay imagen */
}
.investment-item .item-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.investment-item .item-details {
  flex-grow: 1;
}

.investment-item .item-name {
  font-size: 16px;
  font-weight: 500;
  color: #111111;
}
.investment-item .item-category {
  font-size: 13px;
  color: #B08FA0; /* Un rosa/púrpura apagado */
}

.investment-item .item-performance {
  font-size: 16px;
  font-weight: 500;
}
.investment-item .item-performance.positive {
  color: #4CAF50;
}
.investment-item .item-performance.negative {
  color: #D32F2F;
}
</style> 