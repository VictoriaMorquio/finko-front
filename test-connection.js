// Script de prueba para verificar conexión con el backend
const testBackendConnection = async () => {
  try {
    console.log('🔍 Probando conexión con el backend...');
    
    const response = await fetch('/api/v1/investments/list?page=0&size=5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aWN0b3JpYW1vcnF1aW8iLCJ1c2VySWQiOjcsImlhdCI6MTc1MDI3NjU2OSwiZXhwIjoxNzU4MDUyNTY5fQ.BtoWBLfSycuAMcnedQZiTvTOyX3CaBR90mnOjIxPr-U'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Conexión exitosa!');
    console.log('📊 Datos recibidos:', {
      totalElements: data.pagination?.totalElements,
      totalPages: data.pagination?.totalPages,
      sampleInvestment: data.investments?.[0]
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    throw error;
  }
};

// Ejecutar prueba si se llama directamente
if (typeof window !== 'undefined') {
  window.testBackendConnection = testBackendConnection;
}

export default testBackendConnection; 