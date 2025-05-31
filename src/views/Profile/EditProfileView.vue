<template>
  <div class="edit-profile-page">
    <PageHeader
        title="Edit profile"
        :show-close="true"
        :back-route="{ name: 'Profile' }"
    />

    <main class="profile-form-section" v-if="form">
      <div class="profile-picture-container-edit">
        <img :src="authStore.currentUser?.profilePic || '/images/profile-pic-default.png'" alt="Foto de perfil" class="profile-picture-edit">
        <!-- Lógica para cambiar foto no implementada en este mock básico -->
      </div>
      <p class="username-display">@{{ authStore.currentUser?.username }}</p>

      <form id="editProfileForm" @submit.prevent="handleSaveProfile">
        <BaseInput
          id="username"
          v-model="form.username"
          label="Usuario"
          name="username"
          required
        />
        <BaseInput
          id="email"
          v-model="form.email"
          label="Email"
          type="email"
          name="email"
          required
        />
        <BaseInput
          id="name"
          v-model="form.name"
          label="Nombre"
          name="name"
          required
        />
        <!-- Podría añadirse cambio de contraseña aquí o en una sección separada -->
        <p v-if="profileStore.error" class="error-message">{{ profileStore.error }}</p>
      </form>
    </main>
    <div v-else class="loading-spinner">Cargando...</div>


    <footer class="save-button-container">
      <BaseButton type="submit" form="editProfileForm" :disabled="profileStore.isLoading" variant="finko-save-profile">
        {{ profileStore.isLoading ? 'Guardando...' : 'Guardar' }}
      </BaseButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import PageHeader from '@/components/common/PageHeader.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const form = ref(null);

onMounted(() => {
  if (authStore.currentUser) {
    form.value = {
      username: authStore.currentUser.username,
      email: authStore.currentUser.email,
      name: authStore.currentUser.fullname,
    };
  } else {
    // Si el usuario no está cargado, podría ser un error o necesitar carga
    // El router guard debería haber manejado esto.
    router.push({ name: 'Login' });
  }
});

const handleSaveProfile = async () => {
  if (!form.value) return;
  profileStore.error = null; // Limpiar error anterior
  try {
    await profileStore.updateProfile(form.value);
    // alert('Perfil guardado (simulación desde vista)');
    router.push({ name: 'Profile' }); // Volver al perfil
  } catch (error) {
    // El error se maneja en el store y se muestra
  }
};
</script>

<style scoped>
/* Estilos de editar-perfil.html */
.edit-profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}
/* PageHeader maneja la cabecera */

.profile-form-section {
  padding: 30px 20px;
  text-align: center;
  flex-grow: 1;
}

.profile-picture-container-edit {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 10px auto;
  overflow: hidden;
  background-color: #FBEAE3;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.profile-picture-edit {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-form-section .username-display {
  font-size: 18px;
  font-weight: 500;
  color: #111111;
  margin-bottom: 30px;
}

/* BaseInput maneja .form-group, label, input (color de fondo por defecto es el de signup, que es el que usa esta vista) */

.save-button-container {
  padding: 20px 20px 30px;
  background-color: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  position: sticky; /* Se queda abajo */
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
}
/* BaseButton maneja .btn-save-profile (usar variant finko-save-profile) */
.loading-spinner {
    text-align: center;
    padding: 50px 20px;
    font-size: 18px;
    color: #555;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 360px) {
  .profile-picture-container-edit { width: 90px; height: 90px; }
  .profile-form-section .username-display { font-size: 17px; }
  /* BaseInput y BaseButton tienen sus media queries */
}
</style> 