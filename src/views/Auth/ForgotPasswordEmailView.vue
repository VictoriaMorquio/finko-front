<template>
  <div class="forgot-password-page">
    <div class="container">
      <div class="logo-container">
        <img src="/finko-logo.png" alt="Logo de Finko" class="logo-image">
      </div>

      <h1 class="title">Restablece tu contraseña</h1>

      <form @submit.prevent="handleRequestReset">
        <BaseInput
          id="email_username"
          v-model="emailOrUsername"
          label="Email or Username"
          name="email_username"
          placeholder="juanperez99"
          class="reset-password-input-style"
          required
        />
        <BaseButton type="submit" :disabled="authStore.loading" variant="primary" full-width style="margin-top: 10px;">
          {{ authStore.loading ? 'Enviando...' : 'Enviar enlace' }}
        </BaseButton>
      </form>
      <p v-if="message" class="success-message">{{ message }}</p>
      <p v-if="authStore.error" class="error-message" style="text-align:center;">{{ authStore.error }}</p>
       <p class="back-to-login">
        <router-link :to="{ name: 'Login' }">Volver a Iniciar Sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const authStore = useAuthStore();
const emailOrUsername = ref('');
const message = ref('');

const handleRequestReset = async () => {
  message.value = '';
  authStore.error = null; // Limpiar error anterior
  try {
    const responseMessage = await authStore.requestPasswordReset(emailOrUsername.value);
    message.value = responseMessage;
  } catch (error) {
    // El error se maneja en el store y se muestra con authStore.error
  }
};
</script>

<style scoped>
/* Estilos de restablecer-contraseña.html */
.forgot-password-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 50px;
}

.container {
  width: 90%;
  max-width: 400px;
  text-align: center;
  padding: 20px;
}

.logo-container {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.logo-image {
  max-width: 200px;
  height: auto;
}

.title {
  font-size: 22px;
  color: #1c1e21;
  font-weight: 600;
  margin-bottom: 35px;
}

/* BaseInput tomará los estilos con la clase 'reset-password-input-style' */
/* El botón usará la variante finko-signup que es rosa */
.back-to-login {
    margin-top: 25px;
    font-size: 14px;
}
.back-to-login a {
    color: #FF007F;
    text-decoration: none;
    font-weight: 500;
}
.back-to-login a:hover {
    text-decoration: underline;
}

.success-message {
  color: #4CAF50;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  margin-top: 10px;
}
</style> 