import { mockInvestmentsDashboard, mockInvestmentDetails } from "./_mockData";
const MOCK_DELAY = 500;

// Helper para generar datos de gráfica aleatorios
const generateRandomChartData = (numPoints = 12, min = 20, max = 80) => {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return data;
};
const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default {
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
}; 