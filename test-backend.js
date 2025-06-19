// Script de prueba para diagnosticar problemas de conexión con el backend
const testBackendConnection = async () => {
  console.log('🔍 Iniciando diagnóstico del backend...');
  
  // 1. Verificar token
  const token = localStorage.getItem('finko_auth_token');
  console.log('1️⃣ Token de autenticación:');
  console.log('- Disponible:', !!token);
  console.log('- Valor:', token ? `${token.substring(0, 30)}...` : 'No hay token');
  
  if (!token) {
    console.error('❌ No hay token de autenticación. Necesitas hacer login primero.');
    return;
  }
  
  // 2. Probar endpoint de lista de inversiones
  console.log('\n2️⃣ Probando endpoint de lista de inversiones...');
  try {
    const listResponse = await fetch('/api/v1/investments/list?page=0&size=5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('- List Status:', listResponse.status);
    console.log('- List Status Text:', listResponse.statusText);
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('- List Error Response:', errorText);
    } else {
      const listData = await listResponse.json();
      console.log('✅ Lista de inversiones OK!');
      console.log('- Datos recibidos:', {
        totalElements: listData.pagination?.totalElements,
        totalPages: listData.pagination?.totalPages,
        sampleInvestment: listData.investments?.[0]
      });
    }
    
  } catch (error) {
    console.error('❌ Error en lista de inversiones:', error);
  }
  
  // 3. Probar endpoint de búsqueda de inversiones
  console.log('\n3️⃣ Probando endpoint de búsqueda de inversiones...');
  try {
    const searchResponse = await fetch('/api/v1/investments/search?q=AAPL&limit=5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('- Search Status:', searchResponse.status);
    console.log('- Search Status Text:', searchResponse.statusText);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('- Search Error Response:', errorText);
    } else {
      const searchData = await searchResponse.json();
      console.log('✅ Búsqueda de inversiones OK!');
      console.log('- Datos recibidos:', {
        totalResults: searchData.investments?.length,
        sampleInvestment: searchData.investments?.[0]
      });
    }
    
  } catch (error) {
    console.error('❌ Error en búsqueda de inversiones:', error);
  }
  
  // 4. Probar endpoint de autenticación (debería funcionar)
  console.log('\n4️⃣ Probando endpoint de autenticación...');
  try {
    const authResponse = await fetch('/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('- Auth Status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Autenticación OK:', authData.username);
    } else {
      console.error('❌ Error de autenticación');
    }
    
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
  }
};

// Ejecutar si se llama desde la consola del navegador
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
  console.log('🚀 Script de prueba cargado. Ejecuta: testBackendConnection()');
}

export default testBackendConnection; 