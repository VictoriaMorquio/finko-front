# Integración Frontend-Backend

## Configuración

### Cambiar entre Mocks y API Real

Para alternar entre el modo de desarrollo (mocks) y la API real del backend, edita el archivo `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://localhost:8443', // URL de tu backend Spring Boot
  USE_MOCK_DATA: false, // ⬅️ Cambiar a false para usar API real
  // ...
}
```

### Estados de Implementación

#### ✅ **COMPLETAMENTE IMPLEMENTADO** (Listo para usar API real)

**Autenticación:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/signup` - Registro de usuario  
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener perfil actual
- `PUT /auth/me` - Actualizar perfil
- `PUT /auth/me/password` - Cambiar contraseña
- `POST /auth/password-reset` - Solicitar reset de contraseña
- `POST /auth/password-reset/confirm` - Confirmar nueva contraseña
- `PUT /auth/me/profile-pic` - Subir foto de perfil
- `DELETE /auth/me/account` - Eliminar cuenta

**Soporte:**
- `POST /support/contact` - Contactar soporte
- `GET /support/contact-info` - Info de contacto

#### 🚧 **MANTIENE MOCKS** (Backend no implementado)

- Sistema de aprendizaje (lecciones, quizzes, progreso)
- Sistema de inversiones (portfolio, transacciones)
- Chat/asistente IA
- Logros/achievements 
- Configuraciones de usuario

## Uso

### Modo Desarrollo (Mocks)
```javascript
// src/config/api.js
USE_MOCK_DATA: true
```
- No requiere backend ejecutándose
- Datos simulados predefinidos
- Ideal para desarrollo frontend

### Modo Producción (API Real)
```javascript
// src/config/api.js  
USE_MOCK_DATA: false
```
- Requiere backend Spring Boot en `https://localhost:8443`
- Funcionalidad completa para auth y perfil
- Resto de funciones seguirán usando mocks hasta implementarse

## Estructura de Archivos

```
src/
├── api/
│   ├── httpClient.js      # Cliente HTTP base con JWT
│   ├── authService.js     # Servicio híbrido auth (mock/real)
│   ├── profileService.js  # Servicio híbrido perfil (mock/real)
│   ├── learnService.js    # Solo mocks (pendiente backend)
│   ├── investService.js   # Solo mocks (pendiente backend)
│   └── chatService.js     # Solo mocks (pendiente backend)
├── config/
│   └── api.js             # Configuración central
└── ...
```

## Token JWT

El sistema maneja automáticamente:
- ✅ Almacenamiento en `localStorage` como `finko_auth_token`
- ✅ Inclusión en headers `Authorization: Bearer <token>`
- ✅ Limpieza automática al hacer logout
- ✅ Manejo de errores de autenticación

## Próximos Pasos

1. **Asegurar que el backend esté ejecutándose** en `https://localhost:8443`
2. **Cambiar configuración** a `USE_MOCK_DATA: false`
3. **Probar endpoints implementados** (auth, perfil, soporte)
4. **Gradualmente implementar** resto de funcionalidades en backend
5. **Ir cambiando servicios** de mock a real conforme se implementen

## Solución de Problemas

### Error CORS
Si tienes problemas de CORS, asegúrate de que el backend permita requests desde `http://localhost:5173`

### Certificado SSL
Como el backend usa HTTPS con `localhost:8443`, es probable que uses un certificado auto-firmado. En desarrollo:
- El navegador puede mostrar advertencias de seguridad
- Acepta el certificado en el navegador visitando directamente `https://localhost:8443`
- O configura tu navegador para aceptar certificados de localhost

### Token Inválido
Si obtienes errores 401, verifica:
- El token se está enviando correctamente
- El backend está validando el JWT apropiadamente
- No hay problemas de expiración

### Endpoints No Encontrados
Verifica que:
- El backend esté ejecutándose en el puerto correcto (8443)
- Los endpoints estén implementados según el contrato OpenAPI
- La URL base sea correcta en `api.js` 