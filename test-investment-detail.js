// Script de prueba para el endpoint de detalle de inversión
const testInvestmentDetail = async () => {
  const token = localStorage.getItem('finko_auth_token');
  
  if (!token) {
    console.error('❌ No hay token de autenticación');
    return;
  }
  
  console.log('🔍 Probando endpoint de detalle de inversión...');
  console.log('🔑 Token disponible:', token.substring(0, 20) + '...');
  
  // ID de ejemplo (Apple Inc. CEDEAR) - usar el mismo que en el ejemplo
  const investmentId = '8c5d62b7-7b92-444a-9929-d7a771fd2dd2';
  
  try {
    // Probar con intervalo por defecto (1 mes)
    console.log(`\n📊 Probando detalle para inversión: ${investmentId}`);
    
    const url = `https://localhost:8443/api/v1/investments/${investmentId}/details?interval=1month`;
    
    console.log('🌐 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Datos recibidos correctamente');
      console.log('📊 Datos completos:', data);
      
      // Mostrar información específica
      if (data.investment) {
        console.log('🏢 Inversión:', {
          id: data.investment.id,
          name: data.investment.name,
          symbol: data.investment.stockSymbol,
          currentPrice: data.investment.currentPrice,
          priceChange24h: data.investment.priceChange24h
        });
      }
      
      if (data.historicalData) {
        console.log('📈 Datos históricos:', data.historicalData.length, 'puntos');
        console.log('📅 Primer punto:', data.historicalData[0]);
        console.log('📅 Último punto:', data.historicalData[data.historicalData.length - 1]);
      }
      
      console.log('💰 Métricas financieras:', {
        sharesOwned: data.sharesOwned,
        totalInvested: data.totalInvested,
        averageBuyPrice: data.averageBuyPrice,
        currentValue: data.currentValue,
        returnEur: data.returnEur,
        returnPercent: data.returnPercent,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        priceChangePercent: data.priceChangePercent
      });
      
    } else {
      console.error(`❌ Error ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('📄 Respuesta de error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('🔍 Detalles del error:', error.message);
  }
};

// Hacer disponible en la consola del navegador
if (typeof window !== 'undefined') {
  window.testInvestmentDetail = testInvestmentDetail;
  console.log('🧪 Script de prueba cargado. Ejecuta: testInvestmentDetail()');
}

export default testInvestmentDetail; 