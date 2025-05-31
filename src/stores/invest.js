import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { investService } from '@/api/investService'

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