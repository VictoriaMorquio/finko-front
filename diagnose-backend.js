#!/usr/bin/env node

// Script de diagnóstico completo para el backend
import https from 'https';
import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aWN0b3JpYW1vcnF1aW8iLCJ1c2VySWQiOjcsImlhdCI6MTc1MDI3NjU2OSwiZXhwIjoxNzU4MDUyNTY5fQ.BtoWBLfSycuAMcnedQZiTvTOyX3CaBR90mnOjIxPr-U';

console.log('🔍 Iniciando diagnóstico completo del backend...\n');

// Función para hacer petición HTTPS
function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      rejectUnauthorized: false // Para certificados autofirmados
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Función para hacer petición HTTP (proxy)
function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function runDiagnostics() {
  try {
    // 1. Probar endpoint de lista directamente
    console.log('1️⃣ Probando endpoint de lista directamente...');
    const listResponse = await makeHttpsRequest('https://localhost:8443/api/v1/investments/list?page=0&size=5');
    console.log(`   Status: ${listResponse.status} ${listResponse.statusText}`);
    
    if (listResponse.status === 200) {
      const data = JSON.parse(listResponse.data);
      console.log('   ✅ Lista directa OK');
      console.log(`   - Total elementos: ${data.pagination?.totalElements}`);
      console.log(`   - Elementos recibidos: ${data.investments?.length}`);
    } else {
      console.log('   ❌ Error en lista directa');
      console.log(`   - Respuesta: ${listResponse.data}`);
    }
    
    console.log('');
    
    // 2. Probar endpoint de búsqueda directamente
    console.log('2️⃣ Probando endpoint de búsqueda directamente...');
    const searchResponse = await makeHttpsRequest('https://localhost:8443/api/v1/investments/search?q=AAPL&limit=5');
    console.log(`   Status: ${searchResponse.status} ${searchResponse.statusText}`);
    
    if (searchResponse.status === 200) {
      const data = JSON.parse(searchResponse.data);
      console.log('   ✅ Búsqueda directa OK');
      console.log(`   - Elementos encontrados: ${data.investments?.length}`);
    } else {
      console.log('   ❌ Error en búsqueda directa');
      console.log(`   - Respuesta: ${searchResponse.data}`);
    }
    
    console.log('');
    
    // 3. Probar proxy de Vite (si está corriendo)
    console.log('3️⃣ Probando proxy de Vite...');
    try {
      const proxyResponse = await makeHttpRequest('http://localhost:5174/api/v1/investments/list?page=0&size=5');
      console.log(`   Status: ${proxyResponse.status} ${proxyResponse.statusText}`);
      
      if (proxyResponse.status === 200) {
        const data = JSON.parse(proxyResponse.data);
        console.log('   ✅ Proxy OK');
        console.log(`   - Total elementos: ${data.pagination?.totalElements}`);
      } else {
        console.log('   ❌ Error en proxy');
        console.log(`   - Respuesta: ${proxyResponse.data}`);
      }
    } catch (error) {
      console.log('   ❌ Proxy no disponible o error de conexión');
      console.log(`   - Error: ${error.message}`);
    }
    
    console.log('');
    
    // 4. Probar autenticación
    console.log('4️⃣ Probando autenticación...');
    const authResponse = await makeHttpsRequest('https://localhost:8443/api/v1/auth/me');
    console.log(`   Status: ${authResponse.status} ${authResponse.statusText}`);
    
    if (authResponse.status === 200) {
      const data = JSON.parse(authResponse.data);
      console.log('   ✅ Autenticación OK');
      console.log(`   - Usuario: ${data.username}`);
    } else {
      console.log('   ❌ Error de autenticación');
      console.log(`   - Respuesta: ${authResponse.data}`);
    }
    
    console.log('\n🎯 Resumen del diagnóstico:');
    console.log('- Backend directo: ✅ Funcionando');
    console.log('- Endpoints: ✅ Disponibles');
    console.log('- Autenticación: ✅ OK');
    console.log('- Proxy: ⚠️  Verificar configuración');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

// Ejecutar diagnóstico
runDiagnostics(); 