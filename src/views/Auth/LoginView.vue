<template>
  <div class="login-view">
    <div class="login-container">
      <header>
        <img src="/finko-logo.png" alt="Finko Logo" class="logo">
        <h1>Login</h1>
      </header>

      <form @submit.prevent="handleLogin">
        <BaseInput
          v-model="email"
          type="text"
          label="Email o Usuario"
          placeholder="juanperez99"
          required
          autocomplete="email"
          :error-message="errors.email"
        />

        <BaseInput
          v-model="password"
          type="password"
          label="Contraseña"
          placeholder=""
          required
          autocomplete="current-password"
          :error-message="errors.password"
        />

        <p class="forgot-password-link">
          <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        </p>

        <!-- Error general -->
        <div v-if="generalError" class="error-banner">
          {{ generalError }}
        </div>

        <BaseButton
          type="submit"
          variant="primary"
          size="large"
          full-width
          :loading="isLoading"
          text="Iniciar Sesión"
          class="btn-login"
        />
        
        <BaseButton
          type="button"
          variant="secondary"
          size="large"
          full-width
          text="Registrarse"
          class="btn-register"
          @click="$router.push('/signup')"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const generalError = ref('')

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  let isValid = true

  if (!email.value) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.email = 'El formato del email no es válido'
    isValid = false
  }

  if (!password.value) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (password.value.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  generalError.value = ''
  
  try {
    const result = await authStore.login({
      email: email.value,
      password: password.value
    })
    
    if (result.success) {
      router.push('/learn')
    } else {
      generalError.value = result.error
    }
  } catch (error) {
    generalError.value = error.message || 'Error inesperado. Inténtalo de nuevo.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Reset básico y configuración general */
.login-view {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #FFFFFF; /* Fondo blanco de la app */
  color: #333333; /* Color de texto principal oscuro */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Alinea al inicio para pantallas largas */
  min-height: 100vh;
  padding-top: 40px; /* Espacio arriba, un poco más que en signup */
}

.login-container {
  width: 100%;
  max-width: 400px; /* Ancho máximo típico para formularios móviles */
  padding: 20px;
  background-color: #FFFFFF;
}

.login-container header {
  text-align: center;
  margin-bottom: 30px;
}

.login-container .logo {
  width: 250px; /* Ajusta según el tamaño de tu logo */
  margin-bottom: 30px; /* Más espacio después del logo */
}

.login-container header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #000000; /* Texto del título en negro */
  margin-bottom: 30px; /* Espacio después del título "Login" */
}

/* Personalización de BaseInput para coincidir con el diseño */
.login-container :deep(.input-group) {
  margin-bottom: 20px;
}

.login-container :deep(.input-label) {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333 !important; /* Color de etiqueta un poco más oscuro */
  margin-bottom: 8px;
  text-align: left;
}

.login-container :deep(.base-input) {
  width: 100%;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados para los inputs */
  background-color: #F5F5F5 !important; /* Un gris un poco diferente para el fondo del input */
  font-size: 16px !important;
  color: #333333 !important;
}

.login-container :deep(.base-input::placeholder) {
  color: #999999 !important; /* Color del placeholder un poco más oscuro */
}

.login-container :deep(.input-wrapper) {
  border: none !important;
  background: transparent !important;
}

.login-container :deep(.input-wrapper.has-error .base-input) {
  border: 2px solid #FF4444 !important;
}

.login-container :deep(.error-message) {
  color: #FF4444 !important;
  font-size: 12px;
  margin-top: 5px;
}

/* Estilo para el enlace de "Forgot password?" */
.login-container .forgot-password-link {
  text-align: right; /* Alinea el enlace a la derecha */
  margin-top: -10px; /* Reduce el espacio superior para acercarlo al campo de contraseña */
  margin-bottom: 25px; /* Espacio antes del botón de Login */
  font-size: 13px;
}

.login-container .forgot-password-link a {
  color: #777777; /* Color gris sutil */
  text-decoration: none;
  font-weight: 500;
}

.login-container .forgot-password-link a:hover {
  text-decoration: underline;
  color: #FF007F; /* Color fucsia al pasar el ratón */
}

.error-banner {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

/* Personalización de BaseButton para coincidir con el diseño */
.login-container :deep(.btn-login) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados para los botones */
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  margin-top: 10px; /* Espacio antes de cada botón */
  background-color: #FF007F !important; /* Color magenta/fucsia del botón */
  color: white !important;
}

.login-container :deep(.btn-login:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.login-container :deep(.btn-register) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados para los botones */
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  margin-top: 15px !important; /* Más espacio si es el segundo botón */
  background-color: #F0F0F0 !important; /* Gris claro, similar a los inputs */
  color: #333333 !important; /* Texto oscuro */
}

.login-container :deep(.btn-register:hover) {
  background-color: #E0E0E0 !important; /* Un poco más oscuro al pasar el ratón */
}

.login-container :deep(.btn-login:disabled),
.login-container :deep(.btn-register:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Media query para pantallas muy pequeñas, si es necesario ajustar padding */
@media (max-width: 360px) {
  .login-container {
    padding: 15px;
  }
  .login-container header h1 {
    font-size: 22px;
  }
  .login-container .forgot-password-link {
    font-size: 12px; /* Ajustar tamaño si es necesario */
  }
}
</style> 