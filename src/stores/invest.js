import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import investService from '@/api/investService'

export const useInvestStore = defineStore('invest', {
  state: () => ({
    dashboardData: {
      performanceLabel: '',
      mainPercentage: 0,
      subInfo: '',
      chartData: { series: [{ name: 'Rendimiento', data: [] }], categories: [] },
      investments: []
    },
    currentInvestmentDetail: null,
    // Estado para búsqueda de acciones
    searchResults: {
      acciones: [],
      page: 0,
      isLastPage: false,
      totalElements: 0,
      totalPages: 0
    },
    loading: false,
    error: null,
  }),
  actions: {
    async fetchInvestmentsDashboard(filter = 'allTime') {
      this.loading = true;
      this.error = null;
      try {
        const data = await investService.getInvestmentsDashboard(filter);
        this.dashboardData = data;
      } catch (err) {
        this.error = err.message || 'Fallo al cargar el dashboard de inversiones.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchInvestmentDetail(investmentId) {
      this.loading = true;
      this.error = null;
      this.currentInvestmentDetail = null;
      try {
        const data = await investService.getInvestmentDetail(investmentId);
        this.currentInvestmentDetail = data;
      } catch (err) {
        this.error = err.message || `Fallo al cargar detalle de inversión ${investmentId}.`;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async searchStocks(query = '', page = 0, size = 200) {
      this.loading = true;
      this.error = null;
      try {
        const response = await investService.searchStocks(query, page, size);
        
        // Adaptar la respuesta del endpoint unificado
        console.log('📊 Datos recibidos del backend:', response.content?.[0]); // Log del primer elemento
        
        const adaptedResponse = {
          content: (response.content || []).map(investment => {
            console.log('🔍 Mapeando inversión:', {
              id: investment.id,
              name: investment.name,
              stockSymbol: investment.stockSymbol,
              currentPrice: investment.currentPrice,
              priceChange24h: investment.priceChange24h,
              performance: investment.performance
            });
            
            return {
              // Mapear campos del backend a la estructura esperada por el frontend
              id: investment.id,
              symbol: investment.stockSymbol || investment.name?.split(' ')[0] || investment.id,
              name: investment.name || 'Sin nombre'
            };
          }),
          number: response.page || page,
          last: response.last || false,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0
        };
        
        if (page === 0) {
          // Primera página: reemplazar resultados
          this.searchResults.acciones = adaptedResponse.content;
        } else {
          // Páginas siguientes: añadir a resultados existentes (solo para lista, no búsqueda)
          this.searchResults.acciones = [...this.searchResults.acciones, ...adaptedResponse.content];
        }
        
        this.searchResults.page = adaptedResponse.number;
        this.searchResults.isLastPage = adaptedResponse.last;
        this.searchResults.totalElements = adaptedResponse.totalElements;
        this.searchResults.totalPages = adaptedResponse.totalPages;
        
        return adaptedResponse;
      } catch (err) {
        this.error = err.message || 'Fallo al buscar acciones.';
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async loadMoreStocks(query = '', size = 200) {
      if (this.searchResults.isLastPage || this.loading) return;
      
      const nextPage = this.searchResults.page + 1;
      return this.searchStocks(query, nextPage, size);
    },
    clearSearchResults() {
      this.searchResults.acciones = [];
      this.searchResults.page = 0;
      this.searchResults.isLastPage = false;
      this.searchResults.totalElements = 0;
      this.searchResults.totalPages = 0;
    },
    async buyStock(investmentId, amount, shares) {
      this.loading = true;
      this.error = null;
      // UI Optimista (más complejo para balances, solo simulación de éxito)
      try {
        const result = await investService.buyStock(investmentId, amount, shares);
        // Actualizar dashboard o detalle si es necesario después de la compra
        // this.fetchInvestmentsDashboard();
        // this.fetchInvestmentDetail(investmentId);
        return result; // ej. { success: true, message: "Compra realizada" }
      } catch (err) {
        this.error = err.message || 'Fallo al comprar acciones.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async sellStock(investmentId, amount, shares) {
      this.loading = true;
      this.error = null;
      // UI Optimista
      try {
        const result = await investService.sellStock(investmentId, amount, shares);
        // this.fetchInvestmentsDashboard();
        // this.fetchInvestmentDetail(investmentId);
        return result; // ej. { success: true, message: "Venta realizada" }
      } catch (err) {
        this.error = err.message || 'Fallo al vender acciones.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
}) 