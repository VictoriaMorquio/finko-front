<template>
  <div class="login-view">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo-section">
        <img src="/images/finko-logo.png" alt="Finko" class="logo" />
        <h1 class="app-title">Finko</h1>
        <p class="app-subtitle">Tu compañero financiero inteligente</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="login-form">
        <BaseInput
          v-model="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          required
          autocomplete="email"
          :error-message="errors.email"
        />

        <BaseInput
          v-model="password"
          type="password"
          label="Contraseña"
          placeholder="Tu contraseña"
          required
          autocomplete="current-password"
          :error-message="errors.password"
        />

        <div class="form-actions">
          <BaseButton
            type="submit"
            variant="primary"
            size="large"
            full-width
            :loading="isLoading"
            text="Iniciar Sesión"
          />
        </div>

        <div class="forgot-password">
          <router-link to="/forgot-password" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>
      </form>

      <!-- Error general -->
      <div v-if="generalError" class="error-banner">
        {{ generalError }}
      </div>

      <!-- Enlace a registro -->
      <div class="signup-section">
        <p class="signup-text">
          ¿No tienes cuenta?
          <router-link to="/signup" class="signup-link">Regístrate aquí</router-link>
        </p>
      </div>

      <!-- Demo credentials -->
      <div class="demo-section">
        <p class="demo-title">Credenciales de prueba:</p>
        <p class="demo-info">Email: pedro@finko.com</p>
        <p class="demo-info">Contraseña: 123456</p>
      </div>
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
  } else if (password.value.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  generalError.value = ''
  
  try {
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
      router.push('/learn')
    } else {
      generalError.value = result.error
    }
  } catch (error) {
    generalError.value = 'Error inesperado. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 28px;
  font-weight: bold;
  color: #2196F3;
  margin-bottom: 8px;
}

.app-subtitle {
  color: #666666;
  font-size: 16px;
  margin-bottom: 0;
}

.login-form {
  margin-bottom: 20px;
}

.form-actions {
  margin: 24px 0;
}

.forgot-password {
  text-align: center;
  margin-top: 16px;
}

.forgot-link {
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
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

.signup-section {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #E0E0E0;
}

.signup-text {
  color: #666666;
  font-size: 14px;
}

.signup-link {
  color: #2196F3;
  text-decoration: none;
  font-weight: 500;
}

.signup-link:hover {
  text-decoration: underline;
}

.demo-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
}

.demo-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.demo-info {
  font-size: 13px;
  color: #666;
  margin: 2px 0;
  font-family: monospace;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .app-title {
    font-size: 24px;
  }
}
</style> 