<template>
  <div class="profile-page-container">
    <PageHeader
        title="Perfil"
        :show-settings="true"
        @right-action-clicked="navigateToSettings"
    />

    <div v-if="profileStore.isLoading && !user" class="loading-spinner">Cargando perfil...</div>
    <div v-else-if="profileStore.hasError && !user" class="error-message-fullpage">Error al cargar perfil.</div>

    <template v-if="user">
        <section class="user-info-section">
        <div class="profile-picture-container">
            <img :src="user.profilePic || '/images/profile-pic-default.png'" :alt="`Foto de perfil de ${user.username}`" class="profile-picture">
        </div>
        <h2 class="username">@{{ user.username }}</h2>
        <p class="join-date">Se unió en {{ user.joinDate }}</p>
        </section>

        <section class="user-stats-section">
            <StatCard :value="user.stats?.coins.toLocaleString() || '0'" label="Monedas" />
            <StatCard :value="user.stats?.currentStreak || '0'" label="Racha actual" />
            <StatCard :value="user.stats?.levelsCompleted || '0'" label="Niveles completados" />
        </section>

        <section class="achievements-section" v-if="user.achievements && user.achievements.length > 0">
            <h2 class="section-title-profile">Achievements</h2>
            <div class="achievements-carousel horizontal-scroll">
                <AchievementCard
                    v-for="achievement in user.achievements"
                    :key="achievement.id"
                    :title="achievement.title"
                    :image="achievement.image"
                    :bg-color="achievement.bgColor"
                />
            </div>
        </section>

        <div class="edit-profile-button-container">
            <BaseButton variant="finko-save-profile" @click="navigateToEditProfile"> <!-- Reutiliza el estilo del botón de guardar -->
                Editar Perfil
            </BaseButton>
        </div>
    </template>
    <!-- BottomNavigationBar es global -->
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/common/PageHeader.vue';
import StatCard from '@/components/common/StatCard.vue';
import AchievementCard from '@/components/common/AchievementCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const user = computed(() => authStore.currentUser); // Usar directamente del authStore

onMounted(async () => {
    // Si el usuario no está cargado, auth.js (en el beforeEach del router) debería intentar cargarlo.
    // O podríamos forzarlo aquí si es necesario.
    if (!authStore.currentUser && authStore.token) {
        try {
            await authStore.fetchUser();
        } catch (error) {
            console.error("Error fetching user on profile mount:", error)
        }
    }
});

const navigateToSettings = () => {
  router.push({ name: 'Settings' });
};

const navigateToEditProfile = () => {
  router.push({ name: 'EditProfile' });
};

</script>

<style scoped>
/* Estilos de perfil.html */
.profile-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* App.vue ya maneja padding-bottom si la nav bar está */
}

/* PageHeader gestiona la cabecera */

.user-info-section {
  padding: 30px 20px 25px;
  text-align: center;
}

.profile-picture-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 15px auto;
  overflow: hidden;
  background-color: #FBEAE3; /* Color placeholder */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #fff; /* Opcional: borde blanco */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info-section .username {
  font-size: 22px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 5px;
}

.user-info-section .join-date {
  font-size: 14px;
  color: #777777;
}

.user-stats-section {
  display: flex;
  justify-content: space-around;
  gap: 10px; /* Ajusta el espacio entre StatCards */
  padding: 0 20px 30px;
}
/* StatCard es un componente */

.achievements-section {
  padding: 0 0 30px 0; /* No padding-left, el carrusel maneja su propio padding visual */
}
.achievements-section .section-title-profile { /* Nombre específico para evitar colisiones */
  font-size: 22px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
  text-align: left;
  padding-left: 20px; /* Padding solo para el título de la sección */
}
.achievements-carousel {
  /* .horizontal-scroll ya está en main.css */
  padding-left: 20px; /* Para que el primer elemento no pegue al borde */
  padding-right: 20px; /* Para que el último elemento tenga espacio */
}
/* AchievementCard es un componente */
/* Sus colores de fondo se pasan como props. Ejemplo de los HTML originales:
.achievement-card:nth-child(1) { background-color: #FCE9BF; }
.achievement-card:nth-child(2) { background-color: #FADBC5; }
.achievement-card:nth-child(3) { background-color: #F0F0F0; }
Esto se manejará en el mockData para los achievements.
*/

.edit-profile-button-container {
  padding: 10px 20px 30px; /* No considerar el espacio para nav bar aquí, App.vue lo hace */
}
/* BaseButton maneja el estilo .btn-edit-profile (usar variant finko-save-profile) */

.loading-spinner, .error-message-fullpage {
    text-align: center;
    padding: 50px 20px;
    font-size: 18px;
    color: #555;
}
.error-message-fullpage {
    color: red;
}


@media (max-width: 360px) {
  .profile-picture-container { width: 100px; height: 100px; }
  .user-info-section .username { font-size: 20px; }
  .achievements-section .section-title-profile { font-size: 20px; }
  /* StatCard y AchievementCard tienen sus media queries */
}
</style> 