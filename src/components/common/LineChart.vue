<template>
  <div class="line-chart-container">
    <apexchart
      v-if="!isLoading && series.length > 0"
      :options="chartOptions"
      :series="series"
      :height="height"
      type="line"
    />
    <div v-else-if="isLoading" class="chart-loading">
      <div class="loading-spinner"></div>
      <p>Cargando gráfico...</p>
    </div>
    <div v-else class="chart-empty">
      <p>No hay datos disponibles</p>
    </div>
    
    <!-- Debug info -->
    <div v-if="false" style="font-size: 10px; color: #999; margin-top: 10px;">
      Debug: isLoading={{ isLoading }}, series.length={{ series.length }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: 300
  },
  color: {
    type: String,
    default: '#2196F3'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
})

const series = computed(() => {
  if (!props.data || props.data.length === 0) return []
  return [{
    name: props.title || 'Precio',
    data: props.data
  }]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: false
    },
    animations: {
      enabled: false
    },
    dropShadow: {
      enabled: false
    },
    fontFamily: 'inherit'
  },
  stroke: {
    curve: 'smooth',
    width: 5,
    colors: [props.color],
    opacity: 1.0
  },
  colors: [props.color],
  grid: {
    show: false
  },
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      style: {
        colors: '#999999',
        fontSize: '11px',
        fontWeight: '400',
        fontFamily: 'inherit'
      },
      formatter: function (value) {
        return new Date(value).toLocaleDateString('es-ES', { month: 'short' })
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      show: false
    }
  },
  tooltip: {
    enabled: props.showTooltip,
    theme: 'light',
    style: {
      fontSize: '12px',
      fontFamily: 'inherit'
    },
    x: {
      format: 'dd MMM yyyy'
    },
    y: {
      formatter: (value) => `€${value.toFixed(2)}`
    }
  },
  markers: {
    size: 0,
    hover: {
      size: 4,
      sizeOffset: 2
    }
  },
  fill: {
    type: 'solid',
    colors: [props.color],
    opacity: 0.8
  },
  dataLabels: {
    enabled: false
  }
}))
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  background: transparent;
  padding: 0;
  font-family: inherit;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E0E0E0;
  border-top: 3px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .line-chart-container {
    padding: 12px;
  }
}
</style> 