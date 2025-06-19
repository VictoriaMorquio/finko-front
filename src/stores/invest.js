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
    async fetchInvestmentDetail(investmentId, interval = '1month', startDate = null, endDate = null) {
      this.loading = true;
      this.error = null;
      this.currentInvestmentDetail = null;
      try {
        console.log('🚀 Iniciando fetchInvestmentDetail con parámetros:', { investmentId, interval, startDate, endDate });
        const data = await investService.getInvestmentDetail(investmentId, interval, startDate, endDate);
        console.log('📡 Respuesta del servicio:', data);
        
        // Procesar los datos del backend para adaptarlos al formato esperado por el frontend
        const processedData = this.processInvestmentDetailData(data);
        console.log('✅ Datos procesados finales:', processedData);
        this.currentInvestmentDetail = processedData;
      } catch (err) {
        console.error('❌ Error en fetchInvestmentDetail:', err);
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
    // Método para procesar los datos del backend y adaptarlos al formato del frontend
    processInvestmentDetailData(data) {
      console.log('🔍 Datos recibidos del backend:', data);
      
      const { investment, historicalData, sharesOwned, totalInvested, averageBuyPrice, currentValue, returnEur, returnPercent, buyPrice, sellPrice, priceChangePercent } = data;
      
      console.log('📊 Datos de inversión:', investment);
      console.log('📈 Datos históricos:', historicalData?.length || 0, 'puntos');
      console.log('💰 Métricas financieras:', { sharesOwned, totalInvested, averageBuyPrice, currentValue, returnEur, returnPercent, buyPrice, sellPrice, priceChangePercent });
      
      // Procesar datos históricos para el gráfico
      const chartData = this.processHistoricalDataForChart(historicalData);
      console.log('📊 Datos procesados para gráfico:', chartData);
      
      // Crear métricas directamente desde los datos del servidor
      const metrics = this.createMetricsFromServerData({
        currentPrice: investment.currentPrice,
        priceChange24h: investment.priceChange24h,
        sharesOwned,
        totalInvested,
        averageBuyPrice,
        currentValue,
        returnEur,
        returnPercent,
        buyPrice,
        sellPrice,
        priceChangePercent
      });
      
      console.log('📋 Métricas del servidor:', metrics);
      
      return {
        // Datos básicos de la inversión
        id: investment.id,
        name: investment.name,
        stockSymbol: investment.stockSymbol,
        category: investment.category,
        iconUrl: investment.iconUrl,
        currentPrice: investment.currentPrice,
        priceChange24h: investment.priceChange24h,
        
        // Datos del gráfico
        chartData,
        
        // Métricas del servidor
        metrics,
        
        // Datos de propiedad (exactamente como vienen del servidor)
        sharesOwned,
        totalInvested,
        averageBuyPrice,
        currentValue,
        returnEur,
        returnPercent,
        
        // Precios de compra/venta (exactamente como vienen del servidor)
        buyPrice,
        sellPrice,
        priceChangePercent,
        
        // Información adicional
        about: this.generateAboutText(investment.name, investment.stockSymbol)
      };
    },
    
    // Procesar datos históricos para el gráfico
    processHistoricalDataForChart(historicalData) {
      console.log('📈 Procesando datos históricos:', historicalData);
      console.log('📈 Tipo de datos:', typeof historicalData);
      console.log('📈 Es array:', Array.isArray(historicalData));
      console.log('📈 Longitud:', historicalData?.length);
      
      if (!historicalData || historicalData.length === 0) {
        console.log('⚠️ No hay datos históricos disponibles');
        return [];
      }
      
      // Verificar la estructura del primer elemento
      const firstItem = historicalData[0];
      console.log('📊 Primer elemento:', firstItem);
      console.log('📊 Propiedades del primer elemento:', Object.keys(firstItem));
      
      // Ordenar por fecha (más antigua primero para mostrar cronológicamente)
      const sortedData = [...historicalData].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        console.log(`📅 Comparando fechas: ${a.date} vs ${b.date} -> ${dateA} vs ${dateB}`);
        return dateA - dateB;
      });
      console.log('📅 Datos ordenados cronológicamente:', sortedData.length, 'puntos');
      
      // Crear array de datos en el formato que espera el componente LineChart
      const chartData = sortedData.map((item, index) => {
        const price = parseFloat(item.close);
        // Convertir fecha a timestamp para ApexCharts
        const timestamp = new Date(item.date).getTime();
        console.log(`📊 [${index}] Fecha: ${item.date}, Precio: ${price} (timestamp: ${timestamp})`);
        return {
          x: timestamp,
          y: price
        };
      });
      
      console.log('✅ Datos procesados para gráfico:', chartData);
      console.log('✅ Total de puntos:', chartData.length);
      return chartData;
    },
    
    // Crear métricas directamente desde los datos del servidor
    createMetricsFromServerData(data) {
      const {
        currentPrice,
        priceChange24h,
        sharesOwned,
        totalInvested,
        averageBuyPrice,
        currentValue,
        returnEur,
        returnPercent,
        buyPrice,
        sellPrice,
        priceChangePercent
      } = data;
      
      const metrics = [];
      
      // Precio actual (del servidor)
      if (currentPrice !== null && currentPrice !== undefined) {
        metrics.push({
          label: 'Precio actual',
          value: `€${parseFloat(currentPrice).toFixed(2)}`,
          positive: null
        });
      }
      
      // Cambio 24h (del servidor)
      if (priceChange24h !== null && priceChange24h !== undefined) {
        const isPositive = priceChange24h >= 0;
        metrics.push({
          label: 'Cambio 24h',
          value: `${isPositive ? '+' : ''}€${parseFloat(priceChange24h).toFixed(2)}`,
          positive: isPositive
        });
      }
      
      // Acciones que posees (del servidor)
      if (sharesOwned !== null && sharesOwned !== undefined) {
        metrics.push({
          label: 'Acciones que posees',
          value: sharesOwned.toString(),
          positive: null
        });
      }
      
      // Total invertido (del servidor)
      if (totalInvested !== null && totalInvested !== undefined) {
        metrics.push({
          label: 'Total invertido',
          value: `€${parseFloat(totalInvested).toFixed(2)}`,
          positive: null
        });
      }
      
      // Precio promedio de compra (del servidor)
      if (averageBuyPrice !== null && averageBuyPrice !== undefined) {
        metrics.push({
          label: 'Precio promedio de compra',
          value: `€${parseFloat(averageBuyPrice).toFixed(2)}`,
          positive: null
        });
      }
      
      // Valor actual (del servidor)
      if (currentValue !== null && currentValue !== undefined) {
        metrics.push({
          label: 'Valor actual',
          value: `€${parseFloat(currentValue).toFixed(2)}`,
          positive: null
        });
      }
      
      // Retorno total (del servidor)
      if (returnEur !== null && returnEur !== undefined) {
        const isPositive = returnEur >= 0;
        metrics.push({
          label: 'Retorno total',
          value: `${isPositive ? '+' : ''}€${parseFloat(returnEur).toFixed(2)}`,
          positive: isPositive
        });
      }
      
      // Retorno porcentual (del servidor)
      if (returnPercent !== null && returnPercent !== undefined) {
        const isPositive = returnPercent >= 0;
        metrics.push({
          label: 'Retorno porcentual',
          value: `${isPositive ? '+' : ''}${parseFloat(returnPercent).toFixed(2)}%`,
          positive: isPositive
        });
      }
      
      // Precio de compra (del servidor)
      if (buyPrice !== null && buyPrice !== undefined) {
        metrics.push({
          label: 'Precio de compra',
          value: `€${parseFloat(buyPrice).toFixed(2)}`,
          positive: null
        });
      }
      
      // Precio de venta (del servidor)
      if (sellPrice !== null && sellPrice !== undefined) {
        metrics.push({
          label: 'Precio de venta',
          value: `€${parseFloat(sellPrice).toFixed(2)}`,
          positive: null
        });
      }
      
      // Cambio de precio porcentual (del servidor)
      if (priceChangePercent !== null && priceChangePercent !== undefined) {
        const isPositive = priceChangePercent >= 0;
        metrics.push({
          label: 'Cambio de precio',
          value: `${isPositive ? '+' : ''}${parseFloat(priceChangePercent).toFixed(2)}%`,
          positive: isPositive
        });
      }
      
      return metrics;
    },
    
    // Generar texto descriptivo sobre la empresa
    generateAboutText(name, symbol) {
      const companyName = name?.replace(/\.? CEDEAR$/, '') || 'Esta empresa';
      return `${companyName} (${symbol}) es una empresa que cotiza en los mercados financieros. Los datos mostrados incluyen información histórica de precios y métricas de rendimiento.`;
    },
  },
}) 