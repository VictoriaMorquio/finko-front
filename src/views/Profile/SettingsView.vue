<template>
  <div class="settings-page-container">
    <PageHeader
        title="Ajustes"
        :show-back="true"
        :back-route="{ name: 'Profile' }"
        bg-color="#FFFFFF"
    />

    <main class="settings-content">
      <section class="settings-section">
        <h2 class="settings-section-title">Cuenta</h2>
        <div class="settings-item" @click="handleLogout">
          Cerrar Sesión
          <span class="arrow-icon">→</span>
        </div>
        <div class="settings-item" @click="handleDeleteAccount">
          Eliminar cuenta
          <span class="arrow-icon" style="color: #D32F2F;">→</span> <!-- Icono rojo para acción destructiva -->
        </div>
      </section>

      <section class="settings-section">
        <h2 class="settings-section-title">Soporte</h2>
        <div class="settings-item" @click="contactSupport">
          Contacta con nosotros
          <span class="arrow-icon">→</span>
        </div>
      </section>
       <p v-if="profileStore.error" class="error-message" style="padding: 0 20px;">{{ profileStore.error }}</p>
       <p v-if="message" class="success-message" style="padding: 0 20px;">{{ message }}</p>
    </main>

    <!-- BottomNavigationBar es global y se muestra aquí porque está en las rutas con Nav -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useProfileStore } from '@/stores/profile';
import PageHeader from '@/components/common/PageHeader.vue';

const profileStore = useProfileStore();
const message = ref('');

const handleLogout = async () => {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    profileStore.error = null;
    message.value = '';
    try {
        await profileStore.logoutUser();
        // La redirección a Login la maneja el authStore
    } catch(e) {
        // El error se muestra a través de profileStore.error
    }
  }
};

const handleDeleteAccount = async () => {
  if (confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
    if(confirm("Confirmación final: ¿Realmente deseas eliminar tu cuenta de forma permanente?")) {
      profileStore.error = null;
      message.value = '';
      try {
        await profileStore.deleteAccount();
         // La redirección a Login la maneja el authStore
      } catch(e) {
        // El error se muestra
      }
    }
  }
};

const contactSupport = async () => {
    profileStore.error = null;
    message.value = '';
    // Aquí podrías abrir un modal para escribir el mensaje o redirigir a un formulario
    // Por ahora, una simulación simple:
    try {
        const response = await profileStore.contactSupport({ subject: "Ayuda General", body: "Necesito ayuda con..." });
        message.value = response.message || "Redirigiendo a la página de contacto (simulación).";
        // alert("Redirigiendo a la página de contacto (simulación).");
    } catch (e) {
        // error ya manejado por el store
    }
};
</script>

<style scoped>
/* Estilos de ajustes.html */
.settings-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* App.vue aplica background #F8F9FA si route.name es 'Settings' */
}

/* PageHeader maneja la cabecera, pero necesitamos bgColor="#FFFFFF" para los items */

.settings-content {
  padding: 20px 0; /* Sin padding lateral aquí, se aplica a los items/títulos */
  flex-grow: 1;
}

.settings-section {
  margin-bottom: 20px;
}
.settings-section:last-of-type {
    margin-bottom: 0;
}


.settings-section-title {
  font-size: 18px;
  font-weight: bold;
  color: #111111;
  padding: 15px 20px 10px;
  text-align: left;
  background-color: transparent; /* El fondo de la página ya es #F8F9FA */
}
.settings-section:first-child .settings-section-title {
  padding-top: 0;
}

.settings-item {
  background-color: #FFFFFF; /* Items siempre blancos */
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 16px;
  color: #212121;
  font-weight: 500;
}
/* Para el primer item de la sección (si el título está encima y no es parte del bloque blanco) */
.settings-section > .settings-item:first-of-type {
    /* border-top: 1px solid #F0F0F0; si se quiere separar del título */
}
.settings-section > .settings-item:last-of-type {
  border-bottom: none;
}

.settings-item:hover {
  background-color: #F5F5F5;
}

.settings-item .arrow-icon {
  font-size: 20px;
  color: #BDBDBD;
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
  text-align: center;
  margin-top: 10px;
}

@media (max-width: 360px) {
  /* PageHeader tiene su media query */
  .settings-section-title { font-size: 17px; }
  .settings-item { font-size: 15px; padding: 16px 20px; }
}
</style> 