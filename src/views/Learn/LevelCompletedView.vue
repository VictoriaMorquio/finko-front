<template>
  <div class="level-complete-page" v-if="completionData">
    <header class="completion-header">
      <router-link :to="{name: 'LearnDashboard'}" class="close-btn" aria-label="Cerrar">×</router-link>
      <h1>{{ completionData.pageTitle || 'Nivel Completado' }}</h1>
    </header>

    <section class="completion-hero">
      <img :src="completionData.headerImage || '/images/nivelCompletado.png'" alt="¡Nivel completado!" class="celebration-image">
    </section>

    <main class="completion-content">
      <h2 class="congrats-title">{{ completionData.congratsTitle }}</h2>
      <h3 class="level-name">{{ completionData.levelName }}</h3>
      <p class="level-description">{{ completionData.description }}</p>
      <div class="rewards-info" v-if="completionData.rewards">
        <span class="coin-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#D4AF37"/><path d="M12 6C11.54 6 11.08 6.07 10.66 6.2C10.56 6.23 10.47 6.26 10.38 6.3C9.04 6.89 8 8.17 8 9.75C8 11.67 9.48 13.26 11.33 13.47C11.55 13.49 11.77 13.5 12 13.5C12.46 13.5 12.92 13.43 13.34 13.3C13.44 13.27 13.53 13.24 13.62 13.2C14.96 12.61 16 11.33 16 9.75C16 7.83 14.52 6.24 12.67 6.03C12.45 6.01 12.23 6 12 6ZM12 11.5C11.17 11.5 10.5 10.83 10.5 10C10.5 9.17 11.17 8.5 12 8.5C12.83 8.5 13.5 9.17 13.5 10C13.5 10.83 12.83 11.5 12 11.5Z" fill="#E4C462"/><path d="M12 7.5C11.72 7.5 11.5 7.72 11.5 8V10.5H10C9.72 10.5 9.5 10.72 9.5 11C9.5 11.28 9.72 11.5 10 11.5H11.5V12C11.5 12.28 11.72 12.5 12 12.5C12.28 12.5 12.5 12.28 12.5 12V11.5H14C14.28 11.5 14.5 11.28 14.5 11C14.5 10.72 14.28 10.5 14 10.5H12.5V8C12.5 7.72 12.28 7.5 12 7.5Z" fill="#D4AF37"/></svg>
        </span>
        <span class="rewards-text">{{ completionData.rewards.text }}</span>
      </div>
    </main>

    <footer class="completion-footer">
      <BaseButton variant="finko-continue-lesson" @click="continueLearning" full-width>
        Continuar
      </BaseButton>
    </footer>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">Cargando...</div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { useAuthStore } from '@/stores/auth'; // Para actualizar monedas del usuario
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const authStore = useAuthStore();
const levelId = route.params.levelId;

onMounted(() => {
  learnStore.fetchLevelCompletedData(levelId);
});

const completionData = computed(() => learnStore.currentLesson); // Reutilizamos currentLesson

const continueLearning = () => {
  // Actualizar monedas del usuario (UI Optimista)
  if (authStore.currentUser && completionData.value?.rewards?.coins) {
      const currentUserData = JSON.parse(JSON.stringify(authStore.currentUser));
      currentUserData.stats.coins += completionData.value.rewards.coins;
      currentUserData.stats.levelsCompleted +=1;
      // Aquí se haría la llamada a la API para actualizar en backend
      // profileService.updateUserStats(authStore.currentUser.id, { coins: currentUserData.stats.coins, levelsCompleted: currentUserData.stats.levelsCompleted });
      authStore.user = currentUserData; // Actualizar el store local
      localStorage.setItem('finkoUser', JSON.stringify(currentUserData));
  }

  // Navegar al siguiente nivel/dashboard
  router.push({ name: completionData.value?.nextRouteName || 'LearnDashboard' });
};
</script>

<style scoped>
/* Estilos de nivel-completado.html */
.level-complete-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF; /* Asegura fondo blanco si no es el default */
}

.completion-header {
  background-color: #F8F9FA;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid #E9ECEF;
}

.completion-header .close-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28px;
  color: #495057;
  text-decoration: none;
  padding: 5px;
  background: none; border: none; cursor: pointer;
}
.completion-header .close-btn:hover {
  color: #000000;
}

.completion-header h1 {
  font-size: 18px;
  font-weight: 500;
  color: #343A40;
  margin: 0;
}

.completion-hero {
  background-color: #F8F9FA;
  padding: 30px 20px;
  text-align: center;
}

.celebration-image {
  max-width: 200px;
  width: 60%;
  height: auto;
}

.completion-content {
  padding: 30px 25px;
  text-align: center;
  flex-grow: 1;
}

.completion-content .congrats-title {
  font-size: 30px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 15px;
}

.completion-content .level-name {
  font-size: 20px;
  font-weight: bold;
  color: #212121;
  margin-bottom: 10px;
}

.completion-content .level-description {
  font-size: 16px;
  color: #444444;
  margin-bottom: 25px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.rewards-info {
  display: inline-flex; /* Para que se ajuste al contenido */
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #FFF0F5;
  padding: 12px 20px;
  border-radius: 10px;
  max-width: 300px;
  margin: 0 auto 30px auto;
}

.rewards-info .coin-icon {
  width: 24px;
  height: 24px;
}
.rewards-info .coin-icon svg {
  display: block;
  width: 100%;
  height: 100%;
}

.rewards-info .rewards-text {
  font-size: 16px;
  color: #5C3A47;
  font-weight: 500;
}

.completion-footer {
  background-color: #FFFFFF;
  padding: 20px 25px 40px;
  text-align: center;
  border-top: 1px solid #F0F0F0;
  position: sticky;
  bottom: 0;
  z-index: 90;
}
/* BaseButton usa variant finko-continue-lesson (o similar) */
.loading-message, .error-message-centered {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #555;
  height: 100vh; display: flex; justify-content: center; align-items: center;
}
.error-message-centered {
    color: red;
}

@media (max-width: 360px) {
  .completion-header h1 { font-size: 17px; }
  .completion-content .congrats-title { font-size: 28px; }
  .completion-content .level-name { font-size: 18px; }
  .completion-content .level-description { font-size: 15px; }
  .rewards-info .rewards-text { font-size: 15px; }
}
</style> 