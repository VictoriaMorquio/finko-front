import { mockInvestmentsDashboard, mockInvestmentDetails } from "./_mockData";
import httpClient from './httpClient';
import { API_CONFIG } from '../config/api.js';

const MOCK_DELAY = 500;
const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;

// Helper para generar datos de gráfica aleatorios
const generateRandomChartData = (numPoints = 12, min = 20, max = 80) => {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
};
const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Servicios reales para API
const realInvestService = {
  async getInvestmentsDashboard(filter) {
    const response = await httpClient.get('/v1/investments/dashboard', { filter });
    return response;
  },

  async getInvestmentDetail(investmentId, interval = '1month', startDate = null, endDate = null) {
    const params = new URLSearchParams();
    
    // Parámetros opcionales
    if (interval) {
      params.append('interval', interval);
    }
    if (startDate) {
      params.append('start_date', startDate);
    }
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    const url = `/v1/investments/${investmentId}/details${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('📊 Llamando endpoint de detalle:', url);
    console.log('📅 Parámetros enviados:', { investmentId, interval, startDate, endDate });
    const response = await httpClient.get(url);
    return response;
  },

  async buyStock(investmentId, amount, shares) {
    const response = await httpClient.post(`/v1/investments/${investmentId}/buy`, {
      amount,
      shares
    });
    return response;
  },

  async sellStock(investmentId, amount, shares) {
    const response = await httpClient.post(`/v1/investments/${investmentId}/sell`, {
      amount,
      shares
    });
    return response;
  },

  // ✅ ENDPOINT UNIFICADO DEL BACKEND - Maneja tanto lista como búsqueda
  async searchStocks(query = '', page = 0, size = 200) {
    const params = new URLSearchParams();
    
    // Parámetros para el endpoint unificado
    if (query && query.trim() !== '') {
      params.append('q', query.trim());
    }
    params.append('page', page);
    params.append('size', size);
    
    const url = `/v1/investments/search?${params.toString()}`;
    console.log('🔍 Llamando endpoint unificado:', url);
    const response = await httpClient.get(url);
    return response;
  }
};

// Servicios mock (solo para desarrollo cuando USE_MOCK_DATA es true)
const mockInvestService = {
  getInvestmentsDashboard: (filter) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = JSON.parse(JSON.stringify(mockInvestmentsDashboard)); // Clonar para no modificar original
        // Simular cambio de datos de gráfica según filtro
        let numPoints, categories;
        if (filter === '1year') {
            numPoints = 12;
            categories = monthLabels;
            data.performanceLabel = "Ganancias y pérdidas (1 Año)";
            data.mainPercentage = parseFloat((Math.random() * 20 - 5).toFixed(1)); // +/-
            data.subInfo = `Último año <span class="percentage">${data.mainPercentage >= 0 ? '+' : ''}${data.mainPercentage}%</span>`;
        } else if (filter === '1month') {
            numPoints = 30; // Podrían ser días
            categories = Array.from({length: 30}, (_, i) => `${i+1}`);
            data.performanceLabel = "Ganancias y pérdidas (1 Mes)";
            data.mainPercentage = parseFloat((Math.random() * 10 - 3).toFixed(1));
            data.subInfo = `Último mes <span class="percentage">${data.mainPercentage >= 0 ? '+' : ''}${data.mainPercentage}%</span>`;
        } else { // allTime (desde el inicio)
            numPoints = mockInvestmentsDashboard.chartData.categories.length || 7; // O 7 si está vacío
            categories = mockInvestmentsDashboard.chartData.categories.length ? mockInvestmentsDashboard.chartData.categories : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];
            // Los datos iniciales de mockInvestmentsDashboard ya son "desde el inicio"
        }
        data.chartData.series[0].data = generateRandomChartData(numPoints);
        data.chartData.categories = categories;

        // Simular pequeños cambios en el performance de las inversiones
        data.investments.forEach(inv => {
            inv.performance = parseFloat((inv.performance + (Math.random() * 2 - 1)).toFixed(1));
        });

        resolve(data);
      }, MOCK_DELAY);
    });
  },

  getInvestmentDetail: (investmentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let detail = mockInvestmentDetails[investmentId];
        if (detail) {
          detail = JSON.parse(JSON.stringify(detail)); // Clonar
          // Simular datos de gráfica para el detalle
          detail.chartData.series[0].data = generateRandomChartData(12, parseFloat(detail.currentPrice) * 0.8, parseFloat(detail.currentPrice) * 1.2);
          detail.chartData.categories = monthLabels;
          resolve(detail);
        } else {
          reject({ message: `Detalle para inversión ${investmentId} no encontrado.` });
        }
      }, MOCK_DELAY);
    });
  },

  buyStock: (investmentId, amount, shares) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock: Comprando ${shares} acciones de ${investmentId} por ${amount}€`);
        // Aquí podrías simular la actualización del balance del usuario si estuviera en el store
        resolve({ success: true, message: `Compra de ${shares} acciones de ${mockInvestmentDetails[investmentId]?.name || investmentId} realizada.` });
      }, MOCK_DELAY);
    });
  },

  sellStock: (investmentId, amount, shares) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock: Vendiendo ${shares} acciones de ${investmentId} por ${amount}€`);
        resolve({ success: true, message: `Venta de ${shares} acciones de ${mockInvestmentDetails[investmentId]?.name || investmentId} realizada.` });
      }, MOCK_DELAY);
    });
  },

  // 🔄 MANTENER MOCK PARA BÚSQUEDA (se usará solo si USE_MOCK_DATA es true)
  searchStocks: (query = '', page = 0, size = 200) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data más realista similar al backend
        const mockStocks = [
          { symbol: "AAPL/USD", name: "Apple Inc.", price: 150.25, change: 2.15, changePercent: 1.45, volume: 1234567, marketCap: 2500000000000, currency: "USD" },
          { symbol: "MSFT/USD", name: "Microsoft Corporation", price: 320.50, change: -1.25, changePercent: -0.39, volume: 987654, marketCap: 2400000000000, currency: "USD" },
          { symbol: "GOOGL/USD", name: "Alphabet Inc.", price: 2750.80, change: 15.20, changePercent: 0.55, volume: 456789, marketCap: 1800000000000, currency: "USD" },
          { symbol: "AMZN/USD", name: "Amazon.com Inc.", price: 145.30, change: -2.10, changePercent: -1.42, volume: 2345678, marketCap: 1500000000000, currency: "USD" },
          { symbol: "TSLA/USD", name: "Tesla Inc.", price: 245.75, change: 8.45, changePercent: 3.56, volume: 3456789, marketCap: 780000000000, currency: "USD" },
          { symbol: "META/USD", name: "Meta Platforms Inc.", price: 285.90, change: -3.20, changePercent: -1.10, volume: 1234567, marketCap: 720000000000, currency: "USD" },
          { symbol: "NVDA/USD", name: "NVIDIA Corporation", price: 485.25, change: 12.75, changePercent: 2.70, volume: 2345678, marketCap: 1200000000000, currency: "USD" },
          { symbol: "NFLX/USD", name: "Netflix Inc.", price: 425.60, change: 5.40, changePercent: 1.28, volume: 567890, marketCap: 185000000000, currency: "USD" },
          { symbol: "ADBE/USD", name: "Adobe Inc.", price: 385.45, change: -7.80, changePercent: -1.98, volume: 345678, marketCap: 175000000000, currency: "USD" },
          { symbol: "CRM/USD", name: "Salesforce Inc.", price: 225.30, change: 3.15, changePercent: 1.42, volume: 456789, marketCap: 220000000000, currency: "USD" },
          { symbol: "ORCL/USD", name: "Oracle Corporation", price: 125.80, change: -1.20, changePercent: -0.94, volume: 678901, marketCap: 340000000000, currency: "USD" },
          { symbol: "IBM/USD", name: "International Business Machines", price: 145.90, change: 2.10, changePercent: 1.46, volume: 234567, marketCap: 130000000000, currency: "USD" },
          { symbol: "INTC/USD", name: "Intel Corporation", price: 35.25, change: -0.75, changePercent: -2.08, volume: 3456789, marketCap: 145000000000, currency: "USD" },
          { symbol: "AMD/USD", name: "Advanced Micro Devices", price: 125.40, change: 4.60, changePercent: 3.81, volume: 4567890, marketCap: 200000000000, currency: "USD" },
          { symbol: "CSCO/USD", name: "Cisco Systems Inc.", price: 48.75, change: 0.85, changePercent: 1.77, volume: 1234567, marketCap: 200000000000, currency: "USD" },
          { symbol: "QCOM/USD", name: "QUALCOMM Incorporated", price: 125.60, change: -2.40, changePercent: -1.87, volume: 2345678, marketCap: 140000000000, currency: "USD" },
          { symbol: "TXN/USD", name: "Texas Instruments", price: 165.30, change: 3.20, changePercent: 1.98, volume: 345678, marketCap: 150000000000, currency: "USD" },
          { symbol: "AVGO/USD", name: "Broadcom Inc.", price: 485.90, change: 8.10, changePercent: 1.69, volume: 234567, marketCap: 200000000000, currency: "USD" },
          { symbol: "MU/USD", name: "Micron Technology Inc.", price: 85.45, change: -1.55, changePercent: -1.78, volume: 4567890, marketCap: 95000000000, currency: "USD" },
          { symbol: "LRCX/USD", name: "Lam Research Corporation", price: 485.75, change: 12.25, changePercent: 2.59, volume: 234567, marketCap: 65000000000, currency: "USD" }
        ];

        // Generar más datos mock para simular las 97,507 acciones
        const generateMoreStocks = () => {
          const companies = [
            "Johnson & Johnson", "Procter & Gamble", "JPMorgan Chase", "Bank of America", "Wells Fargo",
            "Verizon", "AT&T", "Coca-Cola", "PepsiCo", "Walmart", "Home Depot", "Disney", "McDonald's",
            "Visa", "Mastercard", "PayPal", "Square", "Zoom", "Slack", "Spotify", "Uber", "Lyft",
            "Airbnb", "DoorDash", "Palantir", "Snowflake", "Datadog", "CrowdStrike", "Okta", "Twilio"
          ];
          
          const additionalStocks = [];
          for (let i = 0; i < 200; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const symbol = `${company.split(' ')[0].substring(0, 4).toUpperCase()}/USD`;
            const price = Math.random() * 500 + 10;
            const change = (Math.random() - 0.5) * 20;
            const changePercent = (change / price) * 100;
            
            additionalStocks.push({
              symbol,
              name: company,
              price: parseFloat(price.toFixed(2)),
              change: parseFloat(change.toFixed(2)),
              changePercent: parseFloat(changePercent.toFixed(2)),
              volume: Math.floor(Math.random() * 1000000) + 100000,
              marketCap: Math.floor(Math.random() * 1000000000000) + 10000000000,
              currency: "USD"
            });
          }
          return additionalStocks;
        };

        const allStocks = [...mockStocks, ...generateMoreStocks()];

        // Filtrar por query si existe
        let filteredStocks = allStocks;
        if (query) {
          const queryLower = query.toLowerCase();
          filteredStocks = allStocks.filter(stock => 
            stock.name.toLowerCase().includes(queryLower) || 
            stock.symbol.toLowerCase().includes(queryLower)
          );
        }

        // Simular paginación
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = filteredStocks.slice(startIndex, endIndex);
        const totalElements = filteredStocks.length;
        const totalPages = Math.ceil(totalElements / size);
        const isLast = page >= totalPages - 1;

        resolve({
          content,
          last: isLast,
          number: page,
          totalPages,
          totalElements
        });
      }, MOCK_DELAY);
    });
  }
};

// 🔧 SERVICIO HÍBRIDO: Real para búsqueda y detalles, Mock para el resto
const hybridInvestService = {
  // Usar mock para dashboard
  getInvestmentsDashboard: mockInvestService.getInvestmentsDashboard,
  
  // ✅ USAR ENDPOINT REAL para detalles de inversión
  getInvestmentDetail: realInvestService.getInvestmentDetail,
  
  // ✅ USAR ENDPOINTS REALES para compra/venta
  buyStock: realInvestService.buyStock,
  sellStock: realInvestService.sellStock,
  
  // ✅ USAR ENDPOINT REAL para búsqueda
  searchStocks: realInvestService.searchStocks
};

// Exportar el servicio apropiado según la configuración
export default USE_MOCK_DATA ? hybridInvestService : realInvestService; 