<template>
  <div class="investment-search-page">
    <PageHeader
      title="Buscar Inversiones"
      :show-back="true"
      :back-route="{ name: 'InvestmentsDashboard' }"
    />

    <main class="search-content">
      <!-- Barra de búsqueda -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar acciones por nombre o ticker..."
            class="search-input"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <div v-if="investStore.loading" class="search-loading">
            <div class="spinner"></div>
          </div>
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div class="search-results" v-if="investStore.searchResults.acciones.length > 0">
        <h3 class="results-title">
          {{ investStore.searchResults.totalElements.toLocaleString() }} resultados encontrados
        </h3>
        
        <div class="stocks-list" ref="stocksListRef">
          <div
            v-for="stock in investStore.searchResults.acciones"
            :key="stock.id"
            class="stock-item"
            @click="selectStock(stock)"
          >
            <div class="stock-info">
              <div class="stock-name">{{ stock.name }}</div>
              <div class="stock-ticker">{{ stock.symbol }}</div>
            </div>
            <div class="stock-arrow">→</div>
          </div>
        </div>

        <!-- Indicador de carga infinita -->
        <div v-if="investStore.loading && investStore.searchResults.acciones.length > 0" class="infinite-loading">
          <div class="spinner"></div>
          <span>Cargando más resultados...</span>
        </div>

        <!-- Indicador de fin de resultados -->
        <div v-if="investStore.searchResults.isLastPage && investStore.searchResults.acciones.length > 0" class="end-results">
          <span>Has llegado al final de los resultados</span>
        </div>

        <!-- Elemento invisible para detectar cuando llegar al final -->
        <div v-if="!investStore.searchResults.isLastPage" ref="loadMoreTrigger" class="load-more-trigger"></div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="hasSearched && !investStore.loading" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otros términos de búsqueda</p>
      </div>

      <!-- Estado inicial -->
      <div v-else-if="!hasSearched && !investStore.loading" class="initial-state">
        <div class="initial-icon">📈</div>
        <h3>Busca acciones para invertir</h3>
        <p>Escribe el nombre de la empresa o su ticker</p>
        <p class="initial-subtitle">Se cargarán automáticamente las primeras 200 acciones</p>
      </div>

      <!-- Error -->
      <div v-if="investStore.error" class="error-message">
        {{ investStore.error }}
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useInvestStore } from '@/stores/invest';
import PageHeader from '@/components/common/PageHeader.vue';
import testBackendConnection from '../../../test-backend.js';
import testDirectRequest from '../../../test-direct-request.js';

// Hacer disponibles los scripts de diagnóstico en la consola
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
  window.testDirectRequest = testDirectRequest;
}

const router = useRouter();
const investStore = useInvestStore();

const searchQuery = ref('');
const hasSearched = ref(false);
const stocksListRef = ref(null);
const loadMoreTrigger = ref(null);
let searchTimeout = null;
let scrollObserver = null;

onMounted(() => {
  // Cargar resultados iniciales al montar
  loadInitialResults();
  setupInfiniteScroll();
  
  // 🔍 Ejecutar diagnóstico automáticamente (comentado para producción)
  // console.log('🚀 Ejecutando diagnóstico automático...');
  // setTimeout(() => {
  //   testBackendConnection();
  //   setTimeout(() => {
  //     testDirectRequest();
  //   }, 2000);
  // }, 1000);
});

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
});

const setupInfiniteScroll = () => {
  // Configurar Intersection Observer para infinite scroll
  const options = {
    root: null,
    rootMargin: '200px', // Cargar cuando esté a 200px del final
    threshold: 0.1
  };

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !investStore.loading && !investStore.searchResults.isLastPage) {
        console.log('🔄 Triggering infinite scroll - Cargando más resultados...');
        loadMore();
      }
    });
  }, options);

  // Observar el elemento trigger al final de la lista
  if (loadMoreTrigger.value) {
    scrollObserver.observe(loadMoreTrigger.value);
  }
};

const loadInitialResults = async () => {
  hasSearched.value = true;
  
  // 🔍 Diagnóstico: Verificar token y conexión
  const token = localStorage.getItem('finko_auth_token');
  console.log('🔍 Diagnóstico de conexión:');
  console.log('- Token disponible:', !!token);
  console.log('- Token:', token ? `${token.substring(0, 20)}...` : 'No hay token');
  
  try {
    await investStore.searchStocks('', 0, 200); // Cargar 200 elementos iniciales
  } catch (error) {
    console.error('❌ Error en búsqueda inicial:', error);
    // Mostrar error más descriptivo
    if (error.message.includes('401')) {
      console.error('🔐 Error de autenticación - Token expirado o inválido');
    } else if (error.message.includes('501')) {
      console.error('🔧 Error 501 - Endpoint no implementado en el backend');
    }
  }
};

const handleSearchInput = () => {
  // Debounce de 500ms para búsquedas
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 500);
};

const handleSearchFocus = () => {
  if (!hasSearched.value) {
    loadInitialResults();
  }
};

const handleSearchBlur = () => {
  // Mantener resultados visibles
};

const performSearch = async () => {
  hasSearched.value = true;
  await investStore.searchStocks(searchQuery.value, 0, 200);
  
  // Actualizar el observer después de la búsqueda
  nextTick(() => {
    updateInfiniteScrollObserver();
  });
};

const loadMore = async () => {
  if (investStore.loading || investStore.searchResults.isLastPage) return;
  
  console.log('📥 Cargando página:', investStore.searchResults.page + 1);
  await investStore.loadMoreStocks(searchQuery.value, 200);
  
  // Actualizar el observer después de cargar más resultados
  nextTick(() => {
    updateInfiniteScrollObserver();
  });
};

const updateInfiniteScrollObserver = () => {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  
  // Reconfigurar el observer
  const options = {
    root: null,
    rootMargin: '200px',
    threshold: 0.1
  };

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !investStore.loading && !investStore.searchResults.isLastPage) {
        console.log('🔄 Triggering infinite scroll - Cargando más resultados...');
        loadMore();
      }
    });
  }, options);

  // Observar el nuevo elemento trigger
  if (loadMoreTrigger.value) {
    scrollObserver.observe(loadMoreTrigger.value);
  }
};

const selectStock = (stock) => {
  // Navegar al detalle de la inversión usando el ID
  router.push({ 
    name: 'InvestmentDetail', 
    params: { investmentId: stock.id } 
  });
};
</script>

<style scoped>
.investment-search-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.search-content {
  padding: 20px;
  flex-grow: 1;
}

.search-container {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #FF007F;
}

.search-loading {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #FF007F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.stocks-list {
  margin-bottom: 20px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.stock-item:hover {
  background-color: #f8f8f8;
}

.stock-item:last-child {
  border-bottom: none;
}

.stock-info {
  flex-grow: 1;
  margin-right: 15px;
}

.stock-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.stock-ticker {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stock-arrow {
  color: #FF007F;
  font-size: 18px;
  font-weight: bold;
}

.infinite-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  gap: 10px;
}

.end-results {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.load-more-trigger {
  height: 1px;
  width: 100%;
  /* Elemento invisible para detectar cuando llegar al final */
}

.initial-subtitle {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.empty-state,
.initial-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon,
.initial-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state h3,
.initial-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p,
.initial-state p {
  font-size: 16px;
  color: #666;
}

.error-message {
  text-align: center;
  color: #d32f2f;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 8px;
  margin-top: 20px;
}
</style> 