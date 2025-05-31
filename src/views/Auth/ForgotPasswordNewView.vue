<template>
  <div class="forgot-password-page">
    <div class="container">
      <div class="logo-container">
        <img src="/finko-logo.png" alt="Logo de Finko" class="logo-image">
      </div>

      <h1 class="title">Restablece tu contraseña</h1>

      <form @submit.prevent="handleConfirmNewPassword">
        <BaseInput
          id="new_password"
          v-model="form.newPassword"
          label="Nueva contraseña"
          type="password"
          name="new_password"
          class="reset-password-input-style"
          required
        />
        <BaseInput
          id="confirm_password"
          v-model="form.confirmPassword"
          label="Confirma contraseña"
          type="password"
          name="confirm_password"
          class="reset-password-input-style"
          required
        />
        <p v-if="passwordMismatch" class="error-message" style="text-align:left;">Las contraseñas no coinciden.</p>

        <BaseButton type="submit" :disabled="authStore.loading || passwordMismatch" variant="primary" full-width style="margin-top: 10px;">
          {{ authStore.loading ? 'Confirmando...' : 'Confirmar' }}
        </BaseButton>
      </form>
      <p v-if="message" class="success-message">{{ message }}</p>
      <p v-if="authStore.error" class="error-message" style="text-align:center;">{{ authStore.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const authStore = useAuthStore();
const form = ref({
  newPassword: '',
  confirmPassword: '',
});
const message = ref('');
const token = route.params.token; // Obtener token de la URL

const passwordMismatch = computed(() => {
  return form.value.newPassword && form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword;
});

const handleConfirmNewPassword = async () => {
  if (passwordMismatch.value) return;
  message.value = '';
  authStore.error = null;
  try {
    const responseMessage = await authStore.confirmNewPassword(token, form.value.newPassword);
    message.value = responseMessage + " Serás redirigido a Login.";
    // La redirección a Login ya la maneja el store si es exitoso.
  } catch (error) {
    // El error lo maneja el store
  }
};
</script>

<style scoped>
/* Estilos de restablecer-contraseña-nueva.html (similares al anterior) */
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
/* BaseInput usa 'reset-password-input-style' */
/* BaseButton usa variant 'finko-signup' */
</style> 