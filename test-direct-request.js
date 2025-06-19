// Script para probar peticiones directas al backend
const testDirectRequest = async () => {
  console.log('🔍 Probando petición directa al backend...');
  
  const token = localStorage.getItem('finko_auth_token');
  if (!token) {
    console.error('❌ No hay token disponible');
    return;
  }
  
  // Probar petición directa (sin proxy)
  try {
    console.log('1️⃣ Probando petición directa a https://localhost:8443...');
    const directResponse = await fetch('https://localhost:8443/api/v1/investments/list?page=0&size=5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('- Direct Status:', directResponse.status);
    console.log('- Direct URL:', directResponse.url);
    
    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log('✅ Petición directa exitosa!');
      console.log('- Datos:', data);
    } else {
      console.error('❌ Error en petición directa');
    }
    
  } catch (error) {
    console.error('❌ Error en petición directa:', error);
  }
  
  // Probar petición a través del proxy
  try {
    console.log('\n2️⃣ Probando petición a través del proxy...');
    const proxyResponse = await fetch('/api/v1/investments/list?page=0&size=5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('- Proxy Status:', proxyResponse.status);
    console.log('- Proxy URL:', proxyResponse.url);
    
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      console.log('✅ Petición proxy exitosa!');
      console.log('- Datos:', data);
    } else {
      console.error('❌ Error en petición proxy');
    }
    
  } catch (error) {
    console.error('❌ Error en petición proxy:', error);
  }
};

// Hacer disponible en la consola
if (typeof window !== 'undefined') {
  window.testDirectRequest = testDirectRequest;
  console.log('🚀 Script de petición directa cargado. Ejecuta: testDirectRequest()');
}

export default testDirectRequest; 