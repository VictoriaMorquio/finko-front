<template>
  <div class="signup-page-container">
    <div class="signup-container">
      <header>
        <img src="/finko-logo.png" alt="Finko Logo" class="logo">
        <h1>Crea tu cuenta</h1>
      </header>

      <form id="signupForm" @submit.prevent="handleSignup">
        <BaseInput
          id="email"
          v-model="form.email"
          label="Email"
          type="email"
          name="email"
          placeholder="juanperez@gmail.com"
          required
        />
        <BaseInput
          id="username"
          v-model="form.username"
          label="Elige un nombre de usuario"
          name="username"
          placeholder="juanperez99"
          required
        />
        <BaseInput
          id="fullname"
          v-model="form.fullname"
          label="Nombre Completo"
          name="fullname"
          placeholder="Juan Perez"
          required
        />
        <BaseInput
          id="password"
          v-model="form.password"
          label="Contraseña"
          type="password"
          name="password"
          placeholder="****************"
          required
        />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        <BaseInput
          id="confirm-password"
          v-model="form.confirmPassword"
          label="Confirmar contraseña"
          type="password"
          name="confirm-password"
          placeholder="****************"
          required
        />
        <p v-if="passwordMismatch" class="error-message">Las contraseñas no coinciden.</p>

        <BaseButton 
          type="submit" 
          :disabled="authStore.loading || passwordMismatch || !isFormValid" 
          variant="primary" 
          full-width 
          style="margin-top: 25px;"
          class="btn-signup"
        >
          {{ authStore.loading ? 'Registrando...' : 'Regístrate' }}
        </BaseButton>
        <p v-if="authStore.error" class="error-message" style="text-align: center; margin-top: 10px;">{{ authStore.error }}</p>
      </form>

      <p class="login-link">
        ¿Ya tienes cuenta? <router-link :to="{ name: 'Login' }">Inicia Sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();
const form = ref({
  email: '',
  username: '',
  fullname: '',
  password: '',
  confirmPassword: '',
});

const passwordError = computed(() => {
  if (!form.value.password) return null;
  if (form.value.password.length < 8) {
    return 'La contraseña debe tener entre 8 y 128 caracteres';
  }
  if (form.value.password.length > 128) {
    return 'La contraseña debe tener entre 8 y 128 caracteres';
  }
  return null;
});

const passwordMismatch = computed(() => {
  return form.value.password && form.value.confirmPassword && form.value.password !== form.value.confirmPassword;
});

const isFormValid = computed(() => {
  return form.value.email && 
         form.value.username && 
         form.value.fullname && 
         form.value.password && 
         form.value.confirmPassword && 
         !passwordError.value && 
         !passwordMismatch.value;
});

const handleSignup = async () => {
  if (!isFormValid.value) {
    return;
  }
  await authStore.signup({
    email: form.value.email,
    username: form.value.username,
    fullname: form.value.fullname,
    password: form.value.password,
    confirmPassword: form.value.confirmPassword,
  });
};
</script>

<style scoped>
/* Estilos específicos de signup.html */
.signup-page-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #FFFFFF;
  color: #212121;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 30px;
}

.signup-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #FFFFFF;
}

.signup-container header {
  text-align: center;
  margin-bottom: 25px;
}

.signup-container .logo {
  width: 250px;
  margin-bottom: 20px;
}

.signup-container header h1 {
  font-size: 26px;
  font-weight: bold;
  color: #000000;
}

/* BaseInput maneja .form-group, label, input styles by default */
/* Para este signup, el BaseInput por defecto tiene los colores correctos. */

/* Personalización de BaseButton para coincidir con el botón de login */
.signup-container :deep(.btn-signup) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important; /* Bordes más redondeados */
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important; /* Color magenta/fucsia igual al botón de login */
  color: white !important;
}

.signup-container :deep(.btn-signup:hover:not(:disabled)) {
  background-color: #E60072 !important; /* Un poco más oscuro al pasar el ratón */
}

.signup-container :deep(.btn-signup:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #CCCCCC !important;
}

.signup-container :deep(.btn-signup:not(:disabled)) {
  background-color: #FF007F !important;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #777777;
}

.login-link a {
  color: #FF007F;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-message { /* Para el mensaje de contraseñas no coinciden */
  color: red;
  font-size: 14px;
  text-align: left;
  margin-top: -10px;
  margin-bottom: 15px;
}


@media (max-width: 360px) {
  .signup-container {
    padding: 15px;
  }
  .signup-container header h1 {
    font-size: 24px;
  }
  /* BaseInput y BaseButton ya tienen sus media queries si es necesario */
}
</style> 