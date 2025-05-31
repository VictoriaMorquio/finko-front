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
    name: props.title || 'Valor',
    data: props.data.map(item => ({
      x: item.date || item.x,
      y: item.price || item.value || item.y
    }))
  }]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  title: {
    text: props.title,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111111'
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    colors: [props.color]
  },
  colors: [props.color],
  grid: {
    show: props.showGrid,
    borderColor: '#E0E0E0',
    strokeDashArray: 4
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: '#666666',
        fontSize: '12px'
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
      style: {
        colors: '#666666',
        fontSize: '12px'
      },
      formatter: (value) => {
        if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}k`
        }
        return `$${value.toFixed(2)}`
      }
    }
  },
  tooltip: {
    enabled: props.showTooltip,
    theme: 'light',
    style: {
      fontSize: '12px'
    },
    x: {
      format: 'dd MMM yyyy'
    },
    y: {
      formatter: (value) => `$${value.toFixed(2)}`
    }
  },
  markers: {
    size: 0,
    hover: {
      size: 6,
      sizeOffset: 3
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.1,
      gradientToColors: [props.color],
      inverseColors: false,
      opacityFrom: 0.1,
      opacityTo: 0,
      stops: [0, 100]
    }
  }
}))
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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