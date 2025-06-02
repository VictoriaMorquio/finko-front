<template>
  <div id="app-container" :class="pageSpecificBackgroundClass">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <BottomNavigationBar v-if="showBottomNav" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BottomNavigationBar from '@/components/layout/BottomNavigationBar.vue';

const route = useRoute();
const authStore = useAuthStore();

// Inicializar autenticación al cargar la app
onMounted(async () => {
  await authStore.initializeAuth();
});

const routesWithoutNav = [
  'Login', 'Signup', 'ForgotPasswordEmail', 'ForgotPasswordNew',
  'BuyStock', 'SellStock',
  'LevelIntro', 'LessonContent', 'LessonQuiz', 'TrueFalseStep', 'DragDropStep',
  'LevelCompleted'
];

const showBottomNav = computed(() => {
  return route.name && !routesWithoutNav.includes(route.name);
});

const pageSpecificBackgroundClass = computed(() => {
  if (route.name === 'Settings') {
    return 'bg-settings-page';
  }
  return '';
});
</script>

<style>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}

#app-container:has(.bottom-nav) {
  padding-bottom: 70px;
}

.bg-settings-page {
  background-color: #F8F9FA;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 